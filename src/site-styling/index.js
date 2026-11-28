"use strict";

const { SITE_CSS } = require("./internal/css");
const {
  renderBlogIndexPage,
  renderBlogPostPage,
  renderErrataPage,
  renderHomePage,
  renderNotesIndexPage,
  renderNotFoundPage,
  renderPersonalPage,
  renderResearchPage,
  renderProjectPage,
  renderProjectsIndexPage,
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
    renderNotesIndexPage,
    renderNotFoundPage,
    renderPersonalPage,
    renderResearchPage,
    renderProjectPage,
    renderProjectsIndexPage,
    renderTopicPage,
  };
}

module.exports = {
  createSiteStylingContext,
};
