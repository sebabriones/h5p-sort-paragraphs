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
