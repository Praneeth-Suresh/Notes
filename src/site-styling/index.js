"use strict";

const { SITE_CSS } = require("./internal/css");
const { renderHomePage, renderTopicPage } = require("./internal/shell");

function createSiteStylingContext() {
  return {
    getSiteCss() {
      return SITE_CSS;
    },
    renderHomePage,
    renderTopicPage,
  };
}

module.exports = {
  createSiteStylingContext,
};

