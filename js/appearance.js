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
    paragraphHoverText: '#333333',
    paragraphBorderColor: 'transparent',
    paragraphHoverBorderColor: 'transparent',
    paragraphBorderWidth: 0,
    paragraphHoverBorderWidth: 0,
    paragraphBorderRadius: 0.37,
    contextText: '#555555',
    paragraphFontSize: 1,
    contextFontSize: 1,
    correctBackground: '#b6e4ce',
    correctBorderColor: '#b6e4ce',
    correctText: '#255c41',
    wrongBackground: '#fbd7d8',
    wrongBorderColor: '#fbd7d8',
    wrongText: '#b71c1c',
    dropBackground: '#c7ceff',
    dropBorderColor: '#042cff',
    dropBorderStyle: 'dashed',
    dropBorderWidth: 0.25,
    activeBackground: '#e9edfe',
    activeTextColor: '#3d4eff',
    activeBorderColor: '#0825ff',
    activeBorderWidth: 0.25,
    activeBoxShadow: '#b1c5e0',
    moveButtonBackground: '#ffffff',
    moveButtonText: '#1a73d9',
    moveButtonHoverBackground: '#f2f8fd',
    moveButtonActiveBackground: '#e6f1fa',
    moveButtonDisabledBackground: '#dddddd',
    moveButtonDisabledText: '#606060',
    feedbackBackground: '#ffffff',
    feedbackTextColor: '#333333',
    scrollbarWidth: 8,
    scrollbarShowTrack: true,
    scrollbarTrack: '#e8e8e8',
    scrollbarThumb: '#b0b0b0',
    scrollbarThumbHover: '#888888'
  };

  var CSS_VAR_KEYS = {
    playAreaBackground: '--sp-play-area-bg',
    paragraphBackground: '--sp-paragraph-bg',
    paragraphHoverBackground: '--sp-paragraph-hover-bg',
    paragraphText: '--sp-paragraph-color',
    paragraphHoverText: '--sp-paragraph-hover-color',
    paragraphBorderColor: '--sp-paragraph-border-color',
    paragraphHoverBorderColor: '--sp-paragraph-hover-border-color',
    contextText: '--sp-context-color',
    correctBackground: '--sp-correct-bg',
    correctBorderColor: '--sp-correct-border-color',
    correctText: '--sp-correct-color',
    wrongBackground: '--sp-wrong-bg',
    wrongBorderColor: '--sp-wrong-border-color',
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
    feedbackTextColor: '--sp-feedback-color',
    scrollbarTrack: '--sp-scrollbar-track',
    scrollbarThumb: '--sp-scrollbar-thumb',
    scrollbarThumbHover: '--sp-scrollbar-thumb-hover'
  };

  var CSS_EM_VAR_KEYS = {
    paragraphBorderRadius: '--sp-paragraph-border-radius',
    paragraphBorderWidth: '--sp-paragraph-border-width',
    paragraphHoverBorderWidth: '--sp-paragraph-hover-border-width',
    activeBorderWidth: '--sp-active-border-width',
    dropBorderWidth: '--sp-drop-border-width',
    paragraphFontSize: '--sp-paragraph-font-size',
    contextFontSize: '--sp-context-font-size'
  };

  var CSS_PX_VAR_KEYS = {
    scrollbarWidth: '--sp-scrollbar-width'
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
   * @param {number|string} value
   * @param {number|string} fallback
   * @returns {string}
   */
  function toPx(value, fallback) {
    var num = (value !== undefined && value !== null && value !== '') ?
      Number(value) :
      Number(fallback);

    if (isNaN(num)) {
      num = Number(fallback);
    }

    return num + 'px';
  }

  /**
   * @param {*} value
   * @returns {boolean}
   */
  function isTruthy(value) {
    return value === true || value === 1 || value === '1' || value === 'true';
  }

  /**
   * @param {*} value
   * @param {string} fallback
   * @returns {string}
   */
  function pickString(value, fallback) {
    return (value === undefined || value === null || value === '') ?
      fallback :
      String(value);
  }

  /**
   * @param {*} value
   * @param {number} fallback
   * @returns {number}
   */
  function normalizeAngle(value, fallback) {
    var normalized = parseInt(value, 10);

    if (isNaN(normalized)) {
      normalized = fallback;
    }

    return Math.max(0, Math.min(360, normalized));
  }

  /**
   * @param {number} angle
   * @param {string} colorStart
   * @param {string} colorEnd
   * @returns {string}
   */
  function buildLinearGradient(angle, colorStart, colorEnd) {
    return 'linear-gradient(' + angle + 'deg, ' + colorStart + ', ' + colorEnd + ')';
  }

  /**
   * Resolve solid or gradient fill from editor fields.
   *
   * @param {Object} [group]
   * @param {Object} options
   * @param {string} options.solidKey
   * @param {string} [options.useGradientKey]
   * @param {string} [options.gradientKey]
   * @param {string} options.fallbackSolid
   * @returns {string}
   */
  function resolveFill(group, options) {
    var useGradientKey = options.useGradientKey || 'useGradientBackground';
    var gradientKey = options.gradientKey || 'gradientBackground';
    var solid = pickString(group && group[options.solidKey], options.fallbackSolid);
    var gradient;
    var angle;
    var colorStart;
    var colorEnd;

    if (!isTruthy(group && group[useGradientKey])) {
      return solid;
    }

    gradient = (group && group[gradientKey]) || {};
    angle = normalizeAngle(gradient.angle, 180);
    colorStart = pickString(gradient.colorStart, solid);
    colorEnd = pickString(gradient.colorEnd, colorStart);

    return buildLinearGradient(angle, colorStart, colorEnd);
  }

  /**
   * Solid color for borders when fill may be a gradient.
   *
   * @param {Object} [group]
   * @param {string} solidKey
   * @param {string} fallbackSolid
   * @returns {string}
   */
  function resolveBorderSolid(group, solidKey, fallbackSolid) {
    var solid = pickString(group && group[solidKey], fallbackSolid);
    var gradient;

    if (!isTruthy(group && group.useGradientBackground)) {
      return solid;
    }

    gradient = (group && group.gradientBackground) || {};
    return pickString(gradient.colorStart, solid);
  }

  /**
   * @param {*} color
   * @returns {boolean}
   */
  function isInvisibleColor(color) {
    var value;

    if (color === undefined || color === null || color === '') {
      return true;
    }

    value = String(color).trim().toLowerCase();

    if (value === 'transparent') {
      return true;
    }

    return /^rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*0(?:\.0+)?\s*\)$/i.test(value);
  }

  /**
   * Nested state group if present; otherwise null (legacy flat fields).
   *
   * @param {Object} paragraphs
   * @param {string} stateName
   * @returns {Object|null}
   */
  function getNestedState(paragraphs, stateName) {
    var state = paragraphs && paragraphs[stateName];

    if (!state || typeof state !== 'object') {
      return null;
    }

    if (
      state.background !== undefined ||
      state.useGradientBackground !== undefined ||
      state.gradientBackground !== undefined ||
      state.text !== undefined ||
      state.useBorder !== undefined ||
      state.borderColor !== undefined
    ) {
      return state;
    }

    return null;
  }

  /**
   * Whether a paragraph state should draw a border.
   * H5P often omits boolean false while still storing borderColor defaults —
   * never treat a present borderColor alone as "use border".
   *
   * @param {Object|null} state
   * @param {*} legacyBorderColor
   * @param {boolean} defaultUseBorder
   * @returns {boolean}
   */
  function resolveUseBorder(state, legacyBorderColor, defaultUseBorder) {
    var hasExplicitUseBorder = state && (
      state.useBorder === true || state.useBorder === false ||
      state.useBorder === 0 || state.useBorder === 1 ||
      state.useBorder === '0' || state.useBorder === '1' ||
      state.useBorder === 'true' || state.useBorder === 'false'
    );
    var nestedBorderUnset = !state ||
      (state.useBorder === undefined && state.borderColor === undefined);

    if (hasExplicitUseBorder) {
      return isTruthy(state.useBorder);
    }

    if (
      nestedBorderUnset &&
      legacyBorderColor !== undefined &&
      legacyBorderColor !== null &&
      legacyBorderColor !== ''
    ) {
      return !isInvisibleColor(legacyBorderColor);
    }

    return defaultUseBorder;
  }

  /**
   * Resolve border color for a paragraph state.
   *
   * @param {Object|null} state
   * @param {*} legacyBorderColor
   * @param {boolean} defaultUseBorder
   * @param {string} fallbackHex
   * @returns {string}
   */
  function resolveStateBorderColor(state, legacyBorderColor, defaultUseBorder, fallbackHex) {
    var useBorder = resolveUseBorder(state, legacyBorderColor, defaultUseBorder);
    var color = state && state.borderColor;
    var nestedBorderUnset = !state ||
      (state.useBorder === undefined && state.borderColor === undefined);

    if (
      nestedBorderUnset &&
      legacyBorderColor !== undefined &&
      legacyBorderColor !== null &&
      legacyBorderColor !== ''
    ) {
      color = legacyBorderColor;
    }

    if (!useBorder) {
      return 'transparent';
    }

    if (isInvisibleColor(color)) {
      if (!isInvisibleColor(legacyBorderColor)) {
        return pickString(legacyBorderColor, fallbackHex);
      }

      return fallbackHex;
    }

    return pickString(color, fallbackHex);
  }

  /**
   * Border width in em: 0 when disabled (avoids gradient + transparent border halo).
   *
   * @param {boolean} useBorder
   * @param {number} [enabledWidth]
   * @returns {number}
   */
  function resolveStateBorderWidth(useBorder, enabledWidth) {
    return useBorder ? (enabledWidth !== undefined ? enabledWidth : 0.25) : 0;
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
  /**
   * Normalize a font-size field to a unitless number (never "1em").
   *
   * @param {*} value
   * @param {number} fallback
   * @returns {number}
   */
  function normalizeEmNumber(value, fallback) {
    var parsed;

    if (value === undefined || value === null || value === '') {
      return fallback;
    }

    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }

    parsed = parseFloat(String(value).replace(/em/gi, '').trim());
    return isNaN(parsed) ? fallback : parsed;
  }

  /**
   * Resolve textStyle group from current or legacy textColors shapes.
   *
   * @param {Object} [appearance]
   * @returns {{paragraphFontSize: number, contextColor: string, contextFontSize: number}}
   */
  function resolveTextStyle(appearance) {
    var style = appearance && appearance.textStyle;
    var legacy = appearance && appearance.textColors;
    var out = {};

    if (style && typeof style === 'object') {
      out.paragraphFontSize = style.paragraphFontSize;
      out.contextColor = style.contextColor || style.context;
      out.contextFontSize = style.contextFontSize;
    }
    else if (typeof legacy === 'string') {
      out.contextColor = legacy;
    }
    else if (legacy && typeof legacy === 'object') {
      out.paragraphFontSize = legacy.paragraphFontSize;
      out.contextColor = legacy.contextColor || legacy.context;
      out.contextFontSize = legacy.contextFontSize;
    }

    out.paragraphFontSize = normalizeEmNumber(out.paragraphFontSize, APPEARANCE_DEFAULTS.paragraphFontSize);
    out.contextFontSize = normalizeEmNumber(out.contextFontSize, APPEARANCE_DEFAULTS.contextFontSize);
    out.contextColor = pickString(out.contextColor, APPEARANCE_DEFAULTS.contextText);

    return out;
  }

  /**
   * @param {Object} [appearance]
   * @returns {Object}
   */
  function readAppearanceFields(appearance) {
    var paragraphs = (appearance && appearance.paragraphColors) || {};
    var text = resolveTextStyle(appearance);
    var correct = (appearance && appearance.correctColors) || {};
    var wrong = (appearance && appearance.wrongColors) || {};
    var interaction = (appearance && appearance.paragraphInteraction) || {};
    var movementButtons = (appearance && appearance.movementButtons) || {};
    var scrollbar = (appearance && appearance.scrollbar) || {};
    var normal = getNestedState(paragraphs, 'normal') || {
      useGradientBackground: paragraphs.useGradientBackground,
      background: paragraphs.background,
      gradientBackground: paragraphs.gradientBackground,
      text: paragraphs.text,
      useBorder: paragraphs.useBorder,
      borderColor: paragraphs.borderColor
    };
    var hover = getNestedState(paragraphs, 'hover') || {
      useGradientBackground: paragraphs.useHoverGradientBackground,
      background: paragraphs.hoverBackground,
      gradientBackground: paragraphs.hoverGradientBackground,
      text: paragraphs.hoverText,
      useBorder: paragraphs.useHoverBorder,
      borderColor: paragraphs.hoverBorderColor
    };
    var active = getNestedState(paragraphs, 'active') || {
      useGradientBackground: paragraphs.useActiveGradientBackground,
      background: pickString(paragraphs.activeBackground, interaction.activeBackground),
      gradientBackground: paragraphs.activeGradientBackground,
      text: pickString(paragraphs.activeTextColor, interaction.activeTextColor),
      useBorder: paragraphs.useActiveBorder,
      borderColor: pickString(paragraphs.activeBorderColor, interaction.activeBorderColor)
    };

    return {
      playAreaBackground: appearance && appearance.playAreaBackground,
      paragraphBackground: resolveFill(normal, {
        solidKey: 'background',
        fallbackSolid: APPEARANCE_DEFAULTS.paragraphBackground
      }),
      paragraphHoverBackground: resolveFill(hover, {
        solidKey: 'background',
        fallbackSolid: APPEARANCE_DEFAULTS.paragraphHoverBackground
      }),
      paragraphText: normal.text,
      paragraphHoverText: hover.text,
      paragraphBorderColor: resolveStateBorderColor(
        normal,
        paragraphs.borderColor,
        false,
        '#999999'
      ),
      paragraphHoverBorderColor: resolveStateBorderColor(
        hover,
        paragraphs.hoverBorderColor,
        false,
        '#999999'
      ),
      paragraphBorderWidth: resolveStateBorderWidth(
        resolveUseBorder(normal, paragraphs.borderColor, false)
      ),
      paragraphHoverBorderWidth: resolveStateBorderWidth(
        resolveUseBorder(hover, paragraphs.hoverBorderColor, false)
      ),
      paragraphBorderRadius: paragraphs.borderRadius,
      contextText: text.contextColor,
      paragraphFontSize: text.paragraphFontSize,
      contextFontSize: text.contextFontSize,
      correctBackground: resolveFill(correct, {
        solidKey: 'background',
        fallbackSolid: APPEARANCE_DEFAULTS.correctBackground
      }),
      correctBorderColor: pickString(
        correct.borderColor,
        resolveBorderSolid(correct, 'background', APPEARANCE_DEFAULTS.correctBorderColor)
      ),
      correctText: correct.text,
      wrongBackground: resolveFill(wrong, {
        solidKey: 'background',
        fallbackSolid: APPEARANCE_DEFAULTS.wrongBackground
      }),
      wrongBorderColor: pickString(
        wrong.borderColor,
        resolveBorderSolid(wrong, 'background', APPEARANCE_DEFAULTS.wrongBorderColor)
      ),
      wrongText: wrong.text,
      dropBackground: interaction.background,
      dropBorderColor: interaction.borderColor,
      dropBorderStyle: interaction.borderStyle,
      dropBorderWidth: interaction.borderWidth,
      activeBackground: resolveFill(active, {
        solidKey: 'background',
        fallbackSolid: APPEARANCE_DEFAULTS.activeBackground
      }),
      activeTextColor: active.text,
      activeBorderColor: resolveStateBorderColor(
        active,
        pickString(paragraphs.activeBorderColor, interaction.activeBorderColor),
        true,
        APPEARANCE_DEFAULTS.activeBorderColor
      ),
      activeBorderWidth: resolveStateBorderWidth(
        resolveUseBorder(
          active,
          pickString(paragraphs.activeBorderColor, interaction.activeBorderColor),
          true
        )
      ),
      moveButtonBackground: movementButtons.background,
      moveButtonText: movementButtons.text,
      moveButtonHoverBackground: movementButtons.hoverBackground,
      moveButtonActiveBackground: movementButtons.activeBackground,
      moveButtonDisabledBackground: movementButtons.disabledBackground,
      moveButtonDisabledText: movementButtons.disabledText,
      scrollbarWidth: scrollbar.width,
      scrollbarShowTrack: scrollbar.showTrack,
      scrollbarTrack: scrollbar.track,
      scrollbarThumb: scrollbar.thumb,
      scrollbarThumbHover: scrollbar.thumbHover
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

    // Boolean false must be preserved (empty-string guard above skips it intentionally for colors).
    if (fields.scrollbarShowTrack === false || fields.scrollbarShowTrack === true) {
      merged.scrollbarShowTrack = fields.scrollbarShowTrack;
    }

    merged.paragraphHoverText = pickString(
      fields.paragraphHoverText,
      merged.paragraphText
    );

    merged.paragraphHoverBorderColor = pickString(
      fields.paragraphHoverBorderColor,
      merged.paragraphBorderColor
    );

    merged.feedbackBackground = feedbackColors.feedbackBackground;
    merged.feedbackTextColor = feedbackColors.feedbackTextColor;

    if (merged.scrollbarShowTrack === false) {
      merged.scrollbarTrack = 'transparent';
    }

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

    if (Object.prototype.hasOwnProperty.call(CSS_PX_VAR_KEYS, key)) {
      return toPx(merged[key], APPEARANCE_DEFAULTS[key]);
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

      for (key in CSS_PX_VAR_KEYS) {
        if (Object.prototype.hasOwnProperty.call(CSS_PX_VAR_KEYS, key)) {
          el.style.setProperty(CSS_PX_VAR_KEYS[key], getCssVarValue(merged, key));
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
