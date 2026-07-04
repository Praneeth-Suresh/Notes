"use strict";

const { SITE_CSS } = require("./internal/css");
const {
  renderBlogIndexPage,
  renderBlogPostPage,
  renderCollaboratePage,
  renderContactPage,
  renderErrataPage,
  renderHomePage,
  renderNotesIndexPage,
  renderNotFoundPage,
  renderPersonalPage,
  renderProjectPage,
  renderProjectsIndexPage,
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
    renderCollaboratePage,
    renderContactPage,
    renderErrataPage,
    renderHomePage,
    renderNotesIndexPage,
    renderNotFoundPage,
    renderPersonalPage,
    renderProjectPage,
    renderProjectsIndexPage,
    renderResearchTastePage,
    renderStartHerePage,
    renderSubscribePage,
    renderTopicPage,
  };
}

module.exports = {
  createSiteStylingContext,
};
