"use strict";

const { createSearchEntry, renderTopicBody } = require("./internal/render-notes-html");

function createNotesContentContext() {
  return {
    createSearchEntry,
    renderTopicBody,
  };
}

module.exports = {
  createNotesContentContext,
};

