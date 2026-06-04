"use strict";

const { SITE_CSS } = require("./internal/css");
const { renderBlogIndexPage, renderBlogPostPage, renderHomePage, renderPersonalPage, renderTopicPage } = require("./internal/shell");

function createSiteStylingContext() {
  return {
    getSiteCss() {
      return SITE_CSS;
    },
    renderBlogIndexPage,
    renderBlogPostPage,
    renderHomePage,
    renderPersonalPage,
    renderTopicPage,
  };
}

module.exports = {
  createSiteStylingContext,
};
