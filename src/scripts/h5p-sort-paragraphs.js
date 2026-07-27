import SortParagraphsContent from './h5p-sort-paragraphs-content.js';
import Util from './h5p-sort-paragraphs-util.js';
import {
  normalizeCfrdParams,
  getInstructionsOptions,
  scheduleInstructionsAttach,
  scheduleDeferredResize,
  scheduleContextImageAttach,
  scheduleInlineEvaluationLayout,
  setupPlayAreaLayout,
  applyActivityAppearance,
  refreshInstructionsScale,
  getContextLayoutClass,
  hasContextText,
  hasContextImage,
  stripHtmlText,
} from './sort-paragraphs-cfrd-helpers.js';

const VIEW_STATES = { task: 0, results: 1, solutions: 2 };
const DEFAULT_DESCRIPTION = 'SortParagraphs';

/**
 * Sort Paragraphs CFRD 1.0 — H5P.QuestionCFRD (etapa 6: appearance).
 * @param {object} params
 * @param {number} contentId
 * @param {object} [extras]
 * @constructor
 */
function SortParagraphsCFRD(params, contentId, extras) {
  if (!(this instanceof SortParagraphsCFRD)) {
    return new SortParagraphsCFRD(params, contentId, extras);
  }

  H5P.QuestionCFRD.call(this, 'sort-paragraphs-cfrd');

  const self = this;

  extras = extras || {};
  self.contentId = contentId;
  self.extras = extras;

  // Deep-merge like Multi Choice / Single Choice (jQuery), so nested appearance
  // numbers such as textColors.*FontSize are preserved from the editor.
  self.options = H5P.jQuery.extend(true, {}, {
    instructions: {},
    context: {},
    paragraphs: [],
    overallFeedback: {
      popupBackgroundColor: '#ffffff',
      feedbackTextColor: '#333333',
      overallFeedback: [],
    },
    appearance: {},
    behaviour: {
      duplicatesInterchangeable: true,
      enableSolutionsButton: false,
      enableRetry: true,
      scoringMode: 'positions',
      applyPenalties: true,
      addButtonsForMovement: true,
      showScorePoints: false,
    },
    UI: {
      checkAnswerButton: 'Check',
      submitAnswerButton: 'Submit',
      tryAgainButton: 'Retry',
      showSolutionButton: 'Show solution',
      scoreBarLabel: 'You got :num out of :total points',
      feedbackPopupCloseLabel: 'Close',
      showFeedbackButtonLabel: 'Show feedback',
      up: 'Up',
      down: 'Down',
      disabled: 'Disabled',
    },
    a11y: {
      check: 'Check the answers. The responses will be marked as correct or incorrect.',
      showSolution: 'Show the solution. The correct solution will be displayed.',
      retry: 'Retry the task. Reset all elements and start the task over again.',
      yourResult: 'You got @score out of @total points',
      listDescription: 'Sortable list of paragraphs.',
      listDescriptionCheckAnswer: 'List of paragraphs with results.',
      listDescriptionShowSolution: 'List of paragraphs with solutions.',
      paragraph: 'Paragraph',
      sevenOfNine: '@current of @total',
      instructionsSelected: 'Press spacebar to reorder',
      grabbed: 'grabbed',
      currentPosition: 'Current position in list',
      instructionsGrabbed: 'Press up and down arrow keys to change position, spacebar to drop, escape to cancel',
      moved: 'moved',
      dropped: 'dropped',
      finalPosition: 'Final position',
      reorderCancelled: 'Reorder cancelled',
      correct: 'correct',
      wrong: 'wrong',
      point: '@score point',
      nextParagraph: 'Next paragraph',
      correctParagraph: 'Correct paragraph at position',
    },
  }, params);

  normalizeCfrdParams(self.options);
  self.params = self.options;

  self.canStoreState = !Number.isNaN(parseInt(H5PIntegration?.saveFreq));
  self.stateProvider = self.retrieveStateProvider();

  for (const word in self.params.UI) {
    if (typeof self.params.UI[word] === 'string') {
      self.params.UI[word] = Util.stripHTML(Util.htmlDecode(self.params.UI[word]));
    }
  }

  const defaultLanguage = (extras && extras.metadata) ?
    extras.metadata.defaultLanguage || 'en' :
    'en';
  self.languageTag = Util.formatLanguageCode(defaultLanguage);

  self.previousState = (self.extras.previousState && self.extras.previousState.order) ?
    self.extras.previousState :
    null;

  const instructionsPlain = getInstructionsOptions(self) ?
    stripHtmlText(self.params.instructions.text) :
    '';

  self.content = new SortParagraphsContent(
    {
      paragraphs: self.params.paragraphs,
      addButtonsForMovement: self.params.behaviour.addButtonsForMovement,
      duplicatesInterchangeable: self.params.behaviour.duplicatesInterchangeable,
      penalties: self.params.behaviour.applyPenalties,
      scoringMode: self.params.behaviour.scoringMode,
      showScorePoints: self.params.behaviour.showScorePoints === true,
      listLabelPrefix: instructionsPlain,
      previousState: self.previousState,
      a11y: self.params.a11y,
      l10n: {
        up: self.params.UI.up,
        down: self.params.UI.down,
        disabled: self.params.UI.disabled,
      },
      viewStates: VIEW_STATES,
    },
    {
      onInteracted: () => {
        self.handleInteracted();
      },
      read: (text) => {
        self.read(text);
      },
    },
  );

  const getPlayArea = function () {
    return H5P.SortParagraphsCFRD && H5P.SortParagraphsCFRD.PlayArea;
  };
  const PlayArea = getPlayArea();
  self.playAreaSize = PlayArea ? PlayArea.getDesignSize() : null;
  let spResizeRaf = null;

  const clearPlayAreaScaleCache = function () {
    self._spLastScaleKey = null;
    self._spLastMaxHeight = null;
    self._spLastWidth = null;
  };

  const applyPlayAreaScale = function (event) {
    const playAreaApi = getPlayArea();
    const design = self.playAreaSize || (playAreaApi ? playAreaApi.getDesignSize() : null);

    if (!playAreaApi || !design || !self.$playArea || !self.$playArea.length) {
      return;
    }

    const playAreaEl = self.$playArea[0];
    let width = playAreaApi.getMeasureWidth(playAreaEl);

    if (!width || width <= 0) {
      width = design.baseWidth;
    }

    // Height cap only in fullscreen — normal view must not fight iframe auto-height.
    const maxHeightPx = playAreaApi.getPlayAreaMaxHeight(playAreaEl, width);
    const heightForScale = maxHeightPx > 0 ? maxHeightPx : 0;
    const scale = playAreaApi.getScale(width, heightForScale);
    const fontSize = playAreaApi.getScaledFontSize(width, heightForScale) + 'px';
    const scaleKey = scale.toFixed(4);
    const maxHeightCss = maxHeightPx > 0 ? (Math.round(maxHeightPx) + 'px') : '';

    if (
      self._spLastScaleKey === scaleKey &&
      self._spLastMaxHeight === maxHeightCss &&
      self._spLastWidth === width
    ) {
      return;
    }

    self._spLastScaleKey = scaleKey;
    self._spLastMaxHeight = maxHeightCss;
    self._spLastWidth = width;

    self.$playArea.css({
      width: '100%',
      maxWidth: '100%',
      height: '',
      maxHeight: maxHeightCss || 'none',
      fontSize: fontSize,
      '--sp-scale': scaleKey,
    });

    self.$playArea
      .find('.h5p-sp-context-text, .h5p-sort-paragraphs-content')
      .css('fontSize', '');

    const $popup = self.$playArea.find('.h5p-question-feedback.h5p-question-popup');
    $popup.css('fontSize', fontSize);

    if ($popup.length && $popup.hasClass('h5p-question-visible')) {
      setTimeout(function () {
        self.trigger('resize', { repositionOnly: true });
      }, 0);
    }

    refreshInstructionsScale(self);
    applyActivityAppearance(self);

    if (self.content) {
      self.content.resize();
    }
  };

  const originalSetFeedback = self.setFeedback;
  if (typeof originalSetFeedback === 'function') {
    self.setFeedback = function (content, score, maxScore, scoreBarLabel, helpText, popupSettings) {
      const result = originalSetFeedback.apply(self, arguments);
      const isPopup = popupSettings != null &&
        popupSettings.showAsPopup === true &&
        content !== undefined &&
        String(content).trim().length > 0;

      if (self.$container && self.$container.length) {
        scheduleInlineEvaluationLayout(self.$container, self, {
          normalizeInline: !isPopup,
        });
      }

      return result;
    };
  }

  const originalAttach = self.attach;
  self.attach = function ($container) {
    self.$container = $container;
    originalAttach.call(self, $container);
    self.$playArea = setupPlayAreaLayout($container);
    scheduleContextImageAttach(self);
    scheduleInstructionsAttach(self, self.$playArea);

    // Observe parent only — observing the play area while applying max-height loops.
    if (window.ResizeObserver && !self.playAreaResizeObserver && self.$playArea.length) {
      self.playAreaResizeObserver = new ResizeObserver(function () {
        self.trigger('resize');
      });
      const parentEl = self.$playArea.parent()[0];
      if (parentEl) {
        self.playAreaResizeObserver.observe(parentEl);
      }
    }

    scheduleDeferredResize(self);
    applyActivityAppearance(self);
  };

  self.on('enterFullScreen', function () {
    clearPlayAreaScaleCache();
    self.trigger('resize');
  });

  self.on('exitFullScreen', function () {
    clearPlayAreaScaleCache();
    if (self.$playArea && self.$playArea.length) {
      self.$playArea.css('maxHeight', 'none');
    }
    self.trigger('resize');
  });

  self.on('resize', function (event) {
    if (event && event.data && event.data.repositionOnly) {
      return;
    }

    if (!self.$playArea || !self.$playArea.length || !getPlayArea()) {
      if (self.content) {
        self.content.resize();
      }
      return;
    }

    if (!self.$playArea.is(':visible')) {
      scheduleDeferredResize(self);
      return;
    }

    if (spResizeRaf !== null) {
      cancelAnimationFrame(spResizeRaf);
    }

    spResizeRaf = requestAnimationFrame(function () {
      spResizeRaf = requestAnimationFrame(function () {
        spResizeRaf = null;
        applyPlayAreaScale(event);
      });
    });
  });
}

