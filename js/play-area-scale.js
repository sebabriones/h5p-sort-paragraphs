var H5P = H5P || {};

H5P.SortParagraphsCFRD = H5P.SortParagraphsCFRD || {};

/**
 * Play area 16:9 — scale contract aligned with Multi Choice CFRD 1.0
 * (640×360 design size, fluid width, proportional fontSize).
 * Height capping (footer reserve) applies only in fullscreen to avoid
 * fighting h5p-standalone iframe auto-height in normal view.
 */
H5P.SortParagraphsCFRD.PlayArea = (function () {
  var BASE_WIDTH = 640;
  var ASPECT_RATIO = 16 / 9;
  var BASE_HEIGHT = Math.round(BASE_WIDTH / ASPECT_RATIO);
  var BASE_FONT_SIZE = 16;
  var MIN_SCALE = 0.35;
  var MAX_SCALE = 1;
  /** Space for action buttons + margins below the play area */
  var FOOTER_RESERVE_PX = 96;
  /** Extra when inline scorebar is visible */
  var SCOREBAR_RESERVE_PX = 64;

  /**
   * @returns {{width: number, height: number, ratio: number, baseWidth: number, baseHeight: number, baseFontSize: number}}
   */
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
   * @param {number} [height] Available play-area height in px (omit / 0 = width only)
   * @returns {number}
   */
  function getScale(width, height) {
    var scaleW = (!width || width <= 0) ? 1 : width / BASE_WIDTH;
    var scaleH = (!height || height <= 0) ? Number.POSITIVE_INFINITY : height / BASE_HEIGHT;
    var scale = Math.min(scaleW, scaleH);

    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
  }

  /**
   * @param {number} width Container width in px
   * @param {number} [height] Available play-area height in px
   * @returns {number}
   */
  function getScaledFontSize(width, height) {
    return BASE_FONT_SIZE * getScale(width, height);
  }

  /**
   * Measure play area width from parent / iframe.
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

  /**
   * Viewport / iframe height available to the content (not content-driven height).
   *
   * @param {HTMLElement} playAreaElement
   * @returns {number}
   */
  function getMeasureViewportHeight(playAreaElement) {
    var frame = window.frameElement;
    var frameHeight = 0;
    var viewHeight = window.innerHeight || document.documentElement.clientHeight || 0;

    if (frame) {
      frame.getBoundingClientRect();
      frameHeight = frame.clientHeight;
    }

    if (frameHeight > 0 && viewHeight > 0) {
      return Math.min(frameHeight, viewHeight);
    }

    if (frameHeight > 0) {
      return frameHeight;
    }

    return viewHeight;
  }

  /**
   * True when H5P / browser fullscreen is active (class or Fullscreen API).
   *
   * @param {HTMLElement} [playAreaElement]
   * @returns {boolean}
   */
  function isFullscreenContext(playAreaElement) {
    if (document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement) {
      return true;
    }

    var root = document.documentElement;
    var body = document.body;
    if ((root && (root.classList.contains('h5p-fullscreen') || root.classList.contains('h5p-semi-fullscreen'))) ||
        (body && (body.classList.contains('h5p-fullscreen') || body.classList.contains('h5p-semi-fullscreen')))) {
      return true;
    }

    var node = playAreaElement;
    while (node) {
      if (node.classList &&
          (node.classList.contains('h5p-fullscreen') || node.classList.contains('h5p-semi-fullscreen'))) {
        return true;
      }
      node = node.parentElement;
    }

    var frame = window.frameElement;
    if (frame) {
      var host = frame.parentElement;
      while (host) {
        if (host.classList &&
            (host.classList.contains('h5p-fullscreen') || host.classList.contains('h5p-semi-fullscreen'))) {
          return true;
        }
        host = host.parentElement;
      }
    }

    return false;
  }

  /**
   * Fixed reserve for evaluation footer (avoids measuring during scale).
   *
   * @param {HTMLElement} playAreaElement
   * @returns {number}
   */
  function getFooterReserve(playAreaElement) {
    var reserve = FOOTER_RESERVE_PX;
    var parent = playAreaElement && playAreaElement.parentElement;

    if (!parent) {
      return reserve;
    }

    if (parent.querySelector(':scope > .h5p-question-scorebar.h5p-question-visible')) {
      reserve += SCOREBAR_RESERVE_PX;
    }

    return reserve;
  }

  /**
   * Max height the 16:9 play area may use without covering the footer.
   * Only in fullscreen — returns 0 otherwise (no cap; avoids iframe auto-height loops).
   *
   * @param {HTMLElement} playAreaElement
   * @param {number} width Measured width in px
   * @returns {number}
   */
  function getPlayAreaMaxHeight(playAreaElement, width) {
    if (!width || width <= 0 || !isFullscreenContext(playAreaElement)) {
      return 0;
    }

    var viewportHeight = getMeasureViewportHeight(playAreaElement);
    if (!viewportHeight || viewportHeight <= 0) {
      return 0;
    }

    var available = viewportHeight - getFooterReserve(playAreaElement);
    if (available <= 0) {
      return 0;
    }

    var naturalHeight = width / ASPECT_RATIO;
    if (naturalHeight <= available) {
      return 0;
    }

    return available;
  }

  return {
    BASE_WIDTH: BASE_WIDTH,
    BASE_HEIGHT: BASE_HEIGHT,
    ASPECT_RATIO: ASPECT_RATIO,
    BASE_FONT_SIZE: BASE_FONT_SIZE,
    MIN_SCALE: MIN_SCALE,
    MAX_SCALE: MAX_SCALE,
    FOOTER_RESERVE_PX: FOOTER_RESERVE_PX,
    SCOREBAR_RESERVE_PX: SCOREBAR_RESERVE_PX,
    getDesignSize: getDesignSize,
    getScale: getScale,
    getScaledFontSize: getScaledFontSize,
    getMeasureWidth: getMeasureWidth,
    getMeasureViewportHeight: getMeasureViewportHeight,
    isFullscreenContext: isFullscreenContext,
    getFooterReserve: getFooterReserve,
    getPlayAreaMaxHeight: getPlayAreaMaxHeight
  };
})();
