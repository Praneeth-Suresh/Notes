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
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ctext y='14' font-size='14'%3ECS%3C/text%3E%3C/svg%3E" />
    <link rel="stylesheet" href="/assets/site.css" />
    <script>
      window.MathJax = {
        loader: {
          paths: { mathjax: "/assets/vendor/mathjax" }
        },
        tex: {
          inlineMath: [["\\\\(", "\\\\)"]],
          displayMath: [["\\\\[", "\\\\]"]]
        },
        svg: { fontCache: "global" }
      };
    </script>
    <script defer src="/assets/vendor/mathjax/tex-svg-full.js"></script>
  </head>
  <body${classAttribute}>
    <a class="skip-link" href="#main-content">Skip to content</a>
    <main class="layout">
      <header class="site-header">
        <a class="brand-link" href="/" data-hotkey="H">${escapeHtml(siteTitle)}</a>
        <nav class="site-links" aria-label="Site navigation">
          <a href="/about/" data-hotkey="P">Portfolio</a>
          <a href="/#main-content" data-hotkey="N">Notes</a>
        </nav>
      </header>
      ${contentHtml}
    </main>
  </body>
</html>
`;
}

function renderTopicNav({ topics, currentSlug }) {
  const links = topics
    .map((topic, index) => {
      const isActive = topic.slug === currentSlug || currentSlug.startsWith(`${topic.slug}/`);
      const activeClass = isActive ? "active" : "";
      const currentAttribute = topic.slug === currentSlug ? ` aria-current="page"` : "";
      const hotkeyAttribute = index < 9 ? ` data-hotkey="${index + 1}"` : "";
      return `<a class="${activeClass}" href="/topics/${escapeHtml(topic.slug)}/"${hotkeyAttribute}${currentAttribute}>${escapeHtml(topic.title)}</a>`;
    })
    .join("");

  return `<nav class="topic-nav" aria-label="Topic navigation"><a href="/" data-hotkey="H">Home</a>${links}</nav>`;
}

function renderTopicPage({ siteTitle, topic, topicContentHtml, topics }) {
  const descriptionHtml =
    topic.description && topic.description.trim() !== ""
      ? `<p class="topic-meta">${escapeHtml(topic.description)}</p>`
      : "";
  const parentHtml =
    topic.parentTitle && topic.parentTitle.trim() !== ""
      ? `<p class="topic-parent">Subpage of ${escapeHtml(topic.parentTitle)}</p>`
      : "";

  const content = `
    ${renderTopicNav({ topics, currentSlug: topic.slug })}
    <section id="main-content" class="panel notes-panel">
      <h1 class="site-title">${escapeHtml(topic.title)}</h1>
      ${parentHtml}
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