SortParagraphsCFRD.prototype = Object.create(H5P.QuestionCFRD.prototype);
SortParagraphsCFRD.prototype.constructor = SortParagraphsCFRD;
SortParagraphsCFRD.VIEW_STATES = VIEW_STATES;
SortParagraphsCFRD.DEFAULT_DESCRIPTION = DEFAULT_DESCRIPTION;

SortParagraphsCFRD.prototype.registerDomElements = function () {
  const self = this;
  const $ = H5P.jQuery;
  const context = self.params.context;
  const contextLayoutClass = getContextLayoutClass(context);
  const contextTextId = 'sort-paragraphs-' + self.contentId + '-context';
  const $listDom = $(self.content.getDOM());
  let $contextMedia;

  if (contextLayoutClass) {
    const $layout = $('<div>', { class: 'h5p-sp-slide-layout' });
    const $contextAside = $('<aside>', {
      class: 'h5p-sp-context',
      'aria-label': 'Context',
    });
    const $taskColumn = $('<div>', { class: 'h5p-sp-task-column' });

    if (hasContextText(context)) {
      $contextAside.append($('<div>', {
        id: contextTextId,
        class: 'h5p-sp-context-text',
        html: Util.stripInlineFontSize(context.text),
      }));
    }

    if (hasContextImage(context)) {
      $contextMedia = $('<div>', { class: 'h5p-sp-context-media' });
      $contextAside.append($contextMedia);
    }

    $taskColumn.append($listDom);
    $layout.append($contextAside);
    $layout.append($taskColumn);

    self.setContent($('<div>', {
      class: 'h5p-sp-has-context ' + contextLayoutClass,
    }).append($layout), {
      class: 'h5p-sp-with-context',
    });

    if ($contextMedia && $contextMedia.length) {
      self.pendingContextImage = {
        context: context,
        $container: $contextMedia,
      };
    }
  }
  else {
    self.setContent($listDom, {
      class: 'h5p-sp-task-only',
    });
  }

  self.setViewState('task');

  self.previousState = self.previousState ?? {};
  if (
    self.previousState.viewState === VIEW_STATES.results ||
    self.previousState.viewState === VIEW_STATES.solutions
  ) {
    H5P.externalDispatcher.on('initialized', () => {
      self.isExternalCall = true;
      if (self.previousState.viewState === VIEW_STATES.results) {
        self.setViewState('results');
        self.checkAnswer();
      }
      else {
        self.setViewState('solutions');
        self.checkAnswer();
        self.hideButton('show-solution');
        self.showSolutions();
      }
      self.isExternalCall = false;
    });
  }
  else {
    self.previousState.viewState = VIEW_STATES.task;
  }

  self.addButtons();
  self.trigger('resize');
};

