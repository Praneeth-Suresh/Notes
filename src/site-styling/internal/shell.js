"use strict";

const DEFAULT_SITE_URL = "https://notes.praneeth-suresh-s.workers.dev";
const HOME_DESCRIPTION = "Rigorous notes on algorithms, computation, systems, and AI engineering, written for readers who want the idea, the formal model, and the proof sketch in one place.";
const BLOG_INDEX_DESCRIPTION = "Stories, project notes, and AI research reflections from Computer Science Notes.";
const START_HERE_DESCRIPTION = "A guided first path through Computer Science Notes: start with Algorithms, read one proof-backed note, and subscribe by RSS.";
const RESEARCH_TASTE_DESCRIPTION = "A public research taste list for Computer Science Notes: theoretical CS topics, why they matter, and source trails.";
const ERRATA_DESCRIPTION = "Public corrections and clarification policy for Computer Science Notes.";
const SUBSCRIBE_DESCRIPTION = "Subscribe to Computer Science Notes by RSS while the email newsletter provider is being selected.";
const SOCIAL_PREVIEW_IMAGE_PATH = "/assets/social/theoretical-cs-preview.svg";
const SOCIAL_PREVIEW_IMAGE_ALT = "Theoretical CS, from intuition to proof.";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeJsonForScript(value) {
  return JSON.stringify(value).replace(/<\/script/giu, "<\\/script");
}

function normalizeSiteUrl(siteUrl) {
  return typeof siteUrl === "string" && siteUrl.trim() !== ""
    ? siteUrl.trim().replace(/\/+$/u, "")
    : DEFAULT_SITE_URL;
}

function absoluteUrl(siteUrl, urlPath) {
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl);
  const normalizedPath = typeof urlPath === "string" && urlPath.startsWith("/")
    ? urlPath
    : `/${urlPath || ""}`;
  return `${normalizedSiteUrl}${normalizedPath}`;
}

function renderJsonLd(data) {
  if (!data) {
    return "";
  }

  const items = Array.isArray(data) ? data : [data];
  return items
    .filter(Boolean)
    .map((item) => `    <script type="application/ld+json">${safeJsonForScript(item)}</script>`)
    .join("\n");
}

function resolveSocialImageUrl({ canonicalUrl, socialImageUrl }) {
  if (typeof socialImageUrl === "string" && socialImageUrl.trim() !== "") {
    return socialImageUrl.trim();
  }

  if (typeof canonicalUrl === "string" && canonicalUrl.trim() !== "") {
    try {
      return new URL(SOCIAL_PREVIEW_IMAGE_PATH, canonicalUrl.trim()).toString();
    } catch (error) {
      return absoluteUrl(DEFAULT_SITE_URL, SOCIAL_PREVIEW_IMAGE_PATH);
    }
  }

  return absoluteUrl(DEFAULT_SITE_URL, SOCIAL_PREVIEW_IMAGE_PATH);
}

function renderHeadMetadata({
  siteTitle,
  pageTitle,
  description,
  canonicalUrl,
  ogTitle = pageTitle,
  ogDescription = description,
  ogType = "website",
  socialImageUrl,
  socialImageAlt = SOCIAL_PREVIEW_IMAGE_ALT,
  structuredData = null,
}) {
  const resolvedDescription =
    typeof description === "string" && description.trim() !== ""
      ? description.trim()
      : siteTitle;
  const resolvedCanonicalUrl =
    typeof canonicalUrl === "string" && canonicalUrl.trim() !== "" ? canonicalUrl.trim() : "";
  const resolvedSocialImageUrl = resolveSocialImageUrl({
    canonicalUrl: resolvedCanonicalUrl,
    socialImageUrl,
  });

  return `
    <meta name="description" content="${escapeHtml(resolvedDescription)}" />
    ${resolvedCanonicalUrl ? `<link rel="canonical" href="${escapeHtml(resolvedCanonicalUrl)}" />` : ""}
    <meta property="og:title" content="${escapeHtml(ogTitle)}" />
    <meta property="og:description" content="${escapeHtml(ogDescription)}" />
    <meta property="og:type" content="${escapeHtml(ogType)}" />
    ${resolvedCanonicalUrl ? `<meta property="og:url" content="${escapeHtml(resolvedCanonicalUrl)}" />` : ""}
    <meta property="og:site_name" content="${escapeHtml(siteTitle)}" />
    <meta property="og:image" content="${escapeHtml(resolvedSocialImageUrl)}" />
    <meta property="og:image:type" content="image/svg+xml" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(socialImageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(ogDescription)}" />
    <meta name="twitter:image" content="${escapeHtml(resolvedSocialImageUrl)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(socialImageAlt)}" />
${renderJsonLd(structuredData)}`;
}

function renderSiteFooter() {
  return `
      <footer class="site-footer" aria-label="Site footer">
        <div>
          <p class="section-kicker">/ Discovery</p>
          <p>Static notes, RSS, and source trails for rigorous computer science reading.</p>
        </div>
        <nav class="footer-links" aria-label="Footer navigation">
          <a href="/start-here/">Start</a>
          <a href="/research-taste/">Research taste</a>
          <a href="/#main-content">Notes</a>
          <a href="/blog/">Blog</a>
          <a href="/about/">Portfolio</a>
          <a href="/errata/">Errata</a>
          <a href="/subscribe/">Subscribe</a>
          <a href="/feed.xml" data-analytics-event="rss_click" data-subscribe-source="footer">RSS</a>
          <a href="/sitemap.xml">Sitemap</a>
        </nav>
      </footer>
  `;
}

function createBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function renderSubscribePanel({ source = "site", compact = false } = {}) {
  const className = compact ? "subscribe-panel subscribe-panel-compact" : "subscribe-panel";

  return `
    <section id="subscribe-${escapeHtml(source)}" class="${className}" aria-labelledby="subscribe-title-${escapeHtml(source)}">
      <div>
        <p class="section-kicker">/ Subscribe</p>
        <h2 id="subscribe-title-${escapeHtml(source)}">Get the monthly deep dive.</h2>
        <p>One rigorous theoretical CS deep dive every 3-4 weeks, with intuition, formal models, proof sketches, and implementation tradeoffs in one place.</p>
      </div>
      <div class="subscribe-actions" aria-label="Subscription actions">
        <a class="primary-action" href="/subscribe/" data-analytics-event="newsletter_cta_click" data-subscribe-source="${escapeHtml(source)}">Get the monthly deep dive</a>
        <a class="secondary-action" href="/feed.xml" data-analytics-event="rss_click" data-subscribe-source="${escapeHtml(source)}">Subscribe by RSS</a>
      </div>
    </section>
  `;
}

function renderLayout({
  pageTitle,
  siteTitle,
  contentHtml,
  bodyClass = "",
  description,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogType,
  socialImageUrl,
  socialImageAlt,
  structuredData,
}) {
  const classAttribute = bodyClass ? ` class="${escapeHtml(bodyClass)}"` : "";
  const bodyAttributes = `${classAttribute} data-analytics-event="page_view"`;
  const metadataHtml = renderHeadMetadata({
    siteTitle,
    pageTitle,
    description,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogType,
    socialImageUrl,
    socialImageAlt,
    structuredData,
  });

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(pageTitle)}</title>
${metadataHtml}
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ctext y='14' font-size='14'%3ECS%3C/text%3E%3C/svg%3E" />
    <link rel="alternate" type="application/rss+xml" title="${escapeHtml(siteTitle)} RSS" href="/feed.xml" />
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
  <body${bodyAttributes}>
    <a class="skip-link" href="#main-content">Skip to content</a>
    <main class="layout">
      <header class="site-header">
        <a class="brand-link" href="/" data-hotkey="H">${escapeHtml(siteTitle)}</a>
        <nav class="site-links" aria-label="Site navigation">
          <a href="/start-here/">Start</a>
          <a href="/about/" data-hotkey="P">Portfolio</a>
          <a href="/#main-content" data-hotkey="N">Notes</a>
          <a href="/blog/" data-hotkey="B">Blog</a>
          <a href="/feed.xml" data-hotkey="R" data-analytics-event="rss_click" data-subscribe-source="header">RSS</a>
        </nav>
      </header>
      ${contentHtml}
      ${renderSiteFooter()}
    </main>
    <script>
      (() => {
        window.notesAnalyticsEvents = window.notesAnalyticsEvents || [];

        function recordAnalyticsEvent(name, detail = {}) {
          const payload = {
            name,
            path: window.location.pathname,
            detail,
            recordedAt: new Date().toISOString(),
          };
          window.notesAnalyticsEvents.push(payload);
          window.dispatchEvent(new CustomEvent("notes-analytics", { detail: payload }));
        }

        document.body.dataset.analyticsEvent = "page_view";
        recordAnalyticsEvent("page_view");

        function isEditableTarget(target) {
          if (!target || !(target instanceof HTMLElement)) {
            return false;
          }

          return (
            target.isContentEditable ||
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT"
          );
        }

        document.addEventListener("keydown", (event) => {
          if (
            event.defaultPrevented ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.key.length !== 1 ||
            isEditableTarget(event.target)
          ) {
            return;
          }

          const hotkey = event.key.toUpperCase();
          if (hotkey === "S") {
            const searchInput = document.getElementById("topic-search");
            if (searchInput) {
              event.preventDefault();
              searchInput.focus();
              return;
            }
          }

          const target = Array.from(document.querySelectorAll("[data-hotkey]")).find(
            (element) => element.dataset.hotkey?.toUpperCase() === hotkey && element.href,
          );

          if (target) {
            event.preventDefault();
            target.click();
          }
        });

        document.addEventListener("click", (event) => {
          const target = event.target instanceof Element
            ? event.target.closest("[data-analytics-event]")
            : null;
          if (!target) {
            return;
          }

          recordAnalyticsEvent(target.dataset.analyticsEvent, {
            href: target.getAttribute("href") || "",
            subscribeSource: target.dataset.subscribeSource || "",
          });
        });
      })();
    </script>
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

