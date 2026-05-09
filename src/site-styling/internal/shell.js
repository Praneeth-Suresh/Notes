"use strict";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeJsonForScript(value) {
  return JSON.stringify(value).replaceAll("</script>", "<\\/script>");
}

function renderLayout({ pageTitle, siteTitle, contentHtml, bodyClass = "" }) {
  const classAttribute = bodyClass ? ` class="${escapeHtml(bodyClass)}"` : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(pageTitle)}</title>
    <link rel="stylesheet" href="/assets/site.css" />
  </head>
  <body${classAttribute}>
    <a class="skip-link" href="#main-content">Skip to notes</a>
    <main class="layout">
      <header class="site-header">
        <a class="brand-link" href="/">${escapeHtml(siteTitle)}</a>
        <p class="site-subtitle">Minimalist notes for Computer Science enthusiasts.</p>
      </header>
      ${contentHtml}
    </main>
  </body>
</html>
`;
}

function renderTopicNav({ topics, currentSlug }) {
  const links = topics
    .map((topic) => {
      const activeClass = topic.slug === currentSlug ? "active" : "";
      const currentAttribute = topic.slug === currentSlug ? ` aria-current="page"` : "";
      return `<a class="${activeClass}" href="/topics/${escapeHtml(topic.slug)}/"${currentAttribute}>${escapeHtml(topic.title)}</a>`;
    })
    .join("");

  return `<nav class="topic-nav" aria-label="Topic navigation"><a href="/">Home</a>${links}</nav>`;
}

function renderTopicPage({ siteTitle, topic, topicContentHtml, topics }) {
  const descriptionHtml =
    topic.description && topic.description.trim() !== ""
      ? `<p class="topic-meta">${escapeHtml(topic.description)}</p>`
      : "";

  const content = `
    ${renderTopicNav({ topics, currentSlug: topic.slug })}
    <section id="main-content" class="panel notes-panel">
      <h1 class="site-title">${escapeHtml(topic.title)}</h1>
      ${descriptionHtml}
      ${topicContentHtml}
    </section>
  `;

  return renderLayout({
    pageTitle: `${topic.title} · ${siteTitle}`,
    siteTitle,
    contentHtml: content,
  });
}

function renderHomePage({ siteTitle, topics }) {
  const topicCount = topics.length;
  const topicWord = topicCount === 1 ? "topic" : "topics";
  const firstTopicLink =
    topics.length > 0
      ? `<a class="topic-index-link" href="/topics/${escapeHtml(topics[0].slug)}/">Start reading</a>`
      : "";
  const cards = topics
    .map(
      (topic) => `<a class="topic-card" href="/topics/${escapeHtml(topic.slug)}/">
  <h3 class="topic-card-title">${escapeHtml(topic.title)}</h3>
  <p class="topic-card-description">${escapeHtml(topic.description ?? "")}</p>
</a>`,
    )
    .join("");

  const topicsPayload = safeJsonForScript(
    topics.map((topic) => ({
      slug: topic.slug,
      title: topic.title,
      description: topic.description ?? "",
    })),
  );

  const content = `
    <section class="home-hero" aria-labelledby="home-title">
      <div class="home-hero-copy">
        <p class="home-kicker">Field notes in Computer Science</p>
        <h1 id="home-title" class="home-title">${escapeHtml(siteTitle)}</h1>
        <p class="home-intro">A quiet index of algorithms, systems, data structures, and agentic coding notes, arranged for focused reading.</p>
        <div class="home-actions" aria-label="Primary actions">
          <a class="primary-action" href="#main-content">Browse topics</a>
          <a class="secondary-action" href="#topic-search">Search notes</a>
        </div>
      </div>
      <div class="library-mark" aria-hidden="true">
        <span class="shelf-line"></span>
        <span class="shelf-row">
          <span></span><span></span><span></span><span></span>
        </span>
        <span class="shelf-note">CS</span>
      </div>
    </section>
    <section id="main-content" class="panel topic-hub" aria-labelledby="topics-title">
      <div class="topic-hub-header">
        <div>
          <p class="section-kicker">${topicCount} ${topicWord}</p>
          <h2 id="topics-title" class="section-title">Browse the shelves</h2>
        </div>
        ${firstTopicLink}
      </div>
      <label class="topic-search-label" for="topic-search">Search topics</label>
      <input id="topic-search" class="topic-search" type="search" placeholder="Try algorithms, systems, coding..." aria-describedby="topic-search-status" />
      <p id="topic-search-status" class="topic-search-status" aria-live="polite">${topicCount} ${topicWord} available.</p>
      <div id="topic-grid" class="topic-grid">${cards}</div>
    </section>
    <script>
      const topics = ${topicsPayload};
      const input = document.getElementById("topic-search");
      const grid = document.getElementById("topic-grid");
      const status = document.getElementById("topic-search-status");

      function escapeHtml(value) {
        return String(value)
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#39;");
      }

      function render(items) {
        grid.innerHTML = items.map((topic) => \`
          <a class="topic-card" href="/topics/\${topic.slug}/">
            <h3 class="topic-card-title">\${escapeHtml(topic.title)}</h3>
            <p class="topic-card-description">\${escapeHtml(topic.description)}</p>
          </a>
        \`).join("");
        const word = items.length === 1 ? "topic" : "topics";
        status.textContent = \`\${items.length} \${word} shown.\`;
      }

      input.addEventListener("input", () => {
        const query = input.value.trim().toLowerCase();
        if (!query) {
          render(topics);
          return;
        }

        const filtered = topics.filter((topic) =>
          topic.title.toLowerCase().includes(query) ||
          topic.description.toLowerCase().includes(query)
        );
        render(filtered);
      });
    </script>
  `;

  return renderLayout({
    pageTitle: siteTitle,
    siteTitle,
    contentHtml: content,
    bodyClass: "home-page",
  });
}

module.exports = {
  renderHomePage,
  renderTopicPage,
};