SortParagraphsCFRD.prototype.addButtons = function () {
  const self = this;

  self.addButton('check-answer', self.params.UI.checkAnswerButton, () => {
    self.checkAnswer();
  }, true, {
    'aria-label': self.params.a11y.check,
  }, {
    contentData: self.extras,
    textIfSubmitting: self.params.UI.submitAnswerButton,
    icon: 'check',
  });

  self.addButton('show-solution', self.params.UI.showSolutionButton, () => {
    self.hideButton('show-solution');
    self.showSolutions();
  }, false, {
    'aria-label': self.params.a11y.showSolution,
  }, {
    styleType: 'secondary',
    icon: 'show-solutions',
  });

  self.addButton('try-again', self.params.UI.tryAgainButton, () => {
    self.resetTask();
  }, false, {
    'aria-label': self.params.a11y.retry,
  }, {
    styleType: 'secondary',
    icon: 'retry',
  });

  self.addButton('show-feedback', self.params.UI.showFeedbackButtonLabel, () => {
    self.showFeedbackPopup();
    self.hideButton('show-feedback');
  }, false);
  self.hideButton('show-feedback');
};

/**
 * Show overall feedback in a dismissible popup (QuestionCFRD).
 */
SortParagraphsCFRD.prototype.showOverallFeedback = function () {
  const self = this;
  const score = self.getScore();
  const max = self.getMaxScore();
  const ratio = max > 0 ? score / max : 0;
  const resolved = H5P.QuestionCFRD.resolveOverallFeedback(
    self.params.overallFeedback,
    ratio,
    self.contentId,
    score,
    max,
  );
  let popupSettings;

  if (resolved && resolved.html && resolved.html.trim().length > 0) {
    popupSettings = {
      showAsPopup: true,
      closeText: self.params.UI.feedbackPopupCloseLabel || 'Close',
      alwaysShowClose: true,
      dismissible: true,
      popupBackgroundColor: resolved.popupBackgroundColor,
      plainText: resolved.plainText,
      onClose: function () {
        self.showButton('show-feedback');
      },
    };
    self.hideButton('show-feedback');
  }

  self.setFeedback(
    resolved ? resolved.html : '',
    score,
    max,
    self.params.UI.scoreBarLabel,
    false,
    popupSettings,
  );
};

