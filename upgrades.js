var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.SortParagraphsCFRD'] = (function () {
  /**
   * Unwrap a range entry when the editor nests fields under overallFeedback.
   * @param {object} entry
   * @return {object}
   */
  var flattenFeedbackRange = function (entry) {
    entry = entry || {};

    if (entry.overallFeedback && typeof entry.overallFeedback === 'object') {
      return entry.overallFeedback;
    }

    return entry;
  };

  /**
   * Collect score ranges from legacy array, nested group, or numeric-key object shapes.
   * @param {object|Array} overallFeedback
   * @return {Array}
   */
  var collectFeedbackRanges = function (overallFeedback) {
    var ranges = [];
    var key;
    var i;

    if (!overallFeedback) {
      return ranges;
    }

    if (Array.isArray(overallFeedback)) {
      for (i = 0; i < overallFeedback.length; i++) {
        ranges.push(flattenFeedbackRange(overallFeedback[i]));
      }

      return ranges;
    }

    if (Array.isArray(overallFeedback.overallFeedback) && overallFeedback.overallFeedback.length > 0) {
      for (i = 0; i < overallFeedback.overallFeedback.length; i++) {
        ranges.push(flattenFeedbackRange(overallFeedback.overallFeedback[i]));
      }
    }
    else {
      for (key in overallFeedback) {
        if (Object.prototype.hasOwnProperty.call(overallFeedback, key) && /^\d+$/.test(key)) {
          ranges.push(flattenFeedbackRange(overallFeedback[key]));
        }
      }
    }

    return ranges;
  };

  return {
    1: {
      0: {
        /**
         * CFRD semantics: taskDescription → instructions, media → context, l10n → UI.
         */
        2: function (parameters, finished) {
          if (parameters && parameters.taskDescription) {
            parameters.instructions = parameters.instructions || {
              enabled: true,
              text: parameters.taskDescription,
              displayMode: 'both',
              introButtonLabel: 'Start',
              tabButtonLabel: 'Instructions',
              startCollapsed: true,
            };
            delete parameters.taskDescription;
          }

          if (parameters && parameters.media && parameters.media.type) {
            var media = parameters.media;
            var library = media.type;

            if (library && library.library && library.library.indexOf('H5P.Image') === 0) {
              parameters.context = parameters.context || {};
              parameters.context.media = {
                type: library,
                disableImageZooming: media.disableImageZooming || false,
              };
            }

            delete parameters.media;
          }

          if (parameters && parameters.l10n && !parameters.UI) {
            parameters.UI = {
              checkAnswerButton: parameters.l10n.checkAnswer,
              submitAnswerButton: parameters.l10n.submitAnswer,
              tryAgainButton: parameters.l10n.tryAgain,
              showSolutionButton: parameters.l10n.showSolution,
              scoreBarLabel: 'You got :num out of :total points',
              feedbackPopupCloseLabel: 'Close',
              showFeedbackButtonLabel: 'Show feedback',
              up: parameters.l10n.up,
              down: parameters.l10n.down,
              disabled: parameters.l10n.disabled,
            };
            delete parameters.l10n;
          }

          var overallFeedback = parameters && parameters.overallFeedback;

          if (Array.isArray(overallFeedback)) {
            parameters.overallFeedback = {
              popupBackgroundColor: '#ffffff',
              feedbackTextColor: '#333333',
              overallFeedback: overallFeedback,
            };
          }
          else if (
            overallFeedback &&
            typeof overallFeedback === 'object' &&
            !overallFeedback.popupBackgroundColor
          ) {
            overallFeedback.popupBackgroundColor = '#ffffff';
            overallFeedback.feedbackTextColor = '#333333';
          }

          finished(null, parameters);
        },

        /**
         * Normalize overallFeedback ranges saved as numeric object keys by the editor.
         */
        3: function (parameters, finished) {
          var overallFeedback = parameters && parameters.overallFeedback;
          var ranges;
          var key;

          if (!overallFeedback) {
            finished(null, parameters);
            return;
          }

          ranges = collectFeedbackRanges(overallFeedback);

          parameters.overallFeedback = {
            popupBackgroundColor: overallFeedback.popupBackgroundColor || '#ffffff',
            feedbackTextColor: overallFeedback.feedbackTextColor || '#333333',
            overallFeedback: ranges,
          };

          for (key in parameters.overallFeedback) {
            if (/^\d+$/.test(key)) {
              delete parameters.overallFeedback[key];
            }
          }

          finished(null, parameters);
        },

        /**
         * Defaults for showScorePoints and appearance group (línea 1.0).
         */
        4: function (parameters, finished) {
          if (parameters && parameters.behaviour && parameters.behaviour.showScorePoints === undefined) {
            parameters.behaviour.showScorePoints = false;
          }

          if (!parameters.appearance || typeof parameters.appearance !== 'object') {
            parameters.appearance = {};
          }

          finished(null, parameters);
        },

        /**
         * Move active paragraph colors into paragraphColors; drop target stays in paragraphInteraction.
         */
        28: function (parameters, finished) {
          var appearance;
          var interaction;
          var paragraphs;
          var keys = ['activeBackground', 'activeTextColor', 'activeBorderColor'];
          var i;
          var key;

          if (parameters && parameters.appearance && typeof parameters.appearance === 'object') {
            appearance = parameters.appearance;
            interaction = appearance.paragraphInteraction || {};
            paragraphs = appearance.paragraphColors || {};

            for (i = 0; i < keys.length; i++) {
              key = keys[i];
              if (
                (paragraphs[key] === undefined || paragraphs[key] === null || paragraphs[key] === '') &&
                interaction[key] !== undefined &&
                interaction[key] !== null &&
                interaction[key] !== ''
              ) {
                paragraphs[key] = interaction[key];
              }
              if (Object.prototype.hasOwnProperty.call(interaction, key)) {
                delete interaction[key];
              }
            }

            appearance.paragraphColors = paragraphs;
            appearance.paragraphInteraction = interaction;
          }

          finished(null, parameters);
        },

        /**
         * Nest paragraphColors by state (normal/hover/active); migrate transparent/rgba borders to useBorder.
         */
        29: function (parameters, finished) {
          var appearance;
          var paragraphs;
          var interaction;
          var next;
          var isInvisibleColor;
          var migrateBorder;
          var pickValue;
          var hasNestedState;

          isInvisibleColor = function (color) {
            var value;

            if (color === undefined || color === null || color === '') {
              return true;
            }

            value = String(color).trim().toLowerCase();

            if (value === 'transparent') {
              return true;
            }

            return /^rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*0(?:\.0+)?\s*\)$/i.test(value);
          };

          pickValue = function () {
            var i;
            var value;

            for (i = 0; i < arguments.length; i++) {
              value = arguments[i];
              if (value !== undefined && value !== null && value !== '') {
                return value;
              }
            }

            return undefined;
          };

          migrateBorder = function (state, legacyColor, defaultUseBorder, defaultColor) {
            var useBorder;
            var borderColor;

            if (state.useBorder === true || state.useBorder === false) {
              useBorder = state.useBorder;
              borderColor = state.borderColor;
            }
            else if (!isInvisibleColor(state.borderColor)) {
              useBorder = true;
              borderColor = state.borderColor;
            }
            else if (legacyColor !== undefined && legacyColor !== null && legacyColor !== '') {
              useBorder = !isInvisibleColor(legacyColor);
              borderColor = isInvisibleColor(legacyColor) ? defaultColor : legacyColor;
            }
            else {
              useBorder = defaultUseBorder;
              borderColor = defaultColor;
            }

            state.useBorder = useBorder;
            if (useBorder) {
              state.borderColor = borderColor || defaultColor;
            }
            else if (state.borderColor === undefined || isInvisibleColor(state.borderColor)) {
              state.borderColor = defaultColor;
            }

            return state;
          };

          hasNestedState = function (group, name) {
            var state = group && group[name];
            return !!(state && typeof state === 'object' && (
              state.background !== undefined ||
              state.useGradientBackground !== undefined ||
              state.gradientBackground !== undefined ||
              state.text !== undefined ||
              state.useBorder !== undefined ||
              state.borderColor !== undefined
            ));
          };

          if (parameters && parameters.appearance && typeof parameters.appearance === 'object') {
            appearance = parameters.appearance;
            paragraphs = appearance.paragraphColors || {};
            interaction = appearance.paragraphInteraction || {};
            next = {};

            if (paragraphs.borderRadius !== undefined) {
              next.borderRadius = paragraphs.borderRadius;
            }

            if (hasNestedState(paragraphs, 'normal')) {
              next.normal = paragraphs.normal;
            }
            else {
              next.normal = {
                useGradientBackground: paragraphs.useGradientBackground,
                background: paragraphs.background,
                gradientBackground: paragraphs.gradientBackground,
                text: paragraphs.text
              };
            }
            next.normal = migrateBorder(next.normal || {}, paragraphs.borderColor, false, '#999999');

            if (hasNestedState(paragraphs, 'hover')) {
              next.hover = paragraphs.hover;
            }
            else {
              next.hover = {
                useGradientBackground: paragraphs.useHoverGradientBackground,
                background: paragraphs.hoverBackground,
                gradientBackground: paragraphs.hoverGradientBackground,
                text: paragraphs.hoverText
              };
            }
            next.hover = migrateBorder(next.hover || {}, paragraphs.hoverBorderColor, false, '#999999');

            if (hasNestedState(paragraphs, 'active')) {
              next.active = paragraphs.active;
            }
            else {
              next.active = {
                useGradientBackground: paragraphs.useActiveGradientBackground,
                background: pickValue(paragraphs.activeBackground, interaction.activeBackground),
                gradientBackground: paragraphs.activeGradientBackground,
                text: pickValue(paragraphs.activeTextColor, interaction.activeTextColor)
              };
            }
            next.active = migrateBorder(
              next.active || {},
              pickValue(paragraphs.activeBorderColor, interaction.activeBorderColor),
              true,
              '#0825ff'
            );

            [
              'useGradientBackground', 'background', 'gradientBackground', 'text',
              'useHoverGradientBackground', 'hoverBackground', 'hoverGradientBackground', 'hoverText',
              'borderColor', 'hoverBorderColor',
              'activeBackground', 'activeTextColor', 'activeBorderColor',
              'useActiveGradientBackground', 'activeGradientBackground',
              'useBorder', 'useHoverBorder', 'useActiveBorder'
            ].forEach(function (key) {
              if (Object.prototype.hasOwnProperty.call(paragraphs, key)) {
                delete paragraphs[key];
              }
            });

            ['activeBackground', 'activeTextColor', 'activeBorderColor'].forEach(function (key) {
              if (Object.prototype.hasOwnProperty.call(interaction, key)) {
                delete interaction[key];
              }
            });

            appearance.paragraphColors = next;
            appearance.paragraphInteraction = interaction;
          }

          finished(null, parameters);
        },
      },
    },
  };
})();
