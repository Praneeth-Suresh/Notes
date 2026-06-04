"use strict";

const { createSearchEntry, renderTopicBody } = require("./internal/render-notes-html");
const { renderBlogBody, createBlogSearchEntry } = require("./internal/render-blog-html");

function createNotesContentContext() {
  return {
    createSearchEntry,
    renderTopicBody,
    renderBlogBody,
    createBlogSearchEntry,
  };
}

module.exports = {
  createNotesContentContext,
};