SortParagraphsCFRD.prototype.getAnswerGiven = function () {
  return this.content?.isAnswerGiven() || false;
};

SortParagraphsCFRD.prototype.getScore = function () {
  if (!this.getAnswerGiven()) {
    return 0;
  }

  let score = 0;

  if (!this.content) {
    score = this.previousState?.score || 0;
  }
  else if (this.viewState === VIEW_STATES.solutions) {
    score = this.currentScore || this.previousState?.score || 0;
  }
  else {
    score = (this.content.computeResults()).score;
  }

  this.currentScore = score;

  return score;
};

SortParagraphsCFRD.prototype.getMaxScore = function () {
  const length = this.params.paragraphs.length;
  return (this.params.behaviour.scoringMode === 'positions') ? length : length - 1;
};

SortParagraphsCFRD.prototype.showSolutions = function () {
  this.setViewState('solutions');
  this.content.showSolutions({ skipFocus: this.isExternalCall });
  this.trigger('resize');
};

SortParagraphsCFRD.prototype.resetTask = function () {
  this.showButton('check-answer');
  this.hideButton('show-solution');
  this.hideButton('try-again');
  this.hideButton('show-feedback');
  this.removeFeedback();
  this.content.reset();
  this.previousState = {};
  this.setViewState('task');
  this.trigger('resize');
};

SortParagraphsCFRD.prototype.getXAPIData = function () {
  return { statement: this.getXAPIAnswerEvent().data.statement };
};

SortParagraphsCFRD.prototype.getXAPIAnswerEvent = function () {
  const xAPIEvent = this.createXAPIEvent('answered');

  xAPIEvent.setScoredResult(this.getScore(), this.getMaxScore(), this,
    true, this.isPassed());

  xAPIEvent.data.statement.result.response = this.content.getDraggablesOrder().join('[,]');

  return xAPIEvent;
};

SortParagraphsCFRD.prototype.createXAPIEvent = function (verb) {
  const xAPIEvent = this.createXAPIEventTemplate(verb);
  Util.extend(
    xAPIEvent.getVerifiedStatementValue(['object', 'definition']),
    this.getxAPIDefinition());
  return xAPIEvent;
};

