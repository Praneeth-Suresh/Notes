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

function renderLayout({ pageTitle, siteTitle, contentHtml }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(pageTitle)}</title>
    <link rel="stylesheet" href="/assets/site.css" />
  </head>
  <body>
    <main class="layout">
      <header class="site-header">
        <h1 class="site-title">${escapeHtml(siteTitle)}</h1>
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
      return `<a class="${activeClass}" href="/topics/${escapeHtml(topic.slug)}/">${escapeHtml(topic.title)}</a>`;
    })
    .join("");

  return `<nav class="topic-nav"><a href="/">Home</a>${links}</nav>`;
}

function renderTopicPage({ siteTitle, topic, topicContentHtml, topics }) {
  const descriptionHtml =
    topic.description && topic.description.trim() !== ""
      ? `<p class="topic-meta">${escapeHtml(topic.description)}</p>`
      : "";

  const content = `
    ${renderTopicNav({ topics, currentSlug: topic.slug })}
    <section class="panel">
      <h2 class="site-title">${escapeHtml(topic.title)}</h2>
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
    <section class="panel">
      <input id="topic-search" class="topic-search" type="search" placeholder="Search topics..." aria-label="Search topics" />
      <div id="topic-grid" class="topic-grid">${cards}</div>
    </section>
    <script>
      const topics = ${topicsPayload};
      const input = document.getElementById("topic-search");
      const grid = document.getElementById("topic-grid");

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
  });
}

module.exports = {
  renderHomePage,
  renderTopicPage,
};
