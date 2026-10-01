"use strict";

// Edge-case fixtures from the redesign brief: deep ancestry, list sizes, empty listings,
// missing optional data, and status display rules.

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  renderBlogIndexPage,
  renderProjectsIndexPage,
  renderProjectPage,
  renderTopicPage,
} = require("../src/site-styling/internal/shell");

const working = { status: "Working note", statusSlug: "working", contentType: "Explainer", knownGaps: [], related: [] };

function note({ title = "Note", ancestors = [], pillar = null, notes = [], publication = working } = {}) {
  return renderTopicPage({
    siteTitle: "Praneeth Suresh",
    topic: {
      slug: "t/x",
      urlPath: "/topics/t/x/",
      title,
      parentTitle: ancestors.length ? ancestors.at(-1).title : "",
      parentUrlPath: ancestors.length ? ancestors.at(-1).urlPath : "",
      ancestors,
      publication,
      pillar,
      notes,
      related: [],
      corrections: [],
    },
    topicContentHtml: '<article id="overview" class="note-article"><p>Body</p></article>',
    topics: [{ slug: "t", title: "T" }],
  });
}

test("six-level breadcrumbs keep Notes, the immediate parent, and the current page visible", () => {
  const ancestors = ["A", "B", "C", "D", "E"].map((name, index) => ({ title: name, urlPath: `/topics/${"abcde".slice(0, index + 1).split("").join("/")}/` }));
  const html = note({ title: "Leaf", ancestors });
  const crumb = html.match(/<nav class="breadcrumb"[\s\S]*?<\/nav>/u)[0];
  assert.match(crumb, /<li><a href="\/notes\/">Notes<\/a><\/li>/u);
  assert.match(crumb, /<li class="crumb-collapse"><details><summary aria-label="Show 4 more levels">…<\/summary>/u);
  assert.match(crumb, /<li><a href="\/topics\/a\/b\/c\/d\/e\/">E<\/a><\/li><li aria-current="page">Leaf<\/li>/u);
  assert.equal((crumb.match(/class="crumb-middle"/gu) || []).length, 4);
});

test("short breadcrumbs render without a collapse control", () => {
  const html = note({ ancestors: [{ title: "T", urlPath: "/topics/t/" }] });
  assert.ok(!html.includes("crumb-collapse"));
});

test("a 120-character title renders intact as the only H1", () => {
  const title = "A".repeat(60) + " " + "B".repeat(59);
  const html = note({ title });
  assert.equal((html.match(/<h1[\s>]/gu) || []).length, 1);
  assert.ok(html.includes(`>${title}</h1>`));
});

function rootWith(count) {
  const links = Array.from({ length: count }, (_, i) => ({ title: `Step ${i + 1}`, href: `/topics/t/s${i}/`, publication: working }));
  return note({ pillar: { startHere: [], readingPath: count ? [{ label: "Group", links }] : [] }, notes: links.map((l) => ({ title: l.title, urlPath: l.href, publication: working })) });
}

test("Contents opens groups for six or fewer pages and collapses larger topics", () => {
  assert.ok(rootWith(1).includes('<details class="contents-group" open>'));
  assert.ok(rootWith(6).includes('<details class="contents-group" open>'));
  const large = rootWith(200);
  assert.ok(large.includes('<details class="contents-group"><summary><span>Group</span><small>200 pages</small>'));
  assert.equal((large.match(/class="page-row"/gu) || []).length, 200);
  assert.ok(!rootWith(0).includes('class="topic-pillar"'), "no empty Contents wrapper");
});

test("sparse status: unmarked Working rows, visible Reviewed and Archived tags, explicit note status", () => {
  const reviewed = { ...working, status: "Reviewed note", statusSlug: "reviewed", reviewedAt: "2026-09-30" };
  const archived = { ...working, status: "Archived", statusSlug: "archived", archiveReason: "Superseded." };
  const notes = [
    { title: "W", urlPath: "/topics/t/w/", publication: working },
    { title: "R", urlPath: "/topics/t/r/", publication: reviewed },
    { title: "A", urlPath: "/topics/t/a/", publication: archived },
  ];
  const html = note({ pillar: { startHere: [], readingPath: [] }, notes });
  assert.ok(html.includes("Unmarked notes are working notes: public, not yet reviewed."));
  assert.ok(!/<span class="note-status note-status-working">/u.test(html.split("contents-groups")[1]));
  assert.ok(html.includes('<span class="note-status note-status-reviewed">Reviewed note</span>'));
  assert.ok(html.includes('<span class="note-status note-status-archived">Archived</span>'));
  assert.ok(html.includes('class="note-status note-status-working">Working note</a>'), "direct note status stays explicit");
  assert.ok(note({ publication: archived }).includes("<strong>Archived:</strong> Superseded."));
});

test("known gaps render as a disclosure only when present", () => {
  assert.ok(!note().includes("note-known-gaps"));
  assert.ok(note({ publication: { ...working, knownGaps: ["Proof missing."] } }).includes('<details class="note-known-gaps"><summary>Known gaps (1)</summary>'));
});

test("empty listings explain what is missing instead of rendering empty wrappers", () => {
  assert.ok(renderProjectsIndexPage({ siteTitle: "Praneeth Suresh", projectsData: { projects: [] } }).includes("No projects are listed yet."));
  assert.ok(renderBlogIndexPage({ siteTitle: "Praneeth Suresh", blogManifest: { sections: [] } }).includes("No writing has been published yet."));
});

test("projects without optional data omit empty properties and artifact wrappers", () => {
  const html = renderProjectPage({ siteTitle: "Praneeth Suresh", project: { slug: "bare", title: "Bare", summary: "Only a summary." }, projectsData: { projects: [] } });
  assert.ok(!html.includes("project-artifact"));
  assert.ok(!html.includes("<dt>Role</dt>"));
  assert.ok(!html.includes("<dt>Repository</dt>"));
  assert.ok(!html.includes(">Evidence</h2>"));
});
