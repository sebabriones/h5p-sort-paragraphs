var H5P = H5P || {};



H5P.SortParagraphsCFRD = H5P.SortParagraphsCFRD || {};



/**

 * Play area 16:9 — scale contract aligned with Drag Question CFRD (parent width,

 * proportional fontSize) while keeping CFRD 640×360 design size.

 */

H5P.SortParagraphsCFRD.PlayArea = (function () {

  var BASE_WIDTH = 640;

  var ASPECT_RATIO = 16 / 9;

  var BASE_HEIGHT = Math.round(BASE_WIDTH / ASPECT_RATIO);

  var BASE_FONT_SIZE = 16;

  var MIN_SCALE = 0.35;

  var MAX_SCALE = 1;



  function getDesignSize() {

    return {

      width: BASE_WIDTH,

      height: BASE_HEIGHT,

      ratio: ASPECT_RATIO,

      baseWidth: BASE_WIDTH,

      baseHeight: BASE_HEIGHT,

      baseFontSize: BASE_FONT_SIZE

    };

  }



  /**

   * @param {number} width Container width in px

   * @returns {number}

   */

  function getScale(width) {

    if (!width || width <= 0) {

      return 1;

    }



    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, width / BASE_WIDTH));

  }



  /**

   * @param {number} width Container width in px

   * @returns {number}

   */

  function getScaledFontSize(width) {

    return BASE_FONT_SIZE * getScale(width);

  }



  /**

   * @param {number} width Container width in px

   * @returns {number}

   */

  function getScaledHeight(width) {

    if (!width || width <= 0) {

      return BASE_HEIGHT;

    }



    return width / ASPECT_RATIO;

  }



  /**

   * Measure play area width from parent / iframe (Drag Question pattern).

   * Forces reflow so live viewport resizes are read correctly inside H5P iframes.

   *

   * @param {HTMLElement} playAreaElement

   * @returns {number}

   */

  function getMeasureWidth(playAreaElement) {

    if (!playAreaElement) {

      return 0;

    }



    var parent = playAreaElement.parentElement;

    var frame = window.frameElement;

    var parentWidth = 0;

    var frameWidth = 0;



    if (parent) {

      parent.getBoundingClientRect();

      parentWidth = parent.clientWidth;

    }



    if (frame) {

      frame.getBoundingClientRect();

      frameWidth = frame.clientWidth;

    }



    if (frameWidth > 0) {

      if (parentWidth > 0) {

        return Math.min(parentWidth, frameWidth);

      }

      return frameWidth;

    }



    if (parentWidth > 0) {

      return parentWidth;

    }



    playAreaElement.getBoundingClientRect();

    return playAreaElement.clientWidth;

  }



  return {

    BASE_WIDTH: BASE_WIDTH,

    BASE_HEIGHT: BASE_HEIGHT,

    ASPECT_RATIO: ASPECT_RATIO,

    BASE_FONT_SIZE: BASE_FONT_SIZE,

    MIN_SCALE: MIN_SCALE,

    MAX_SCALE: MAX_SCALE,

    getDesignSize: getDesignSize,

    getScale: getScale,

    getScaledFontSize: getScaledFontSize,

    getScaledHeight: getScaledHeight,

    getMeasureWidth: getMeasureWidth

  };

})();

