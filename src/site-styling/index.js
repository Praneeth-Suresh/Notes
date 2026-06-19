"use strict";

const { SITE_CSS } = require("./internal/css");
const {
  renderBlogIndexPage,
  renderBlogPostPage,
  renderErrataPage,
  renderHomePage,
  renderPersonalPage,
  renderResearchTastePage,
  renderStartHerePage,
  renderSubscribePage,
  renderTopicPage,
} = require("./internal/shell");

function createSiteStylingContext() {
  return {
    getSiteCss() {
      return SITE_CSS;
    },
    renderBlogIndexPage,
    renderBlogPostPage,
    renderErrataPage,
    renderHomePage,
    renderPersonalPage,
    renderResearchTastePage,
    renderStartHerePage,
    renderSubscribePage,
    renderTopicPage,
  };
}

module.exports = {
  createSiteStylingContext,
};
