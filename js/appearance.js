var H5P = H5P || {};
H5P.SortParagraphsCFRD = H5P.SortParagraphsCFRD || {};

/**
 * Activity appearance defaults and CSS custom properties for Sort Paragraphs CFRD 1.0.
 */
(function () {
  var APPEARANCE_DEFAULTS = {
    playAreaBackground: '#ffffff',
    paragraphBackground: '#dddddd',
    paragraphHoverBackground: '#ececec',
    paragraphText: '#333333',
    paragraphBorderRadius: 0.37,
    contextText: '#555555',
    correctBackground: '#b6e4ce',
    correctText: '#255c41',
    wrongBackground: '#fbd7d8',
    wrongText: '#b71c1c',
    dropBackground: '#c7ceff',
    dropBorderColor: '#042cff',
    dropBorderStyle: 'dashed',
    dropBorderWidth: 0.25,
    activeBackground: '#e9edfe',
    activeTextColor: '#3d4eff',
    activeBorderColor: '#0825ff',
    activeBoxShadow: '#b1c5e0',
    moveButtonBackground: '#ffffff',
    moveButtonText: '#1a73d9',
    moveButtonHoverBackground: '#f2f8fd',
    moveButtonActiveBackground: '#e6f1fa',
    moveButtonDisabledBackground: '#dddddd',
    moveButtonDisabledText: '#606060',
    feedbackBackground: '#ffffff',
    feedbackTextColor: '#333333'
  };

  var CSS_VAR_KEYS = {
    playAreaBackground: '--sp-play-area-bg',
    paragraphBackground: '--sp-paragraph-bg',
    paragraphHoverBackground: '--sp-paragraph-hover-bg',
    paragraphText: '--sp-paragraph-color',
    contextText: '--sp-context-color',
    correctBackground: '--sp-correct-bg',
    correctText: '--sp-correct-color',
    wrongBackground: '--sp-wrong-bg',
    wrongText: '--sp-wrong-color',
    dropBackground: '--sp-drop-bg',
    dropBorderColor: '--sp-drop-border-color',
    dropBorderStyle: '--sp-drop-border-style',
    activeBackground: '--sp-active-bg',
    activeTextColor: '--sp-active-color',
    activeBorderColor: '--sp-active-border-color',
    activeBoxShadow: '--sp-active-box-shadow',
    moveButtonBackground: '--sp-move-btn-bg',
    moveButtonText: '--sp-move-btn-color',
    moveButtonHoverBackground: '--sp-move-btn-hover-bg',
    moveButtonActiveBackground: '--sp-move-btn-active-bg',
    moveButtonDisabledBackground: '--sp-move-btn-disabled-bg',
    moveButtonDisabledText: '--sp-move-btn-disabled-color',
    feedbackBackground: '--sp-feedback-bg',
    feedbackTextColor: '--sp-feedback-color'
  };

  var CSS_EM_VAR_KEYS = {
    paragraphBorderRadius: '--sp-paragraph-border-radius',
    dropBorderWidth: '--sp-drop-border-width'
  };

  /**
   * @param {number|string} value
   * @param {number|string} fallback
   * @returns {string}
   */
  function toEm(value, fallback) {
    var num = (value !== undefined && value !== null && value !== '') ?
      Number(value) :
      Number(fallback);

    if (isNaN(num)) {
      num = Number(fallback);
    }

    return num + 'em';
  }

  /**
   * @param {Object} [overallFeedback]
   * @returns {{feedbackBackground: string, feedbackTextColor: string}}
   */
  function getFeedbackColors(overallFeedback) {
    var config = (H5P.QuestionCFRD && H5P.QuestionCFRD.normalizeOverallFeedbackConfig) ?
      H5P.QuestionCFRD.normalizeOverallFeedbackConfig(overallFeedback) :
      {
        popupBackgroundColor: '#ffffff',
        feedbackTextColor: '#333333'
      };

    return {
      feedbackBackground: config.popupBackgroundColor || '#ffffff',
      feedbackTextColor: config.feedbackTextColor || '#333333'
    };
  }

  /**
   * @param {Object} [appearance]
   * @returns {Object}
   */
  function readAppearanceFields(appearance) {
    var paragraphs = (appearance && appearance.paragraphColors) || {};
    var text = (appearance && appearance.textColors) || {};
    var correct = (appearance && appearance.correctColors) || {};
    var wrong = (appearance && appearance.wrongColors) || {};
    var interaction = (appearance && appearance.paragraphInteraction) || {};
    var movementButtons = (appearance && appearance.movementButtons) || {};

    return {
      playAreaBackground: appearance && appearance.playAreaBackground,
      paragraphBackground: paragraphs.background,
      paragraphHoverBackground: paragraphs.hoverBackground,
      paragraphText: paragraphs.text,
      paragraphBorderRadius: paragraphs.borderRadius,
      contextText: text.context,
      correctBackground: correct.background,
      correctText: correct.text,
      wrongBackground: wrong.background,
      wrongText: wrong.text,
      dropBackground: interaction.background,
      dropBorderColor: interaction.borderColor,
      dropBorderStyle: interaction.borderStyle,
      dropBorderWidth: interaction.borderWidth,
      activeBackground: interaction.activeBackground,
      activeTextColor: interaction.activeTextColor,
      activeBorderColor: interaction.activeBorderColor,
      moveButtonBackground: movementButtons.background,
      moveButtonText: movementButtons.text,
      moveButtonHoverBackground: movementButtons.hoverBackground,
      moveButtonActiveBackground: movementButtons.activeBackground,
      moveButtonDisabledBackground: movementButtons.disabledBackground,
      moveButtonDisabledText: movementButtons.disabledText
    };
  }

  /**
   * @param {Object} [appearance]
   * @param {Object|Array} [overallFeedback]
   * @returns {Object}
   */
  function mergeAppearance(appearance, overallFeedback) {
    var merged = {};
    var key;
    var fields = readAppearanceFields(appearance);
    var feedbackColors = getFeedbackColors(overallFeedback);

    for (key in APPEARANCE_DEFAULTS) {
      if (Object.prototype.hasOwnProperty.call(APPEARANCE_DEFAULTS, key)) {
        merged[key] = APPEARANCE_DEFAULTS[key];
      }
    }

    for (key in fields) {
      if (Object.prototype.hasOwnProperty.call(fields, key) &&
          fields[key] !== undefined &&
          fields[key] !== null &&
          fields[key] !== '') {
        merged[key] = fields[key];
      }
    }

    merged.feedbackBackground = feedbackColors.feedbackBackground;
    merged.feedbackTextColor = feedbackColors.feedbackTextColor;

    return merged;
  }

  /**
   * @param {Object} merged
   * @param {string} key
   * @returns {string}
   */
  function getCssVarValue(merged, key) {
    if (Object.prototype.hasOwnProperty.call(CSS_EM_VAR_KEYS, key)) {
      return toEm(merged[key], APPEARANCE_DEFAULTS[key]);
    }

    return merged[key];
  }

  /**
   * @param {jQuery} $container
   * @param {Object} [appearance]
   * @param {Object|Array} [overallFeedback]
   * @returns {Object}
   */
  function applyAppearanceVars($container, appearance, overallFeedback) {
    var merged = mergeAppearance(appearance, overallFeedback);
    var key;
    var i;
    var el;

    if (!$container || !$container.length) {
      return merged;
    }

    for (i = 0; i < $container.length; i++) {
      el = $container[i];

      if (!el || !el.style) {
        continue;
      }

      for (key in CSS_VAR_KEYS) {
        if (Object.prototype.hasOwnProperty.call(CSS_VAR_KEYS, key)) {
          el.style.setProperty(CSS_VAR_KEYS[key], getCssVarValue(merged, key));
        }
      }

      for (key in CSS_EM_VAR_KEYS) {
        if (Object.prototype.hasOwnProperty.call(CSS_EM_VAR_KEYS, key)) {
          el.style.setProperty(CSS_EM_VAR_KEYS[key], getCssVarValue(merged, key));
        }
      }
    }

    return merged;
  }

  /**
   * Apply play area background on the question wrapper so the evaluation footer
   * (siblings of .h5p-sp-play-area) shares the same card color.
   *
   * @param {jQuery} $root
   * @param {Object} [appearance]
   * @param {Object|Array} [overallFeedback]
   * @returns {Object}
   */
  function applyPlayAreaRootBackground($root, appearance, overallFeedback) {
    var merged = mergeAppearance(appearance, overallFeedback);
    var i;
    var el;
    var bg = merged.playAreaBackground;

    if (!$root || !$root.length) {
      return merged;
    }

    for (i = 0; i < $root.length; i++) {
      el = $root[i];

      if (!el || !el.style) {
        continue;
      }

      el.style.setProperty('--sp-play-area-bg', bg);
      el.style.backgroundColor = bg;
    }

    return merged;
  }

  /**
   * @param {jQuery} $root
   * @param {Object} [appearance]
   * @param {Object|Array} [overallFeedback]
   */
  function schedulePlayAreaRootBackground($root, appearance, overallFeedback) {
    var apply = function () {
      applyPlayAreaRootBackground($root, appearance, overallFeedback);
    };

    apply();
    setTimeout(apply, 0);
    setTimeout(apply, 50);
    setTimeout(apply, 200);
  }

  /**
   * @param {jQuery} $container
   * @param {Object} [appearance]
   * @param {Object|Array} [overallFeedback]
   */
  function scheduleAppearance($container, appearance, overallFeedback) {
    var apply = function () {
      applyAppearanceVars($container, appearance, overallFeedback);
    };

    apply();
    setTimeout(apply, 0);
    setTimeout(apply, 50);
    setTimeout(apply, 200);
  }

  H5P.SortParagraphsCFRD.Appearance = {
    APPEARANCE_DEFAULTS: APPEARANCE_DEFAULTS,
    mergeAppearance: mergeAppearance,
    applyAppearanceVars: applyAppearanceVars,
    applyPlayAreaRootBackground: applyPlayAreaRootBackground,
    scheduleAppearance: scheduleAppearance,
    schedulePlayAreaRootBackground: schedulePlayAreaRootBackground
  };
})();