function renderTopicLabels(labels) {
  if (!Array.isArray(labels) || labels.length === 0) {
    return "";
  }

  const labelHtml = labels
    .map((label) => {
      if (!label || typeof label !== "object") {
        return "";
      }

      const name = typeof label.name === "string" && label.name.trim() !== ""
        ? label.name.trim()
        : "";
      const color = typeof label.color === "string" && label.color.trim() !== ""
        ? label.color.trim().replace(/[^a-z_]/gu, "")
        : "default";

      return name
        ? `<span class="topic-label topic-label-${escapeHtml(color)}">${escapeHtml(name)}</span>`
        : "";
    })
    .filter(Boolean)
    .join("");

  return labelHtml ? `<div class="topic-labels" aria-label="Page labels">${labelHtml}</div>` : "";
}

function renderPillarLinks(links, linkClass) {
  if (!Array.isArray(links) || links.length === 0) {
    return "";
  }

  return links
    .map((link) => {
      const descriptionHtml = link.description
        ? `<p>${escapeHtml(link.description)}</p>`
        : "";

      return `<a class="${linkClass}" href="${escapeHtml(link.href)}">
  <span>${escapeHtml(link.title)}</span>
  ${descriptionHtml}
</a>`;
    })
    .join("");
}

function renderTopicPillar(pillar, topicTitle) {
  if (!pillar || typeof pillar !== "object") {
    return "";
  }

  const startHereHtml = renderPillarLinks(pillar.startHere, "topic-pillar-card");
  const readingPathHtml = Array.isArray(pillar.readingPath)
    ? pillar.readingPath
        .map((section) => {
          const linksHtml = renderPillarLinks(section.links, "topic-pillar-link");
          if (!linksHtml) {
            return "";
          }

          return `<div class="topic-pillar-path-section">
  <h3>${escapeHtml(section.label)}</h3>
  <div class="topic-pillar-links">${linksHtml}</div>
</div>`;
        })
        .filter(Boolean)
        .join("")
    : "";

  if (!startHereHtml && !readingPathHtml) {
    return "";
  }

  return `<section class="topic-pillar" aria-labelledby="topic-pillar-title">
  <div class="topic-pillar-header">
    <p class="section-kicker">/ Pillar</p>
    <h2 id="topic-pillar-title">Start here</h2>
  </div>
  ${startHereHtml ? `<div class="topic-pillar-start">${startHereHtml}</div>` : ""}
  ${readingPathHtml ? `<div class="topic-pillar-path" aria-labelledby="topic-pillar-path-title">
    <h2 id="topic-pillar-path-title">How to read ${escapeHtml(topicTitle)}</h2>
    ${readingPathHtml}
  </div>` : ""}
</section>`;
}

function renderNextReading(nextReading) {
  if (!nextReading || typeof nextReading !== "object") {
    return "";
  }

  const title = typeof nextReading.title === "string" && nextReading.title.trim() !== ""
    ? nextReading.title.trim()
    : "Next note";
  const urlPath = typeof nextReading.urlPath === "string" && nextReading.urlPath.startsWith("/")
    ? nextReading.urlPath
    : "";

  if (!urlPath) {
    return "";
  }

  const parentHtml =
    typeof nextReading.parentTitle === "string" && nextReading.parentTitle.trim() !== ""
      ? `<p>Continue inside ${escapeHtml(nextReading.parentTitle.trim())}</p>`
      : "<p>Continue through this topic path.</p>";

  return `<nav class="next-reading" aria-label="Next reading">
  <p class="section-kicker">/ Next</p>
  <a class="next-reading-link" href="${escapeHtml(urlPath)}">
    <span>Next reading</span>
    <strong>${escapeHtml(title)}</strong>
    ${parentHtml}
  </a>
</nav>`;
}

function renderTopicPage({ siteTitle, siteUrl = DEFAULT_SITE_URL, topic, topicContentHtml, topics }) {
  const descriptionHtml =
    topic.description && topic.description.trim() !== ""
      ? `<p class="topic-meta">${escapeHtml(topic.description)}</p>`
      : "";
  const parentHtml =
    topic.parentTitle && topic.parentTitle.trim() !== ""
      ? `<p class="topic-parent">Subpage of ${escapeHtml(topic.parentTitle)}</p>`
      : "";
  const urlPath = topic.urlPath || `/topics/${topic.slug}/`;
  const canonicalUrl = absoluteUrl(siteUrl, urlPath);
  const rootSlug = topic.slug.split("/")[0];
  const rootTopic = topics.find((candidate) => candidate.slug === rootSlug);
  const breadcrumbItems = [
    { name: "Home", url: absoluteUrl(siteUrl, "/") },
    {
      name: rootTopic ? rootTopic.title : topic.title,
      url: absoluteUrl(siteUrl, `/topics/${rootSlug}/`),
    },
  ];

  if (topic.slug !== rootSlug) {
    breadcrumbItems.push({ name: topic.title, url: canonicalUrl });
  }

  const content = `
    ${renderTopicNav({ topics, currentSlug: topic.slug })}
    <section id="main-content" class="panel notes-panel">
      <h1 class="site-title">${escapeHtml(topic.title)}</h1>
      ${parentHtml}
      ${renderTopicLabels(topic.labels)}
      ${descriptionHtml}
      ${renderTopicPillar(topic.pillar, topic.title)}
      ${renderSubscribePanel({
        source: topic.parentTitle ? "topic-subpage-top" : "topic-top",
        compact: true,
      })}
      ${topicContentHtml}
      ${renderNextReading(topic.nextReading)}
      ${renderSubscribePanel({ source: topic.parentTitle ? "topic-subpage" : "topic" })}
    </section>
  `;

  return renderLayout({
    pageTitle: `${topic.title} · ${siteTitle}`,
    siteTitle,
    contentHtml: content,
    description: topic.description || `${topic.title} notes from ${siteTitle}.`,
    canonicalUrl,
    ogTitle: `${topic.title} · ${siteTitle}`,
    ogDescription: topic.description || `${topic.title} notes from ${siteTitle}.`,
    structuredData: createBreadcrumbSchema(breadcrumbItems),
  });
}

