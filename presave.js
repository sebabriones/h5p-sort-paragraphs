var H5PPresave = H5PPresave || {};

/**
 * Resolve the presave logic for Sort the Paragraphs (CFRD).
 *
 * Max score matches the player:
 * - scoringMode "positions" → number of paragraphs
 * - scoringMode "transitions" → number of paragraphs − 1
 *
 * @param {object} content
 * @param {function} finished
 * @constructor
 */
H5PPresave['H5P.SortParagraphsCFRD'] = function (content, finished) {
  var presave = H5PEditor.Presave;
  var paragraphs;
  var score = 0;
  var scoringMode = 'positions';

  if (isContentInvalid()) {
    throw new presave.exceptions.InvalidContentSemanticsException(
      'Invalid Sort Paragraphs Error'
    );
  }

  paragraphs = content.paragraphs.filter(function (paragraph) {
    return typeof paragraph === 'string' && paragraph.trim().length > 0;
  });

  if (
    presave.checkNestedRequirements(content, 'content.behaviour.scoringMode') &&
    content.behaviour.scoringMode
  ) {
    scoringMode = content.behaviour.scoringMode;
  }

  if (scoringMode === 'transitions') {
    score = Math.max(paragraphs.length - 1, 0);
  }
  else {
    score = paragraphs.length;
  }

  presave.validateScore(score);

  finished({ maxScore: score });

  /**
   * Check if required parameters are present.
   * @return {boolean}
   */
  function isContentInvalid() {
    return !presave.checkNestedRequirements(content, 'content.paragraphs') ||
      !Array.isArray(content.paragraphs) ||
      content.paragraphs.length === 0;
  }
};
