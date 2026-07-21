import SortParagraphsContent from './h5p-sort-paragraphs-content.js';
import Util from './h5p-sort-paragraphs-util.js';
import {
  normalizeCfrdParams,
  getInstructionsOptions,
  stripHtmlText,
} from './sort-paragraphs-cfrd-helpers.js';

const VIEW_STATES = { task: 0, results: 1, solutions: 2 };
const DEFAULT_DESCRIPTION = 'SortParagraphs';

/**
 * Sort Paragraphs CFRD 1.0 — H5P.QuestionCFRD (etapa 1+2: player + semantics CFRD).
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

  self.options = Util.extend({
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
      enableSolutionsButton: true,
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
    stripHtmlText(self.params.taskDescription || '');

  self.content = new SortParagraphsContent(
    {
      paragraphs: self.params.paragraphs,
      addButtonsForMovement: self.params.behaviour.addButtonsForMovement,
      duplicatesInterchangeable: self.params.behaviour.duplicatesInterchangeable,
      penalties: self.params.behaviour.applyPenalties,
      scoringMode: self.params.behaviour.scoringMode,
      showScorePoints: self.params.behaviour.showScorePoints === true,
      taskDescription: instructionsPlain,
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
}

SortParagraphsCFRD.prototype = Object.create(H5P.QuestionCFRD.prototype);
SortParagraphsCFRD.prototype.constructor = SortParagraphsCFRD;
SortParagraphsCFRD.VIEW_STATES = VIEW_STATES;
SortParagraphsCFRD.DEFAULT_DESCRIPTION = DEFAULT_DESCRIPTION;

SortParagraphsCFRD.prototype.registerDomElements = function () {
  const self = this;
  const media = self.params.media && self.params.media.type;
  const instructions = getInstructionsOptions(self);

  if (media && media.library) {
    const type = media.library.split(' ')[0];

    if (type === 'H5P.Image') {
      if (media.params.file) {
        self.setImage(media.params.file.path, {
          disableImageZooming: self.params.media.disableImageZooming,
          alt: media.params.alt,
          title: media.params.title,
          expandImage: media.params.expandImage,
          minimizeImage: media.params.minimizeImage,
        });
      }
    }
    else if (type === 'H5P.Video') {
      if (media.params.sources) {
        self.setVideo(media);
      }
    }
    else if (type === 'H5P.Audio') {
      if (media.params.files) {
        self.setAudio(media);
      }
    }
  }

  if (instructions && instructions.text) {
    const introduction = document.createElement('div');
    introduction.classList.add('h5p-sort-paragraphs-task-description');
    introduction.innerHTML = instructions.text;
    self.setIntroduction(introduction);
  }
  else if (self.params.taskDescription) {
    const introduction = document.createElement('div');
    introduction.classList.add('h5p-sort-paragraphs-task-description');
    introduction.innerHTML = self.params.taskDescription;
    self.setIntroduction(introduction);
  }

  self.setViewState('task');
  self.setContent(self.content.getDOM());

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

  self.on('resize', () => {
    self.content.resize();
  });

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

    const score = self.getScore();
    const maxScore = self.getMaxScore();
    const feedbackRanges = self.params.overallFeedback &&
      self.params.overallFeedback.overallFeedback ?
      self.params.overallFeedback.overallFeedback :
      self.params.overallFeedback;
    const textScore = H5P.QuestionCFRD.determineOverallFeedback(
      feedbackRanges, score / maxScore);
    const ariaMessage = self.params.UI.scoreBarLabel ||
      (self.params.a11y.yourResult || '')
        .replace('@score', ':num')
        .replace('@total', ':total');

    self.setFeedback(
      textScore.trim(),
      score,
      maxScore,
      ariaMessage,
    );
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
  return this.params.taskDescription || DEFAULT_DESCRIPTION;
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