function renderHomePage({ siteTitle, siteUrl = DEFAULT_SITE_URL, topics, searchEntries = [] }) {
  const topicCount = topics.length;
  const topicWord = topicCount === 1 ? "topic" : "topics";
  const searchEntryCount = searchEntries.length > 0 ? searchEntries.length : topics.length;
  const searchEntryWord = searchEntryCount === 1 ? "page" : "pages";
  const firstTopicLink =
    topics.length > 0
      ? `<a class="topic-index-link" href="/start-here/">Start here</a>`
      : "";
  const cards = topics
    .map(
      (topic, index) => `<a class="topic-card" href="/topics/${escapeHtml(topic.slug)}/" data-index="${String(index + 1).padStart(2, "0")}"${index < 9 ? ` data-hotkey="${index + 1}"` : ""}>
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
        <h1 id="home-title" class="home-title">Theoretical CS, from intuition to proof.</h1>
        <p class="home-intro">Rigorous notes on algorithms, computation, systems, and AI engineering, written for readers who want the idea, the formal model, and the proof sketch in one place.</p>
        <div class="home-actions" aria-label="Primary actions">
          <a class="primary-action" href="/subscribe/" data-analytics-event="newsletter_cta_click" data-subscribe-source="home-hero">Get the monthly deep dive</a>
          <a class="secondary-action" href="/start-here/">Start here</a>
          <a class="secondary-action" href="#main-content" data-hotkey="T">Browse topics</a>
          <a class="secondary-action" href="/about/" data-hotkey="P">Portfolio</a>
          <a class="secondary-action" href="#topic-search" data-hotkey="S">Search notes</a>
          <a class="secondary-action" href="/feed.xml" data-analytics-event="rss_click" data-subscribe-source="home-hero">Subscribe by RSS</a>
        </div>
      </div>
      <div class="stripe-field" aria-hidden="true">
        <span class="stripe-field-label">[ Fig. 01 ]</span>
        <span class="stripe-field-grid"></span>
        <span class="stripe-field-orbit"></span>
      </div>
    </section>
    <section class="home-proof" aria-label="Corpus proof">
      <div>
        <span>${topicCount}</span>
        <p>top-level ${escapeHtml(topicWord)} across algorithms, systems, AI engineering, and software practice</p>
      </div>
      <div>
        <span>${searchEntryCount}</span>
        <p>searchable note ${escapeHtml(searchEntryWord)} generated from the static corpus</p>
      </div>
      <div>
        <span>Fidelity</span>
        <p>LaTeX, code blocks, child pages, search, and static routing covered by deterministic checks</p>
      </div>
    </section>
    <section class="home-bio" aria-labelledby="home-bio-title">
      <p class="section-kicker">/ Author</p>
      <h2 id="home-bio-title">Praneeth Suresh</h2>
      <p>Praneeth Suresh writes rigorous computer science notes that connect intuition, formal models, and proof sketches. His work focuses on algorithms, systems, AI engineering, and the habits needed to reason clearly about complex technical ideas.</p>
      <div class="home-bio-actions" aria-label="Author links">
        <a href="/about/">Read the portfolio</a>
        <a href="/research-taste/">Research taste</a>
      </div>
    </section>
    <section class="home-featured" aria-labelledby="home-featured-title">
      <p class="section-kicker">/ Flagship essay</p>
      <a href="/blog/np-completeness-formal-definition-proof-sketches-and-reductions/">
        <span id="home-featured-title">NP-Completeness: Formal Definition, Proof Sketches, and Reductions</span>
        <p>A proof-backed guide to verification, reductions, Cook, Karp, and why hardness evidence changes algorithm design.</p>
      </a>
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
    ${renderSubscribePanel({ source: "home" })}
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
          <a class="topic-card" href="\${topic.urlPath}" data-index="\${String(index + 1).padStart(2, "0")}"\${index < 9 ? \` data-hotkey="\${index + 1}"\` : ""}>
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
    description: HOME_DESCRIPTION,
    canonicalUrl: absoluteUrl(siteUrl, "/"),
    ogTitle: `Theoretical CS, from intuition to proof. · ${siteTitle}`,
    ogDescription: HOME_DESCRIPTION,
  });
}

const DEFAULT_PORTFOLIO_DATA = {
  reviewedRepositoryCount: 29,
  portfolioProjects: [
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
  ],

  repositoryGroups: [
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
  ],
};

function findTopicBySlug(topics, slug) {
  return topics.find((topic) => topic.slug === slug) || null;
}

function findSearchEntry(searchEntries, slug) {
  return searchEntries.find((entry) => entry.slug === slug) || null;
}

function renderStartHerePage({ siteTitle, siteUrl = DEFAULT_SITE_URL, topics, searchEntries = [] }) {
  const algorithmsTopic = findTopicBySlug(topics, "algorithms") || topics[0] || null;
  const proofNote =
    findSearchEntry(searchEntries, "algorithms/dynamic-programming") ||
    searchEntries.find((entry) => entry.slug !== algorithmsTopic?.slug) ||
    null;
  const algorithmsHref = algorithmsTopic ? `/topics/${escapeHtml(algorithmsTopic.slug)}/` : "/#main-content";
  const proofHref = proofNote ? escapeHtml(proofNote.urlPath || `/topics/${proofNote.slug}/`) : algorithmsHref;
  const proofTitle = proofNote ? proofNote.title : algorithmsTopic?.title || "Algorithms";
  const topicRows = topics
    .slice(0, 6)
    .map(
      (topic) => `<a class="start-topic-link" href="/topics/${escapeHtml(topic.slug)}/">
  <span>${escapeHtml(topic.title)}</span>
  <p>${escapeHtml(topic.description || `${topic.title} notes.`)}</p>
</a>`,
    )
    .join("");

  const content = `
    <nav class="topic-nav" aria-label="Start here navigation">
      <a href="/" data-hotkey="H">Home</a>
      <a class="active" href="/start-here/" aria-current="page">Start here</a>
      <a href="/#main-content" data-hotkey="N">Notes</a>
      <a href="/blog/" data-hotkey="B">Blog</a>
    </nav>
    <section id="main-content" class="start-hero" aria-labelledby="start-title">
      <p class="home-kicker">[ Start here ]</p>
      <h1 id="start-title">A first path through the notes.</h1>
      <p>Use this route if you are new to the site and want the strongest proof-backed thread before browsing the full corpus.</p>
    </section>
    <section class="start-path" aria-label="First reading path">
      <a class="start-step" href="${algorithmsHref}">
        <span>01</span>
        <h2>Start with the Algorithms pillar</h2>
        <p>Get the site's clearest example of intuition, formal models, proof sketches, and implementation tradeoffs in one place.</p>
      </a>
      <a class="start-step" href="${proofHref}">
        <span>02</span>
        <h2>Read one proof-backed note</h2>
        <p>${escapeHtml(proofTitle)} is a concrete entry point into the style of reasoning the site rewards.</p>
      </a>
      <a class="start-step" href="/feed.xml" data-analytics-event="rss_click" data-subscribe-source="start-here">
        <span>03</span>
        <h2>Subscribe when the shape is useful</h2>
        <p>RSS is the stable owned-audience path until a newsletter provider is selected.</p>
      </a>
    </section>
    <section class="panel start-topics" aria-labelledby="start-topics-title">
      <div class="portfolio-section-header">
        <p class="section-kicker">/ Browse next</p>
        <h2 id="start-topics-title" class="section-title">Pick a durable thread</h2>
      </div>
      <div class="start-topic-grid">${topicRows}</div>
      <p class="start-research-link"><a href="/research-taste/">See the research taste list that guides future notes.</a></p>
    </section>
    ${renderSubscribePanel({ source: "start-here" })}
  `;

  return renderLayout({
    pageTitle: `Start Here · ${siteTitle}`,
    siteTitle,
    contentHtml: content,
    bodyClass: "start-page",
    description: START_HERE_DESCRIPTION,
    canonicalUrl: absoluteUrl(siteUrl, "/start-here/"),
    ogTitle: `Start Here · ${siteTitle}`,
    ogDescription: START_HERE_DESCRIPTION,
  });
}

function normalizeResearchTasteTopic(topic) {
  if (!topic || typeof topic !== "object") {
    return null;
  }

  const title = typeof topic.title === "string" ? topic.title.trim() : "";
  if (!title) {
    return null;
  }

  const rationale = typeof topic.rationale === "string" ? topic.rationale.trim() : "";
  const sources = Array.isArray(topic.sources)
    ? topic.sources
        .filter((source) => source && typeof source === "object")
        .map((source) => ({
          label: typeof source.label === "string" ? source.label.trim() : "",
          href: typeof source.href === "string" ? source.href.trim() : "",
        }))
        .filter((source) => source.label !== "" && /^https?:\/\//u.test(source.href))
    : [];

  return { title, rationale, sources };
}

function renderResearchTastePage({
  siteTitle,
  siteUrl = DEFAULT_SITE_URL,
  researchTasteData = { topics: [] },
}) {
  const topics = Array.isArray(researchTasteData?.topics)
    ? researchTasteData.topics.map(normalizeResearchTasteTopic).filter(Boolean)
    : [];
  const topicCards = topics
    .map((topic, index) => {
      const sourceLinks = topic.sources
        .map(
          (source) => `<li><a href="${escapeHtml(source.href)}">${escapeHtml(source.label)}</a></li>`,
        )
        .join("");

      return `<article class="research-topic" data-index="${String(index + 1).padStart(2, "0")}">
  <span class="research-topic-index">${String(index + 1).padStart(2, "0")}</span>
  <h2>${escapeHtml(topic.title)}</h2>
  ${topic.rationale ? `<p>${escapeHtml(topic.rationale)}</p>` : ""}
  ${sourceLinks ? `<ul class="research-sources">${sourceLinks}</ul>` : ""}
</article>`;
    })
    .join("");

  const content = `
    <nav class="topic-nav" aria-label="Research taste navigation">
      <a href="/" data-hotkey="H">Home</a>
      <a href="/start-here/">Start here</a>
      <a class="active" href="/research-taste/" aria-current="page">Research taste</a>
      <a href="/#main-content" data-hotkey="N">Notes</a>
      <a href="/blog/" data-hotkey="B">Blog</a>
    </nav>
    <section id="main-content" class="research-hero" aria-labelledby="research-title">
      <p class="home-kicker">[ Research taste ]</p>
      <h1 id="research-title">Research taste</h1>
      <p>This is the public source trail behind future theoretical CS notes: problems, methods, and papers that shape what gets studied next.</p>
    </section>
    <section class="research-grid" aria-label="Research topics">
      ${topicCards}
    </section>
    ${renderSubscribePanel({ source: "research-taste" })}
  `;

  return renderLayout({
    pageTitle: `Research Taste · ${siteTitle}`,
    siteTitle,
    contentHtml: content,
    bodyClass: "research-page",
    description: RESEARCH_TASTE_DESCRIPTION,
    canonicalUrl: absoluteUrl(siteUrl, "/research-taste/"),
    ogTitle: `Research Taste · ${siteTitle}`,
    ogDescription: RESEARCH_TASTE_DESCRIPTION,
  });
}

function renderErrataPage({ siteTitle, siteUrl = DEFAULT_SITE_URL }) {
  const content = `
    <nav class="topic-nav" aria-label="Errata navigation">
      <a href="/" data-hotkey="H">Home</a>
      <a href="/blog/" data-hotkey="B">Blog</a>
      <a href="/research-taste/">Research taste</a>
      <a class="active" href="/errata/" aria-current="page">Errata</a>
    </nav>
    <section id="main-content" class="errata-hero" aria-labelledby="errata-title">
      <p class="home-kicker">[ Corrections ]</p>
      <h1 id="errata-title">Errata</h1>
      <p>Public corrections and clarifications for Computer Science Notes. The goal is to make mistakes visible, bounded, and easy to trace back to the affected page.</p>
    </section>
    <section class="panel errata-panel" aria-labelledby="errata-current">
      <div class="portfolio-section-header">
        <p class="section-kicker">/ Current log</p>
        <h2 id="errata-current" class="section-title">No published corrections yet.</h2>
      </div>
      <div class="errata-copy">
        <p>When a substantive error is found, this page will record the affected page, the original claim, the correction, and the date the correction was made.</p>
        <p>Clarifications that change interpretation without changing the result will be listed separately from factual or mathematical corrections.</p>
      </div>
    </section>
    <section class="errata-policy" aria-labelledby="errata-policy-title">
      <h2 id="errata-policy-title">Correction policy</h2>
      <ul>
        <li>Mathematical and algorithmic errors get a correction note on this page and a note near the affected article when appropriate.</li>
        <li>Minor grammar or wording edits may be fixed silently when they do not change the technical claim.</li>
        <li>Source updates keep the original citation visible when the correction depends on it.</li>
      </ul>
      <p>Start with the current flagship essay: <a href="/blog/np-completeness-formal-definition-proof-sketches-and-reductions/">NP-Completeness: Formal Definition, Proof Sketches, and Reductions</a>.</p>
    </section>
  `;

  return renderLayout({
    pageTitle: `Errata · ${siteTitle}`,
    siteTitle,
    contentHtml: content,
    bodyClass: "errata-page",
    description: ERRATA_DESCRIPTION,
    canonicalUrl: absoluteUrl(siteUrl, "/errata/"),
    ogTitle: `Errata · ${siteTitle}`,
    ogDescription: ERRATA_DESCRIPTION,
  });
}

function renderSubscribePage({ siteTitle, siteUrl = DEFAULT_SITE_URL }) {
  const content = `
    <nav class="topic-nav" aria-label="Subscribe navigation">
      <a href="/" data-hotkey="H">Home</a>
      <a href="/start-here/">Start here</a>
      <a href="/blog/" data-hotkey="B">Blog</a>
      <a class="active" href="/subscribe/" aria-current="page">Subscribe</a>
    </nav>
    <section id="main-content" class="subscribe-page-hero" aria-labelledby="subscribe-page-title">
      <p class="home-kicker">[ Subscribe ]</p>
      <h1 id="subscribe-page-title">Subscribe</h1>
      <p>One rigorous theoretical CS deep dive every 3-4 weeks.</p>
    </section>
    <section class="subscribe-route" aria-labelledby="subscribe-route-title">
      <div>
        <p class="section-kicker">/ Owned channel</p>
        <h2 id="subscribe-route-title">RSS is live now.</h2>
        <p>Email newsletter provider pending. Until that provider is selected, RSS is the stable subscription path for new notes, flagship essays, and future deep dives.</p>
      </div>
      <div class="subscribe-route-actions" aria-label="Subscribe page actions">
        <a class="primary-action" href="/feed.xml" data-analytics-event="rss_click" data-subscribe-source="subscribe-page">Subscribe by RSS</a>
        <a class="secondary-action" href="/start-here/">Start here</a>
        <a class="secondary-action" href="/blog/np-completeness-formal-definition-proof-sketches-and-reductions/">Read the flagship essay</a>
      </div>
    </section>
    <section class="subscribe-route-details" aria-labelledby="subscribe-route-details-title">
      <h2 id="subscribe-route-details-title">What you get</h2>
      <ul>
        <li>Proof-backed theoretical CS essays with formal statements, intuition, proof sketches, and source trails.</li>
        <li>Major topic updates across algorithms, systems, AI engineering, and software engineering.</li>
        <li>A low-noise cadence built around one substantial deep dive every 3-4 weeks.</li>
      </ul>
    </section>
  `;

  return renderLayout({
    pageTitle: `Subscribe · ${siteTitle}`,
    siteTitle,
    contentHtml: content,
    bodyClass: "subscribe-page",
    description: SUBSCRIBE_DESCRIPTION,
    canonicalUrl: absoluteUrl(siteUrl, "/subscribe/"),
    ogTitle: `Subscribe · ${siteTitle}`,
    ogDescription: SUBSCRIBE_DESCRIPTION,
  });
}

function normalizeRepositoryLink(repo) {
  if (typeof repo === "string") {
    return {
      name: repo,
      href: `https://github.com/Praneeth-Suresh/${repo}`,
    };
  }

  if (!repo || typeof repo !== "object") {
    return null;
  }

  const name = typeof repo.name === "string" && repo.name.trim() !== "" ? repo.name.trim() : null;
  if (!name) {
    return null;
  }

  return {
    name,
    href:
      typeof repo.href === "string" && repo.href.trim() !== ""
        ? repo.href.trim()
        : `https://github.com/Praneeth-Suresh/${name}`,
  };
}

