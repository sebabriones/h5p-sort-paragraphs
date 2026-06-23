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
      1: {
        /**
         * Initial CFRD line 1.1 (fork from upstream H5P.SortParagraphs 0.11.16).
         */
        0: function (parameters, finished, extras) {
          finished(null, parameters, extras);
        },

        /**
         * CFRD port: taskDescription → instructions, media → context, l10n → UI,
         * overallFeedback popup wrapper.
         */
        1: function (parameters, finished) {
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
        2: function (parameters, finished) {
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
         * CFRD visual: theme colors, scaling, showScorePoints default.
         */
        4: function (parameters, finished) {
          if (parameters && parameters.behaviour && parameters.behaviour.showScorePoints === undefined) {
            parameters.behaviour.showScorePoints = false;
          }

          finished(null, parameters);
        },

        /**
         * Drag Question-style scaling: unbounded scale, 16:9 height from JS.
         */
        5: function (parameters, finished) {
          finished(null, parameters);
        },

        /**
         * Fix play area height: aspect-ratio 16:9 in CSS, fontSize-only resize (MC pattern).
         */
        6: function (parameters, finished) {
          finished(null, parameters);
        },

        /**
         * Scale rich text with play area: em theme tokens, strip editor font-size, CSS anchors.
         */
        7: function (parameters, finished) {
          finished(null, parameters);
        },

        /**
         * CFRD: movement buttons always horizontal (no vertical stack on resize).
         */
        8: function (parameters, finished) {
          finished(null, parameters);
        },

        /**
         * Live resize: parent/iframe width measure, deferred apply, single play-area fontSize root.
         */
        9: function (parameters, finished) {
          finished(null, parameters);
        },

        /**
         * Fix PlayArea API lost when webpack bundle overwrote H5P.SortParagraphsCFRD namespace.
         */
        10: function (parameters, finished) {
          finished(null, parameters);
        },

        /**
         * Instructions padding (rem + scale), MAX_SCALE, movement buttons scale with --sp-scale.
         */
        11: function (parameters, finished) {
          finished(null, parameters);
        },
      },
    },
  };
})();
