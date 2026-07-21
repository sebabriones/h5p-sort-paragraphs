/**
 * CFRD helpers (instructions, context, play area) — pattern from Multi Choice CFRD.
 */

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isTruthy(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

/**
 * @param {object} instance
 * @returns {object|null}
 */
export function getInstructionsOptions(instance) {
  const instructions = instance?.options?.instructions;
  let text;

  if (!instructions || !isTruthy(instructions.enabled)) {
    return null;
  }

  text = (instructions.text === undefined || instructions.text === null) ?
    '' :
    String(instructions.text).trim();

  if (!text) {
    return null;
  }

  return {
    id: instance.contentId || instance.id,
    text: text,
    displayMode: instructions.displayMode || 'both',
    introButtonLabel: instructions.introButtonLabel || 'Start',
    tabButtonLabel: instructions.tabButtonLabel || 'Instructions',
    animation: H5P.jQuery.extend(true, {}, instructions.animation || {}),
    appearance: H5P.jQuery.extend(true, {}, instructions.appearance || {}),
    startCollapsed: instructions.startCollapsed === undefined ?
      true :
      isTruthy(instructions.startCollapsed),
  };
}

/**
 * @param {object} instance
 * @param {H5P.jQuery} $fallbackContainer
 */
export function scheduleInstructionsAttach(instance, $fallbackContainer) {
  [0, 200, 500].forEach((delay) => {
    setTimeout(() => {
      const instructions = getInstructionsOptions(instance);
      const $target = (instance.$playArea && instance.$playArea.length) ?
        instance.$playArea :
        ((instance.$instructionsTarget && instance.$instructionsTarget.length) ?
          instance.$instructionsTarget :
          ((instance.$container && instance.$container.length) ?
            instance.$container :
            $fallbackContainer));
      let attached;

      if (!instructions || !$target || !$target.length) {
        return;
      }

      if ($target.find('.h5p-instructions-root').length) {
        instance.trigger('resize');
        return;
      }

      if (H5P.Instructions && typeof H5P.Instructions.attach === 'function') {
        attached = H5P.Instructions.attach($target, instructions);

        if (attached) {
          instance.trigger('resize');
        }
      }
    }, delay);
  });
}

/**
 * Wrap activity content in an inner play area; keep evaluation footer outside flex 16:9.
 *
 * @param {H5P.jQuery} $container
 * @returns {H5P.jQuery}
 */
export function setupPlayAreaLayout($container) {
  const $ = H5P.jQuery;
  let $playArea = $container.children('.h5p-sp-play-area').first();
  const playAreaSelectors = [
    '.h5p-question-image',
    '.h5p-question-video',
    '.h5p-question-audio',
    '.h5p-question-introduction',
    '.h5p-question-content',
  ];

  if (!$playArea.length) {
    $playArea = $('<div>', { class: 'h5p-sp-play-area' });
    $container.prepend($playArea);
  }

  playAreaSelectors.forEach((selector) => {
    $container.children(selector).appendTo($playArea);
  });

  return $playArea;
}

/**
 * Move inline scorebar/feedback out of the play area (QuestionCFRD insert() anchors
 * after content, which lives inside .h5p-sp-play-area after setupPlayAreaLayout).
 *
 * @param {H5P.jQuery} $container
 */
export function normalizeInlineEvaluationLayout($container) {
  const $ = H5P.jQuery;
  const $playArea = $container.children('.h5p-sp-play-area').first();
  let $feedback;
  let $scorebar;
  let $buttons;

  if (!$playArea.length) {
    return;
  }

  $playArea.children('.h5p-question-feedback:not(.h5p-question-popup)').appendTo($container);
  $playArea.children('.h5p-question-scorebar').appendTo($container);

  $feedback = $container.children('.h5p-question-feedback:not(.h5p-question-popup)');
  $scorebar = $container.children('.h5p-question-scorebar');
  $buttons = $container.children('.h5p-question-buttons');

  if ($scorebar.length && $buttons.length) {
    $scorebar.insertBefore($buttons);
  }

  if ($feedback.length && $scorebar.length) {
    $feedback.insertBefore($scorebar);
  }
  else if ($feedback.length && $buttons.length) {
    $feedback.insertBefore($buttons);
  }
}

/**
 * Restore action button labels if QuestionCFRD truncated them to icons only.
 *
 * @param {H5P.jQuery} $container
 */
export function restoreTruncatedActionButtonLabels($container) {
  const $ = H5P.jQuery;
  let $buttons;

  if (!$container || !$container.length) {
    return;
  }

  $buttons = $container.children('.h5p-question-buttons');

  if (!$buttons.length) {
    return;
  }

  $buttons.find('.h5p-joubelui-button.truncated').each(function () {
    const $btn = $(this);
    const label = $btn.attr('data-tooltip') || $btn.attr('aria-label') || '';

    if (!label) {
      return;
    }

    $btn.html(label).removeClass('truncated').removeAttr('data-tooltip');
  });
}

/**
 * @param {H5P.jQuery} $container
 * @param {object} [instance]
 * @param {object} [options]
 * @param {boolean} [options.normalizeInline=true]
 */
export function scheduleInlineEvaluationLayout($container, instance, options) {
  const normalizeInline = !options || options.normalizeInline !== false;

  [0, 50, 160, 350].forEach((delay) => {
    setTimeout(() => {
      if ($container && $container.length) {
        if (normalizeInline) {
          normalizeInlineEvaluationLayout($container);
        }

        restoreTruncatedActionButtonLabels($container);

        if (instance && typeof instance.trigger === 'function') {
          instance.trigger('resize');
        }
      }
    }, delay);
  });
}

/**
 * @param {object} instance
 */
export function scheduleDeferredResize(instance) {
  requestAnimationFrame(() => {
    instance.trigger('resize');

    requestAnimationFrame(() => {
      instance.trigger('resize');
    });
  });

  [50, 150, 350].forEach((delay) => {
    setTimeout(() => {
      instance.trigger('resize');
    }, delay);
  });
}

/**
 * @param {object} instance
 */
export function refreshInstructionsScale(instance) {
  const instructions = getInstructionsOptions(instance);

  if (!instructions || !instance.$playArea || !instance.$playArea.length) {
    return;
  }

  if (H5P.Instructions && typeof H5P.Instructions.updateScale === 'function') {
    H5P.Instructions.updateScale(instance.$playArea, instructions);
  }
}

/**
 * @param {string} html
 * @returns {string}
 */
export function stripHtmlText(html) {
  const decoder = document.createElement('div');
  decoder.innerHTML = html || '';
  return (decoder.textContent || decoder.innerText || '')
    .replace(/[\n\r]+|[\s]{2,}/g, ' ')
    .trim();
}

/**
 * @param {object} context
 * @returns {boolean}
 */
export function hasContextText(context) {
  return !!(context && context.text && stripHtmlText(context.text));
}

/**
 * @param {object} context
 * @returns {boolean}
 */
export function hasContextImage(context) {
  const media = context && context.media;
  const type = media && media.type;
  return !!(type && type.library && type.params && type.params.file);
}

/**
 * @param {object} context
 * @returns {string|null}
 */
export function getContextLayoutClass(context) {
  const hasText = hasContextText(context);
  const hasImage = hasContextImage(context);

  if (!hasText && !hasImage) {
    return null;
  }

  if (hasText && hasImage) {
    return 'h5p-sp-context--both';
  }

  if (hasText) {
    return 'h5p-sp-context--text-only';
  }

  return 'h5p-sp-context--image-only';
}

/**
 * @param {object} context
 * @param {number} contentId
 * @param {H5P.jQuery} $container
 */
export function attachContextImage(context, contentId, $container) {
  const media = context && context.media;
  const library = media && media.type;

  if (!library || !library.library || !$container || !$container.length) {
    return;
  }

  H5P.newRunnable(library, contentId, $container);
}

/**
 * Attach context image after the play area is in the DOM.
 * @param {object} instance
 */
export function scheduleContextImageAttach(instance) {
  const pending = instance.pendingContextImage;

  if (!pending || !pending.$container || !pending.$container.length) {
    return;
  }

  [0, 50, 200].forEach((delay) => {
    setTimeout(() => {
      if (!pending.$container || !pending.$container.length) {
        return;
      }

      if (pending.$container.children().length) {
        return;
      }

      attachContextImage(pending.context, instance.contentId, pending.$container);
    }, delay);
  });
}

/**
 * Apply shared action button appearance (Check, Retry, Show solution).
 * @param {object} instance
 */
export function applyActionButtonAppearance(instance) {
  const actionButtons = instance?.params?.appearance?.actionButtons;

  if (!actionButtons || typeof instance.setActionButtonAppearance !== 'function') {
    return;
  }

  if (H5P.QuestionCFRD.hasActionButtonAppearance &&
      H5P.QuestionCFRD.hasActionButtonAppearance(actionButtons)) {
    instance.setActionButtonAppearance(actionButtons);
  }
}

/**
 * Apply activity appearance CSS variables to the play area and root wrapper.
 * @param {object} instance
 */
export function applyActivityAppearance(instance) {
  const AppearanceModule = H5P.SortParagraphsCFRD && H5P.SortParagraphsCFRD.Appearance;
  let appearance;
  let overallFeedback;

  if (!AppearanceModule || !instance) {
    return;
  }

  appearance = instance.params && instance.params.appearance;
  overallFeedback = instance.params && instance.params.overallFeedback;

  if (instance.$playArea && instance.$playArea.length) {
    AppearanceModule.scheduleAppearance(instance.$playArea, appearance, overallFeedback);
  }

  if (instance.$container && instance.$container.length) {
    AppearanceModule.schedulePlayAreaRootBackground(
      instance.$container,
      appearance,
      overallFeedback,
    );
  }

  applyActionButtonAppearance(instance);
}

/**
 * Unwrap a range entry when the editor nests fields under overallFeedback.
 * @param {object} entry
 * @return {object}
 */
function flattenFeedbackRange(entry) {
  entry = entry || {};

  if (entry.overallFeedback && typeof entry.overallFeedback === 'object') {
    return entry.overallFeedback;
  }

  return entry;
}

/**
 * Collect score ranges from legacy array, nested group, or numeric-key object shapes.
 * @param {object|Array} overallFeedback
 * @return {Array}
 */
export function collectFeedbackRanges(overallFeedback) {
  if (!overallFeedback) {
    return [];
  }

  if (Array.isArray(overallFeedback)) {
    return overallFeedback.map(flattenFeedbackRange);
  }

  const ranges = [];

  if (Array.isArray(overallFeedback.overallFeedback) && overallFeedback.overallFeedback.length > 0) {
    ranges.push(...overallFeedback.overallFeedback);
  }
  else {
    Object.keys(overallFeedback).forEach((key) => {
      if (/^\d+$/.test(key)) {
        ranges.push(overallFeedback[key]);
      }
    });
  }

  return ranges.map(flattenFeedbackRange);
}

/**
 * Normalize legacy l10n / overallFeedback shapes.
 * @param {object} params
 */
export function normalizeCfrdParams(params) {
  if (params.l10n && !params.UI) {
    params.UI = {
      checkAnswerButton: params.l10n.checkAnswer,
      submitAnswerButton: params.l10n.submitAnswer,
      tryAgainButton: params.l10n.tryAgain,
      showSolutionButton: params.l10n.showSolution,
      up: params.l10n.up,
      down: params.l10n.down,
      disabled: params.l10n.disabled,
    };
  }

  params.UI = params.UI || {};

  if (params.overallFeedback) {
    const source = params.overallFeedback;
    const ranges = collectFeedbackRanges(source);

    params.overallFeedback = {
      popupBackgroundColor: source.popupBackgroundColor || '#ffffff',
      feedbackTextColor: source.feedbackTextColor || '#333333',
      overallFeedback: ranges,
    };
  }

  if (params.taskDescription && !params.instructions) {
    params.instructions = {
      enabled: true,
      text: params.taskDescription,
      displayMode: 'both',
    };
  }
}