function renderHomePage({ siteTitle, topics, searchEntries = [] }) {
  const topicCount = topics.length;
  const topicWord = topicCount === 1 ? "topic" : "topics";
  const firstTopicLink =
    topics.length > 0
      ? `<a class="topic-index-link" href="/topics/${escapeHtml(topics[0].slug)}/">Start reading</a>`
      : "";
  const cards = topics
    .map(
      (topic, index) => `<a class="topic-card" href="/topics/${escapeHtml(topic.slug)}/" data-index="${String(index + 1).padStart(2, "0")}">
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
      urlPath: `/topics/${topic.slug}/`,
    })),
  );
  const searchPayload = safeJsonForScript(
    searchEntries.length > 0
      ? searchEntries.map((entry) => ({
          slug: entry.slug,
          title: entry.title,
          description: entry.description ?? "",
          searchableText: entry.searchableText ?? "",
          urlPath: entry.urlPath ?? `/topics/${entry.slug}/`,
          parentTitle: entry.parentTitle ?? "",
        }))
      : topics.map((topic) => ({
          slug: topic.slug,
          title: topic.title,
          description: topic.description ?? "",
          searchableText: `${topic.title} ${topic.description ?? ""}`,
          urlPath: `/topics/${topic.slug}/`,
          parentTitle: "",
        })),
  );

  const content = `
    <section class="home-hero" aria-labelledby="home-title">
      <div class="home-hero-copy">
        <p class="home-kicker">[ Field notes ]</p>
        <h1 id="home-title" class="home-title">${escapeHtml(siteTitle)}</h1>
        <p class="home-intro">A static developer-style index of algorithms, systems, data structures, and agentic coding notes, arranged for focused reading.</p>
        <div class="home-actions" aria-label="Primary actions">
          <a class="primary-action" href="#main-content" data-hotkey="T">Browse topics</a>
          <a class="secondary-action" href="/about/" data-hotkey="P">Portfolio</a>
          <a class="secondary-action" href="#topic-search" data-hotkey="S">Search notes</a>
        </div>
      </div>
      <div class="stripe-field" aria-hidden="true">
        <span class="stripe-field-label">[ Fig. 01 ]</span>
        <span class="stripe-field-title">notes.dev</span>
        <span class="stripe-field-grid"></span>
        <span class="stripe-field-orbit"></span>
      </div>
    </section>
    <section id="main-content" class="panel topic-hub" aria-labelledby="topics-title">
      <div class="topic-hub-header">
        <div>
          <p class="section-kicker">/ Feed</p>
          <h2 id="topics-title" class="section-title">Topics <sup>(${topicCount})</sup></h2>
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
      const searchEntries = ${searchPayload};
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
        grid.innerHTML = items.map((topic, index) => \`
          <a class="topic-card" href="\${topic.urlPath}" data-index="\${String(index + 1).padStart(2, "0")}">
            <h3 class="topic-card-title">\${escapeHtml(topic.title)}</h3>
            \${topic.parentTitle ? \`<p class="topic-card-parent">\${escapeHtml(topic.parentTitle)}</p>\` : ""}
            <p class="topic-card-description">\${escapeHtml(topic.description)}</p>
          </a>
        \`).join("");
        const word = items.length === 1 ? "result" : "results";
        status.textContent = \`\${items.length} \${word} shown.\`;
      }

      input.addEventListener("input", () => {
        const query = input.value.trim().toLowerCase();
        if (!query) {
          render(topics);
          return;
        }

        const filtered = searchEntries.filter((topic) =>
          topic.title.toLowerCase().includes(query) ||
          topic.description.toLowerCase().includes(query) ||
          topic.searchableText.toLowerCase().includes(query) ||
          topic.parentTitle.toLowerCase().includes(query)
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

const portfolioProjects = [
  {
    name: "Notes",
    href: "https://github.com/Praneeth-Suresh/Notes",
    kind: "Static knowledge system",
    language: "JavaScript",
    summary:
      "A Cloudflare Pages notes site with strict Notion ingestion, static search, subpage routes, and fidelity checks for LaTeX and code blocks.",
  },
  {
    name: "incident-resolving-agent",
    href: "https://github.com/Praneeth-Suresh/incident-resolving-agent",
    kind: "Agentic workflow",
    language: "Python",
    summary:
      "A suite of agentic workflows for resolving incident reports and executing solutions, with future directions around multimodal incident input and LLM fine-tuning.",
  },
  {
    name: "OpenAIBuild",
    href: "https://github.com/Praneeth-Suresh/OpenAIBuild",
    kind: "Applied AI tool",
    language: "Shell",
    summary:
      "A legal document generator project that reflects a practical pattern: wrap AI capability in a concrete workflow instead of leaving it as a demo.",
  },
  {
    name: "LOBForecasting",
    href: "https://github.com/Praneeth-Suresh/LOBForecasting",
    kind: "Forecasting research",
    language: "Jupyter Notebook",
    summary:
      "A notebook-based forecasting project, part of a broader repository cluster around time-series modeling and applied machine learning.",
  },
  {
    name: "Sentiment-Analyzer",
    href: "https://github.com/Praneeth-Suresh/Sentiment-Analyzer",
    kind: "NLP analysis",
    language: "Jupyter Notebook",
    summary:
      "Analyzes sentiment in official documents to understand policy direction and public positioning.",
  },
  {
    name: "ReinforcementLearning",
    href: "https://github.com/Praneeth-Suresh/ReinforcementLearning",
    kind: "Research primer",
    language: "Jupyter Notebook",
    summary:
      "A primer to reinforcement learning, sitting beside self-led TensorFlow and deep learning explorations.",
  },
];

const repositoryGroups = [
  {
    label: "AI and ML research",
    repos: [
      "LOBForecasting",
      "Sentiment-Analyzer",
      "ReinforcementLearning",
      "CT-image",
      "IntroductoryTensorflow",
      "DeepLearningWeek",
      "MLdrivenDataAnalysisCensus2011",
      "ForecastingFastestCoderFirst",
    ],
  },
  {
    label: "Software and app systems",
    repos: [
      "Notes",
      "AgentCoding",
      "OpenAIBuild",
      "spill",
      "ORCaseAnalysis",
      "Stochron",
      "VentApp",
      "SnapSteady",
      "CyberCupid",
      "DLW",
    ],
  },
  {
    label: "Energy, data, and experiments",
    repos: [
      "ocf-data-sampler",
      "pv-site-datamodel",
      "PVNet",
      "Streamlit",
      "reprose",
      "2025_aoc",
      "skills-github-pages",
      "Praneeth-Suresh.github.io",
      "Praneeth-Suresh",
      "SisThinkers",
    ],
  },
];

function renderPersonalPage({ siteTitle }) {
  const projectCards = portfolioProjects
    .map(
      (project, index) => `<a class="portfolio-project" href="${escapeHtml(project.href)}" data-index="${String(index + 1).padStart(2, "0")}">
  <span class="portfolio-project-kind">${escapeHtml(project.kind)} / ${escapeHtml(project.language)}</span>
  <h3>${escapeHtml(project.name)}</h3>
  <p>${escapeHtml(project.summary)}</p>
</a>`,
    )
    .join("");

  const repoGroups = repositoryGroups
    .map(
      (group) => `<section class="repo-group" aria-label="${escapeHtml(group.label)}">
  <h3>${escapeHtml(group.label)}</h3>
  <ul>
    ${group.repos
      .map(
        (repo) =>
          `<li><a href="https://github.com/Praneeth-Suresh/${escapeHtml(repo)}">${escapeHtml(repo)}</a></li>`,
      )
      .join("")}
  </ul>
</section>`,
    )
    .join("");

  const content = `
    <nav class="topic-nav" aria-label="Portfolio navigation">
      <a href="/" data-hotkey="H">Home</a>
      <a href="/#main-content" data-hotkey="N">Notes</a>
      <a class="active" href="/about/" data-hotkey="P" aria-current="page">Portfolio</a>
    </nav>
    <section id="main-content" class="portfolio-hero" aria-labelledby="portfolio-title">
      <div class="portfolio-hero-copy">
        <p class="home-kicker">[ Portfolio ]</p>
        <h1 id="portfolio-title" class="portfolio-title">Praneeth Suresh</h1>
        <p class="portfolio-intro">Software engineer and AI developer/researcher building practical systems around machine learning, agentic workflows, static knowledge tools, and data-heavy product ideas.</p>
        <div class="portfolio-actions" aria-label="Profile links">
          <a class="primary-action" href="https://github.com/Praneeth-Suresh" data-hotkey="G">GitHub</a>
          <a class="secondary-action" href="https://www.linkedin.com/in/praneeth-suresh-a114aa250/" data-hotkey="L">LinkedIn</a>
        </div>
      </div>
      <div class="portfolio-signal" aria-hidden="true">
        <span class="portfolio-signal-label">public.signal</span>
        <span class="portfolio-signal-node portfolio-signal-node-a"></span>
        <span class="portfolio-signal-node portfolio-signal-node-b"></span>
        <span class="portfolio-signal-node portfolio-signal-node-c"></span>
      </div>
    </section>
    <section class="portfolio-strip" aria-label="Portfolio summary">
      <div>
        <span>29</span>
        <p>public GitHub repositories reviewed</p>
      </div>
      <div>
        <span>AI + SWE</span>
        <p>research notebooks, apps, agents, and static systems</p>
      </div>
      <div>
        <span>source-bound</span>
        <p>details come from public GitHub plus the approved LinkedIn URL</p>
      </div>
    </section>
    <section class="panel portfolio-section" aria-labelledby="portfolio-philosophy">
      <div class="portfolio-section-header">
        <p class="section-kicker">/ Philosophy</p>
        <h2 id="portfolio-philosophy" class="section-title">Build the thing, then make it explainable.</h2>
      </div>
      <div class="portfolio-philosophy-grid">
        <p>Praneeth describes himself publicly as a passionate AI developer, a self-taught developer driven by curiosity, and someone who enjoys the art of problem solving.</p>
        <p>His project trail moves from baseline ANNs into RNNs, LSTMs, HMMs, CNNs, explainable AI, representation analysis, application development, and AI-augmented software engineering.</p>
      </div>
    </section>
    <section class="panel portfolio-section" aria-labelledby="portfolio-projects">
      <div class="portfolio-section-header">
        <p class="section-kicker">/ Selected builds</p>
        <h2 id="portfolio-projects" class="section-title">A working portfolio, not a trophy shelf.</h2>
      </div>
      <div class="portfolio-project-grid">${projectCards}</div>
    </section>
    <section class="panel portfolio-section" aria-labelledby="portfolio-index">
      <div class="portfolio-section-header">
        <p class="section-kicker">/ Repository map</p>
        <h2 id="portfolio-index" class="section-title">Project terrain</h2>
      </div>
      <div class="repo-map">${repoGroups}</div>
    </section>
    <section class="source-note" aria-label="Source note">
      <p>Source note: LinkedIn required authentication during retrieval, so the page avoids LinkedIn-only claims. Public facts are drawn from the approved GitHub profile and repository pages, including the LinkedIn profile URL exposed there.</p>
    </section>
  `;

  return renderLayout({
    pageTitle: `Praneeth Suresh · ${siteTitle}`,
    siteTitle,
    contentHtml: content,
    bodyClass: "portfolio-page",
  });
}

module.exports = {
  renderHomePage,
  renderPersonalPage,
  renderTopicPage,
};
