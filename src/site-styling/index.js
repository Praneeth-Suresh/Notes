"use strict";

const { SITE_CSS } = require("./internal/css");
const { renderHomePage, renderPersonalPage, renderTopicPage } = require("./internal/shell");

function createSiteStylingContext() {
  return {
    getSiteCss() {
      return SITE_CSS;
    },
    renderHomePage,
    renderPersonalPage,
    renderTopicPage,
  };
}

module.exports = {
  createSiteStylingContext,
};
