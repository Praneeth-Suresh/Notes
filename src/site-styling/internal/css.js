"use strict";

const SITE_CSS = `
:root {
  color-scheme: light dark;
  --bg: #f5f2ea;
  --surface: #fffdf8;
  --text: #1e1a16;
  --muted: #6a6258;
  --border: #ded5c8;
  --accent: #5a4d3f;
  --inline-code-bg: #f0ebe2;
  --code-bg: #1f1f1f;
  --code-text: #f5f5f5;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #171513;
    --surface: #1f1b18;
    --text: #f0ece8;
    --muted: #b9aea1;
    --border: #3a312a;
    --accent: #d0b89d;
    --inline-code-bg: #2b241f;
    --code-bg: #101010;
    --code-text: #f5f5f5;
  }
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "Inter", "Segoe UI", Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.7;
}

a {
  color: inherit;
}

.layout {
  max-width: 960px;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 4rem;
}

.site-header {
  margin-bottom: 2rem;
}

.site-title {
  margin: 0;
  font-family: "Lora", "Times New Roman", serif;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.site-subtitle {
  margin: 0.5rem 0 0;
  color: var(--muted);
}

.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1.25rem;
}

.topic-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.topic-card {
  display: block;
  text-decoration: none;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
  background: color-mix(in oklab, var(--surface) 92%, transparent);
}

.topic-card:hover {
  border-color: var(--accent);
}

.topic-card-title {
  margin: 0;
  font-family: "Lora", "Times New Roman", serif;
  font-size: 1.1rem;
}

.topic-card-description {
  margin: 0.6rem 0 0;
  color: var(--muted);
  font-size: 0.95rem;
}

.topic-search {
  width: 100%;
  margin: 0 0 1rem;
  padding: 0.7rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text);
}

.topic-meta {
  color: var(--muted);
  margin: 0.25rem 0 1rem;
}

.note-heading {
  font-family: "Lora", "Times New Roman", serif;
  line-height: 1.3;
  margin: 1.2rem 0 0.5rem;
}

.note-heading-1 {
  font-size: 1.9rem;
}

.note-heading-2 {
  font-size: 1.5rem;
}

.note-heading-3 {
  font-size: 1.25rem;
}

.note-paragraph {
  margin: 0.75rem 0;
}

.note-list {
  margin: 0.6rem 0 0.85rem 1.2rem;
  padding: 0;
}

.note-list-item {
  margin: 0.35rem 0;
}

.note-inline-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  background: var(--inline-code-bg);
  border-radius: 6px;
  padding: 0.1rem 0.35rem;
}

.note-code-block {
  margin: 1rem 0;
  background: var(--code-bg);
  color: var(--code-text);
  border-radius: 10px;
  padding: 1rem;
  overflow-x: auto;
}

.note-code-block code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  white-space: pre;
}

.note-equation,
.note-inline-equation {
  font-family: "Times New Roman", serif;
}

.note-equation {
  margin: 1rem 0;
  padding: 0.6rem 0.8rem;
  border-left: 3px solid var(--accent);
  background: color-mix(in oklab, var(--surface) 88%, transparent);
}

.note-quote {
  border-left: 3px solid var(--border);
  margin: 1rem 0;
  padding: 0.3rem 0.9rem;
  color: var(--muted);
}

.note-divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 1.2rem 0;
}

.topic-nav {
  margin: 0 0 1.2rem;
  font-size: 0.95rem;
}

.topic-nav a {
  color: var(--muted);
  text-decoration: none;
  margin-right: 0.85rem;
}

.topic-nav a.active {
  color: var(--accent);
  font-weight: 600;
}
`;

module.exports = {
  SITE_CSS,
};