SortParagraphsCFRD.prototype.getxAPIDefinition = function () {
  const definition = {};
  definition.name = {};
  definition.name[this.languageTag] = this.getTitle();
  definition.name['en-US'] = definition.name[this.languageTag];
  definition.description = {};
  definition.description[this.languageTag] = Util.stripHTML(this.getDescription());
  definition.description['en-US'] = definition.description[this.languageTag];
  definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
  definition.interactionType = 'sequencing';
  definition.correctResponsesPattern = [];
  this.params.paragraphs.forEach((paragraph, index) => {
    definition.correctResponsesPattern.push(index);
  });
  definition.correctResponsesPattern = [definition.correctResponsesPattern.join('[,]')];
  definition.choices = this.params.paragraphs.map((paragraph, index) => {
    paragraph = Util.stripHTML(paragraph);

    const choicesDescription = {};
    choicesDescription[this.languageTag] = paragraph;
    choicesDescription['en-US'] = choicesDescription[this.languageTag];

    return {
      id: index,
      description: choicesDescription,
    };
  });

  definition.extensions = definition.extensions || {};
  if (this.content.options.scoringMode === 'transitions') {
    definition.extensions['https://h5p.org/x-api/sequencing-type'] = 'transitions';
  }

  if (this.content.options.duplicatesInterchangeable) {
    definition.extensions['https://h5p.org/x-api/duplicates-interchangeable'] = 1;
  }

  return definition;
};

SortParagraphsCFRD.prototype.checkAnswer = function () {
  const self = this;

  if (self.viewState === VIEW_STATES.task) {
    self.trigger(self.getXAPIAnswerEvent());
    self.storeH5PState();
  }

  self.setViewState('results');
  self.trigger('resize');

  const isExternalCall = self.isExternalCall;

  setTimeout(() => {
    self.content.disable();
    self.hideButton('check-answer');

    if (
      self.viewState !== VIEW_STATES.solutions &&
      self.params.behaviour.enableSolutionsButton &&
      self.getScore() !== self.getMaxScore()
    ) {
      self.showButton('show-solution');
    }

    if (self.params.behaviour.enableRetry) {
      self.showButton('try-again');
    }

    self.content.showResults({
      skipExplanation: self.viewState === VIEW_STATES.solutions,
      skipFocus: isExternalCall,
    });

    self.showOverallFeedback();
  }, 0);
};

SortParagraphsCFRD.prototype.isPassed = function () {
  return this.getScore() >= this.getMaxScore();
};

SortParagraphsCFRD.prototype.getTitle = function () {
  let raw;
  if (this.extras.metadata) {
    raw = this.extras.metadata.title;
  }
  raw = raw || DEFAULT_DESCRIPTION;
  return H5P.createTitle(raw);
};

SortParagraphsCFRD.prototype.getDescription = function () {
  const instructions = getInstructionsOptions(this);
  if (instructions) {
    return instructions.text;
  }
  return DEFAULT_DESCRIPTION;
};

SortParagraphsCFRD.prototype.getCurrentState = function () {
  if (!this.getAnswerGiven() && !this.previousState?.order) {
    return {};
  }

  return {
    order: this.content.getDraggablesOrder(),
    viewState: this.viewState,
    score: this.viewState === VIEW_STATES.task ?
      0 :
      this.getScore(),
  };
};

SortParagraphsCFRD.prototype.handleInteracted = function () {
  this.triggerXAPI('interacted');
};

SortParagraphsCFRD.prototype.setViewState = function (state) {
  if (typeof state === 'string' && VIEW_STATES[state] !== undefined) {
    this.viewState = VIEW_STATES[state];
    if (this.content) {
      this.content.setViewState(state);
    }
  }
  else if (typeof state === 'number' && Object.values(VIEW_STATES).includes(state)) {
    this.viewState = state;
    const key = Object.entries(VIEW_STATES).find(([, value]) => value === state)?.[0];
    if (key && this.content) {
      this.content.setViewState(key);
    }
  }
};

SortParagraphsCFRD.prototype.retrieveStateProvider = function () {
  let stateProvider = this.isRoot() ? this : null;
  if (stateProvider) {
    return stateProvider;
  }

  const rootInstance = H5P.instances
    .find((instance) => instance.contentId === this.contentId);

  if (typeof rootInstance?.getCurrentState === 'function') {
    stateProvider = rootInstance;
  }

  return stateProvider;
};

SortParagraphsCFRD.prototype.storeH5PState = function () {
  if (!this.canStoreState || !this.stateProvider) {
    return;
  }

  H5P.setUserData(
    this.contentId,
    'state',
    this.stateProvider.getCurrentState(),
    { deleteOnChange: true },
  );
};

export default SortParagraphsCFRD;