function renderPersonalPage({ siteTitle, siteUrl = DEFAULT_SITE_URL, portfolioData = DEFAULT_PORTFOLIO_DATA }) {
  const resolvedPortfolioData = portfolioData && typeof portfolioData === "object"
    ? portfolioData
    : DEFAULT_PORTFOLIO_DATA;
  const portfolioProjects = Array.isArray(resolvedPortfolioData.portfolioProjects)
    ? resolvedPortfolioData.portfolioProjects
    : DEFAULT_PORTFOLIO_DATA.portfolioProjects;
  const repositoryGroups = Array.isArray(resolvedPortfolioData.repositoryGroups)
    ? resolvedPortfolioData.repositoryGroups
    : DEFAULT_PORTFOLIO_DATA.repositoryGroups;
  const reviewedRepositoryCount = Number.isInteger(resolvedPortfolioData.reviewedRepositoryCount)
    ? resolvedPortfolioData.reviewedRepositoryCount
    : DEFAULT_PORTFOLIO_DATA.reviewedRepositoryCount;

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
      .map((repo) => normalizeRepositoryLink(repo))
      .filter(Boolean)
      .map((repo) => `<li><a href="${escapeHtml(repo.href)}">${escapeHtml(repo.name)}</a></li>`)
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
        <p class="portfolio-positioning">I publish rigorous, proof-backed explanations of theoretical CS topics with research-level depth and clear intuition.</p>
        <p class="portfolio-intro">Software engineer and AI developer/researcher building practical systems around machine learning, agentic workflows, static knowledge tools, and data-heavy product ideas.</p>
        <div class="portfolio-actions" aria-label="Profile links">
          <a class="primary-action" href="https://github.com/Praneeth-Suresh" data-hotkey="G" data-analytics-event="outbound_github_click">GitHub</a>
          <a class="secondary-action" href="https://www.linkedin.com/in/praneeth-suresh-a114aa250/" data-hotkey="L" data-analytics-event="outbound_linkedin_click">LinkedIn</a>
          <a class="secondary-action" href="/research-taste/">Research taste</a>
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
        <span>${escapeHtml(reviewedRepositoryCount)}</span>
        <p>public GitHub repositories</p>
      </div>
      <div>
        <span>AI + SWE</span>
        <p>research notebooks, apps, agents, and static systems</p>
      </div>
      <div>
        <span>R&D</span>
        <p>specialise in improving today's computer systems</p>
      </div>
    </section>
    <section class="panel portfolio-section" aria-labelledby="portfolio-philosophy">
      <div class="portfolio-section-header">
        <p class="section-kicker">/ Philosophy</p>
        <h2 id="portfolio-philosophy" class="section-title">Every line of code is a conversation with the future.</h2>
      </div>
      <div class="portfolio-philosophy-grid">
        <p>Praneeth Suresh is a software engineer and AI builder focused on turning exploratory ideas into working systems. His work moves across machine learning, agentic workflows, forecasting, developer tooling, and static knowledge systems, with a consistent bias toward making complex technical material usable.</p>
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
    <section class="portfolio-quote" aria-label="Portfolio quote">
      <p>Curiosity is only useful when it becomes a system someone else can understand, run, and build on.</p>
    </section>
  `;

  return renderLayout({
    pageTitle: `Praneeth Suresh · ${siteTitle}`,
    siteTitle,
    contentHtml: content,
    bodyClass: "portfolio-page",
    description: "Praneeth Suresh's software engineering, AI, and static knowledge-system portfolio.",
    canonicalUrl: absoluteUrl(siteUrl, "/about/"),
    ogTitle: `Praneeth Suresh · ${siteTitle}`,
    ogDescription: "Software engineering, AI, and static knowledge-system portfolio.",
  });
}

function renderBlogIndexPage({ siteTitle, siteUrl = DEFAULT_SITE_URL, blogManifest, homeContentHtml }) {
  const toc = blogManifest.sections.map((section) => {
    const posts = section.posts.map((post) => {
      const chapterHtml = post.chapter != null
        ? `<span class="blog-post-chapter">${String(post.chapter).padStart(2, "0")}</span>`
        : `<span class="blog-post-chapter">&bull;</span>`;
      return `<li><a class="blog-post-link" href="/blog/${escapeHtml(post.slug)}/">${chapterHtml}<span class="blog-post-title">${escapeHtml(post.title)}</span></a></li>`;
    }).join("");
    return `<div class="blog-section-group"><h3 class="blog-section-heading">${escapeHtml(section.title)}</h3><p class="blog-section-subtitle">${escapeHtml(section.subtitle)}</p><ul class="blog-post-list">${posts}</ul></div>`;
  }).join("");

  const content = `
    <section class="blog-hero">
      <p class="blog-kicker">[ Blog ]</p>
      <h1 class="blog-title">A Developer&rsquo;s Story</h1>
      <p class="blog-subtitle">The thought processes behind the projects.</p>
    </section>
    <div class="blog-home-content" id="main-content">${homeContentHtml}</div>
    <nav class="blog-toc" aria-label="Blog table of contents">${toc}</nav>
    ${renderSubscribePanel({ source: "blog-index" })}
  `;

  return renderLayout({
    pageTitle: `Blog · ${siteTitle}`,
    siteTitle,
    contentHtml: content,
    bodyClass: "blog-page",
    description: BLOG_INDEX_DESCRIPTION,
    canonicalUrl: absoluteUrl(siteUrl, "/blog/"),
    ogTitle: `Blog · ${siteTitle}`,
    ogDescription: BLOG_INDEX_DESCRIPTION,
  });
}

function renderBlogPostPage({ siteTitle, siteUrl = DEFAULT_SITE_URL, post, section, blogContentHtml, blogManifest }) {
  // Find prev/next within same section
  const sectionData = blogManifest.sections.find((s) => s.title === section);
  let prevPost = null;
  let nextPost = null;
  if (sectionData) {
    const idx = sectionData.posts.findIndex((p) => p.slug === post.slug);
    if (idx > 0) prevPost = sectionData.posts[idx - 1];
    if (idx >= 0 && idx < sectionData.posts.length - 1) nextPost = sectionData.posts[idx + 1];
  }

  const navHtml = (prevPost || nextPost) ? `<nav class="blog-post-nav">${prevPost ? `<a href="/blog/${escapeHtml(prevPost.slug)}/">&larr; ${escapeHtml(prevPost.title)}</a>` : "<span></span>"}${nextPost ? `<a href="/blog/${escapeHtml(nextPost.slug)}/">${escapeHtml(nextPost.title)} &rarr;</a>` : "<span></span>"}</nav>` : "";
  const description =
    typeof post.description === "string" && post.description.trim() !== ""
      ? post.description.trim()
      : `${post.title} from ${section} on ${siteTitle}.`;
  const socialPreview =
    typeof post.socialPreview === "string" && post.socialPreview.trim() !== ""
      ? post.socialPreview.trim()
      : description;
  const canonicalUrl = absoluteUrl(siteUrl, `/blog/${post.slug}/`);
  const socialImageUrl = absoluteUrl(siteUrl, SOCIAL_PREVIEW_IMAGE_PATH);
  const faqItems = Array.isArray(post.faq)
    ? post.faq
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          question: typeof item.question === "string" ? item.question.trim() : "",
          answer: typeof item.answer === "string" ? item.answer.trim() : "",
        }))
        .filter((item) => item.question !== "" && item.answer !== "")
    : [];
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description,
    image: socialImageUrl,
    author: {
      "@type": "Person",
      name: "Praneeth Suresh",
    },
    publisher: {
      "@type": "Organization",
      name: siteTitle,
    },
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
  };
  const faqSchema = faqItems.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : null;

  const content = `
    <div class="blog-reading-panel" id="main-content">
      <a class="blog-back" href="/blog/">&larr; All posts</a>
      <header class="blog-post-header">
        <p class="blog-post-section">${escapeHtml(section)}</p>
        <h1>${escapeHtml(post.title)}</h1>
      </header>
      ${blogContentHtml}
      ${renderSubscribePanel({ source: "blog-post" })}
      ${navHtml}
    </div>
  `;

  return renderLayout({
    pageTitle: `${post.title} · Blog · ${siteTitle}`,
    siteTitle,
    contentHtml: content,
    bodyClass: "blog-page",
    description,
    canonicalUrl,
    ogTitle: `${post.title} · Blog · ${siteTitle}`,
    ogDescription: socialPreview,
    ogType: "article",
    socialImageUrl,
    structuredData: faqSchema ? [articleSchema, faqSchema] : articleSchema,
  });
}

module.exports = {
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
