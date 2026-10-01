"use strict";

const { buildSearchSnippet, rankSearchEntries } = require("./notes-search");

const DEFAULT_SITE_URL = "https://notes.praneeth-suresh-s.workers.dev";
const HOME_DESCRIPTION = "Praneeth Suresh builds checks for AI-assisted software development and publishes his computer science study notes: algorithms, systems, C and C++, AI engineering, and agents.";
const NOTES_DESCRIPTION = "Searchable computer science notes by topic, with a visible status on every note: algorithms, operating systems, C and C++, AI engineering, software systems, and agents.";
const BLOG_INDEX_DESCRIPTION = "Essays and project write-ups by Praneeth Suresh: AI research reading, engineering decisions, and project retrospectives.";
const ERRATA_DESCRIPTION = "Public corrections and clarifications for Praneeth Suresh, linked to the affected notes.";
const PROJECTS_DESCRIPTION = "Projects by Praneeth Suresh with his role, one real output, and stated limits: Beryl, this notes site, the SIAP manuscript, and the NUS AI Society corpus.";
const NOT_FOUND_DESCRIPTION = "The requested page was not found. Continue to the notes, writing, projects, or contact pages.";
const SOCIAL_PREVIEW_IMAGE_PATH = "/assets/social/theoretical-cs-preview.svg";
const SOCIAL_PREVIEW_IMAGE_ALT = "Praneeth Suresh.";
const FLAGSHIP_ESSAY_PATH = "/blog/tracing-the-mental-models-of-deep-learning-lessons-from-foundational-papers/";
const FLAGSHIP_ESSAY_TITLE = "The mental models of deep learning";
const PUBLIC_CONTACT_TEXT = "praneeth[dot]suresh[dot]s [at] gmail[dot]com";
const PUBLIC_GITHUB_URL = "https://github.com/Praneeth-Suresh";
const PUBLIC_LINKEDIN_URL = "https://www.linkedin.com/in/praneeth-suresh-a114aa250/";

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
  description,
  canonicalUrl,
  ogTitle,
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

// ---------------------------------------------------------------------------
// Structured data
// ---------------------------------------------------------------------------

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

function siteUrlFromCanonical(canonicalUrl) {
  if (typeof canonicalUrl !== "string" || canonicalUrl.trim() === "") {
    return DEFAULT_SITE_URL;
  }

  try {
    return new URL(canonicalUrl).origin;
  } catch (error) {
    return DEFAULT_SITE_URL;
  }
}

function normalizeStructuredDataItems(value) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function createSiteIdentitySchemas({ siteTitle, canonicalUrl }) {
  const siteUrl = siteUrlFromCanonical(canonicalUrl);
  const personId = `${siteUrl}/#person`;
  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": personId,
      name: "Praneeth Suresh",
      url: `${siteUrl}/about/`,
      sameAs: [PUBLIC_GITHUB_URL, PUBLIC_LINKEDIN_URL],
      jobTitle: "ML engineer and computer science student",
      knowsAbout: [
        "AI research",
        "Algorithms",
        "Computer science",
        "Software engineering",
        "Agent reliability",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": organizationId,
      name: siteTitle,
      url: `${siteUrl}/`,
      logo: absoluteUrl(siteUrl, SOCIAL_PREVIEW_IMAGE_PATH),
      founder: { "@id": personId },
      sameAs: [PUBLIC_GITHUB_URL, PUBLIC_LINKEDIN_URL],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": websiteId,
      name: siteTitle,
      url: `${siteUrl}/`,
      inLanguage: "en",
      publisher: { "@id": organizationId },
      author: { "@id": personId },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/notes/?q={search_term_string}#search`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

function createPageSchema({
  siteTitle,
  pageTitle,
  description,
  canonicalUrl,
  pageSchemaType = "WebPage",
  dateModified = null,
}) {
  if (typeof canonicalUrl !== "string" || canonicalUrl.trim() === "") {
    return null;
  }

  const siteUrl = siteUrlFromCanonical(canonicalUrl);
  const resolvedDescription =
    typeof description === "string" && description.trim() !== ""
      ? description.trim()
      : siteTitle;

  return {
    "@context": "https://schema.org",
    "@type": pageSchemaType,
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: pageTitle,
    description: resolvedDescription,
    inLanguage: "en",
    isPartOf: { "@id": `${siteUrl}/#website` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl(siteUrl, SOCIAL_PREVIEW_IMAGE_PATH),
    },
    ...(dateModified ? { dateModified } : {}),
  };
}

function composeStructuredData({
  siteTitle,
  pageTitle,
  description,
  canonicalUrl,
  pageSchemaType,
  structuredData,
  dateModified,
}) {
  if (typeof canonicalUrl !== "string" || canonicalUrl.trim() === "") {
    return structuredData;
  }

  return [
    ...createSiteIdentitySchemas({ siteTitle, canonicalUrl }),
    createPageSchema({
      siteTitle,
      pageTitle,
      description,
      canonicalUrl,
      pageSchemaType,
      dateModified,
    }),
    ...normalizeStructuredDataItems(structuredData),
  ];
}

// ---------------------------------------------------------------------------
// Shared page shell
// ---------------------------------------------------------------------------

const PRIMARY_NAV = [
  { href: "/notes/", label: "Notes", hotkey: "N", section: "notes" },
  { href: "/projects/", label: "Projects", hotkey: "P", section: "projects" },
  { href: "/blog/", label: "Writing", hotkey: "W", section: "writing" },
  { href: "/about/", label: "About", hotkey: "A", section: "about" },
];

function renderSiteHeader({ activeSection }) {
  const links = PRIMARY_NAV.map((item) => {
    const current = item.section === activeSection ? ' aria-current="page"' : "";
    return `<a href="${item.href}"${current}>${escapeHtml(item.label)}</a>`;
  }).join("");

  return `<header class="site-header">
      <div class="site-header-primary">
        <a class="brand-link" href="/" aria-label="Praneeth Suresh home">Praneeth Suresh</a>
        <nav class="site-links site-links-desktop" aria-label="Primary navigation">${links}</nav>
        <a class="site-search-link" href="/notes/#search" aria-label="Search (Control K or Command K)"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><span>Search</span><kbd aria-hidden="true">⌘K</kbd></a>
        <details class="mobile-menu">
          <summary>Menu</summary>
          <nav aria-label="Mobile navigation">${links}</nav>
        </details>
      </div>
    </header>`;
}

function renderSiteFooter() {
  return `
      <footer class="site-footer" aria-label="Site footer">
        <span>Praneeth Suresh</span>
        <nav class="footer-links" aria-label="Footer navigation">
          <a href="/about/#contact">Email</a>
          <a href="${PUBLIC_GITHUB_URL}" data-analytics-event="outbound_github_click">GitHub</a>
          <a href="${PUBLIC_LINKEDIN_URL}" data-analytics-event="outbound_linkedin_click">LinkedIn</a>
          <a href="/cv.pdf" data-analytics-event="cv_download_click">CV</a>
          <a href="/feed.xml" data-analytics-event="rss_click" data-subscribe-source="footer">RSS</a>
          <a href="/errata/">Errata</a>
        </nav>
      </footer>
  `;
}

const CLIENT_SCRIPT = `
    <script>
      (() => {
        window.notesAnalyticsEvents = window.notesAnalyticsEvents || [];
        const recordAnalyticsEvent = (name, detail = {}) => {
          const payload = { name, path: location.pathname, detail, recordedAt: new Date().toISOString() };
          window.notesAnalyticsEvents.push(payload);
          window.dispatchEvent(new CustomEvent("notes-analytics", { detail: payload }));
        };
        recordAnalyticsEvent("page_view");

        const isEditable = (target) => target instanceof HTMLElement &&
          (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
        document.addEventListener("keydown", (event) => {
          if (event.defaultPrevented || event.isComposing || event.altKey || event.shiftKey || isEditable(event.target)) return;
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            const input = document.getElementById("topic-search");
            if (input) input.focus();
            else location.href = "/notes/#search";
          }
        });

        document.addEventListener("click", (event) => {
          const target = event.target instanceof Element ? event.target.closest("[data-analytics-event]") : null;
          if (target) recordAnalyticsEvent(target.dataset.analyticsEvent, {
            href: target.getAttribute("href") || "",
            subscribeSource: target.dataset.subscribeSource || "",
          });
        });

        const revealHashTarget = () => {
          if (!location.hash) return;
          const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
          if (!target) return;
          let parent = target.parentElement;
          while (parent) {
            if (parent.tagName === "DETAILS") parent.open = true;
            parent = parent.parentElement;
          }
          if (target.tagName === "DETAILS") target.open = true;
        };
        revealHashTarget();
        addEventListener("hashchange", revealHashTarget);

        const homeSections = Array.from(document.querySelectorAll("details[data-home-section]"));
        let syncingHome = false;
        const syncHomeHash = () => {
          if (!homeSections.length) return;
          const id = location.hash.slice(1);
          syncingHome = true;
          for (const section of homeSections) section.open = section.id === id;
          syncingHome = false;
        };
        syncHomeHash();
        addEventListener("popstate", syncHomeHash);
        addEventListener("hashchange", syncHomeHash);
        for (const section of homeSections) {
          section.addEventListener("toggle", () => {
            if (syncingHome) return;
            if (section.open) {
              syncingHome = true;
              for (const other of homeSections) if (other !== section) other.open = false;
              syncingHome = false;
              if (location.hash !== "#" + section.id) history.pushState(history.state, "", "#" + section.id);
            } else if (location.hash === "#" + section.id) {
              history.replaceState(history.state, "", location.pathname + location.search);
            }
          });
        }

        const updateOverflow = (region) => {
          const max = region.scrollWidth - region.clientWidth;
          region.classList.toggle("is-overflowing", max > 1);
          region.classList.toggle("is-at-end", max <= 1 || region.scrollLeft >= max - 1);
        };
        const overflowRegions = Array.from(document.querySelectorAll(".note-scroll, pre[tabindex], .notion-equation, mjx-container[display='true']"));
        for (const region of overflowRegions) {
          updateOverflow(region);
          region.addEventListener("scroll", () => updateOverflow(region), { passive: true });
        }
        addEventListener("resize", () => overflowRegions.forEach(updateOverflow), { passive: true });

        for (const button of document.querySelectorAll("[data-copy-code]")) {
          button.addEventListener("click", async () => {
            const code = button.closest(".code-block")?.querySelector("code");
            const status = button.closest(".code-block")?.querySelector("[data-copy-status]");
            if (!code || !status) return;
            try {
              await navigator.clipboard.writeText(code.textContent);
              status.textContent = "Code copied.";
            } catch (error) {
              status.textContent = "Copy failed. Select the code to copy it manually.";
            }
          });
        }
      })();
    </script>`;

function renderLayout({
  pageTitle,
  siteTitle,
  contentHtml,
  bodyClass = "",
  activeSection = "",
  description,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogType,
  socialImageUrl,
  socialImageAlt,
  structuredData,
  pageSchemaType,
  dateModified,
  includeMath = false,
  extraScripts = "",
}) {
  const classAttribute = bodyClass ? ` class="${escapeHtml(bodyClass)}"` : "";
  const bodyAttributes = `${classAttribute} data-analytics-event="page_view"`;
  const composedStructuredData = composeStructuredData({
    siteTitle,
    pageTitle,
    description,
    canonicalUrl,
    pageSchemaType,
    structuredData,
    dateModified,
  });
  const metadataHtml = renderHeadMetadata({
    siteTitle,
    pageTitle,
    description,
    canonicalUrl,
    ogTitle: ogTitle || pageTitle,
    ogDescription,
    ogType,
    socialImageUrl,
    socialImageAlt: socialImageAlt || `${pageTitle} preview from ${siteTitle}.`,
    structuredData: composedStructuredData,
  });
  // MathJax is ~2 MB, so it is only loaded on pages that can contain LaTeX.
  const mathHtml = includeMath
    ? `
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
    <script defer src="/assets/vendor/mathjax/tex-svg-full.js"></script>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(pageTitle === siteTitle ? "Praneeth Suresh" : `${pageTitle.replace(new RegExp(`(?: · (?:Projects|Writing))? · ${siteTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`), "")} — Praneeth Suresh`)}</title>
${metadataHtml}
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ctext y='14' font-size='14'%3ECS%3C/text%3E%3C/svg%3E" />
    <link rel="alternate" type="application/rss+xml" title="${escapeHtml(siteTitle)} RSS" href="/feed.xml" />
    <link rel="preload" href="/assets/fonts/inter-variable.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="/assets/site.css" />${mathHtml}
  </head>
  <body${bodyAttributes}>
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="layout">
      ${renderSiteHeader({ activeSection })}
      <main id="main-content" tabindex="-1">
      ${contentHtml}
      </main>
      ${renderSiteFooter()}
    </div>${CLIENT_SCRIPT}${extraScripts}
  </body>
</html>`;
}

function renderPageHeader({ title, intro = "", id = "page-title" }) {
  return `<header class="page-header">
      <h1 id="${escapeHtml(id)}">${escapeHtml(title)}</h1>
      ${intro ? `<p class="page-intro">${intro}</p>` : ""}
    </header>`;
}

// ---------------------------------------------------------------------------
// Publication status
// ---------------------------------------------------------------------------

const PUBLICATION_STATUS_SLUGS = new Set(["working", "reviewed", "archived"]);
const STATUS_SLUG_BY_LABEL = Object.freeze({
  "Working note": "working",
  "Reviewed note": "reviewed",
  Archived: "archived",
});

function publicationStatusSlug(publication) {
  return PUBLICATION_STATUS_SLUGS.has(publication?.statusSlug) ? publication.statusSlug : "working";
}

// Compact inline label used in listings, reading paths, and search results.
function renderStatusBadge(publication) {
  if (!publication || typeof publication.status !== "string") return "";
  const slug = publicationStatusSlug(publication);
  const visibleStatus = slug === "working" ? "" : `<span class="note-status note-status-${slug}">${escapeHtml(publication.status)}</span>`;
  const type = publication.contentType ? `<span class="note-type">${escapeHtml(publication.contentType)}</span>` : "";
  return `<span class="note-publication" aria-label="${escapeHtml(publication.status)}${publication.contentType ? `, ${publication.contentType}` : ""}">${visibleStatus}${type}</span>`;
}

function renderNotePublication(publication, corrections = [], updatedAt = "") {
  if (!publication || typeof publication.status !== "string") return "";
  const slug = publicationStatusSlug(publication);
  const facts = [
    `<div><dt>Status</dt><dd><a href="/notes/#publication-status" class="note-status note-status-${slug}">${escapeHtml(publication.status)}</a></dd></div>`,
  ];
  if (publication.contentType) facts.push(`<div><dt>Type</dt><dd>${escapeHtml(publication.contentType)}</dd></div>`);
  if (publication.reviewedAt) facts.push(`<div><dt>Reviewed</dt><dd><time datetime="${escapeHtml(publication.reviewedAt)}">${escapeHtml(publication.reviewedAt)}</time></dd></div>`);
  if (updatedAt) facts.push(`<div><dt>Updated</dt><dd><time datetime="${escapeHtml(updatedAt)}">${escapeHtml(updatedAt)}</time></dd></div>`);
  const latestCorrection = corrections.map((entry) => entry.date).sort().at(-1);
  if (latestCorrection) {
    const correction = corrections.find((entry) => entry.date === latestCorrection);
    facts.push(`<div><dt>Corrected</dt><dd><a href="/errata/#${escapeHtml(correction.id)}"><time datetime="${escapeHtml(latestCorrection)}">${escapeHtml(latestCorrection)}</time></a></dd></div>`);
  }
  const gaps = Array.isArray(publication.knownGaps) && publication.knownGaps.length
    ? `<details class="note-known-gaps"><summary>Known gaps (${publication.knownGaps.length})</summary><ul>${publication.knownGaps.map((gap) => `<li>${escapeHtml(gap)}</li>`).join("")}</ul></details>`
    : "";
  const archive = publication.archiveReason ? `<p class="note-archive-reason"><strong>Archived:</strong> ${escapeHtml(publication.archiveReason)}</p>` : "";
  const correctionList = corrections.length ? `<ul class="note-corrections">${corrections.map((entry) => `<li><a href="/errata/#${escapeHtml(entry.id)}">${escapeHtml(entry.kind)} · ${escapeHtml(entry.date)}</a></li>`).join("")}</ul>` : "";
  return `<section class="note-provenance note-provenance-${slug}" aria-label="Publication status"><dl class="note-provenance-facts">${facts.join("")}</dl>${archive}${gaps}${correctionList}</section>`;
}

function renderRelatedNotes(related) {
  if (!Array.isArray(related) || related.length === 0) {
    return "";
  }
  return `<nav class="note-related" aria-labelledby="note-related-title">
  <h2 id="note-related-title">Read with this</h2>
  <p class="status-legend">Unmarked notes are working notes: public, not yet reviewed.</p>
  <ul>${related
    .map((link) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.title)}</a>${renderStatusBadge(link.publication)}<p>${escapeHtml(link.reason)}</p></li>`)
    .join("")}</ul>
</nav>`;
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

// ---------------------------------------------------------------------------
// Note pages
// ---------------------------------------------------------------------------

function renderBreadcrumb(items) {
  const link = (item) => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.name)}</a>`;
  const last = items.length - 1;
  // Intermediate ancestors (everything between the first item and the immediate parent)
  // collapse into a labelled disclosure on narrow screens; wide screens show the full path.
  const middle = items.slice(1, Math.max(1, last - 1));
  const parts = items.map((item, index) => {
    if (index === last) return `<li aria-current="page">${escapeHtml(item.name)}</li>`;
    const isMiddle = middle.length > 0 && index >= 1 && index < last - 1;
    const collapse = isMiddle && index === 1
      ? `<li class="crumb-collapse"><details><summary aria-label="Show ${middle.length} more ${middle.length === 1 ? "level" : "levels"}">…</summary><ol>${middle.map((m) => `<li>${link(m)}</li>`).join("")}</ol></details></li>`
      : "";
    return `${collapse}<li${isMiddle ? ' class="crumb-middle"' : ""}>${link(item)}</li>`;
  }).join("");
  return `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${parts}</ol></nav>`;
}

function renderTopicPillar(pillar, topicTitle, notes = []) {
  if (!pillar || typeof pillar !== "object") return "";
  const sections = Array.isArray(pillar.readingPath) ? pillar.readingPath : [];
  const startDescriptions = new Map((Array.isArray(pillar.startHere) ? pillar.startHere : []).map((link) => [link.href, link.description || ""]));
  const linked = new Set(sections.flatMap((section) => (section.links || []).map((link) => link.href)));
  const otherPages = (notes || []).filter((note) => !linked.has(note.urlPath));
  const total = sections.reduce((sum, section) => sum + (section.links || []).length, 0) + otherPages.length;
  if (!total) return "";
  const startOpen = total <= 6 ? " open" : "";
  let step = 0;
  const groups = sections.map((section) => {
    const links = (section.links || []).map((link) => {
      step += 1;
      return `<li class="page-row"><a href="${escapeHtml(link.href)}"><span class="page-row-title">${step}. ${escapeHtml(link.title)}</span>${startDescriptions.get(link.href) ? `<span class="page-row-description">${escapeHtml(startDescriptions.get(link.href))}</span>` : ""}${renderStatusBadge(link.publication)}</a></li>`;
    }).join("");
    return `<details class="contents-group"${startOpen}><summary><span>${escapeHtml(section.label)}</span><small>${countWord((section.links || []).length, "page")}</small></summary><ol class="page-rows">${links}</ol></details>`;
  }).join("");
  const other = otherPages.length ? `<details class="contents-group"${startOpen}><summary><span>Other pages</span><small>${countWord(otherPages.length, "page")}</small></summary><ul class="page-rows">${otherPages.map((note) => `<li class="page-row"><a href="${escapeHtml(note.urlPath)}"><span class="page-row-title">${escapeHtml(note.title)}</span>${renderStatusBadge(note.publication)}</a></li>`).join("")}</ul></details>` : "";
  return `<section class="topic-pillar" aria-labelledby="topic-pillar-title"><h2 id="topic-pillar-title">Contents</h2><p><a href="#overview">Read the overview</a></p><p class="status-legend">Unmarked notes are working notes: public, not yet reviewed.</p><div class="contents-groups">${groups}${other}</div></section>`;
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

  const reason = typeof nextReading.reason === "string" && nextReading.reason.trim() !== ""
    ? `<p>${escapeHtml(nextReading.reason.trim())}</p>`
    : "";

  return `<nav class="next-reading" aria-label="Next reading">
  <a class="next-reading-link" href="${escapeHtml(urlPath)}">
    <span class="next-reading-label">Next</span>
    <strong>${escapeHtml(title)}</strong>
    ${renderStatusBadge(nextReading.publication)}
  </a>
  ${reason}
</nav>`;
}

function renderDocumentOutline(contentHtml) {
  const headings = Array.from(contentHtml.matchAll(/<h([23])\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gu)).map((match) => ({
    level: Number(match[1]),
    id: match[2],
    text: match[3].replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim(),
  })).filter((item) => item.text);
  if (headings.length < 3) return "";
  return `<nav class="document-outline" aria-label="On this page"><details><summary>On this page</summary><ol>${headings.map((item) => `<li class="outline-level-${item.level}"><a href="#${escapeHtml(item.id)}">${escapeHtml(item.text)}</a></li>`).join("")}</ol></details></nav>`;
}

function renderTopicPage({ siteTitle, siteUrl = DEFAULT_SITE_URL, topic, topicContentHtml, topics }) {
  const isRoot = !(topic.parentTitle && topic.parentTitle.trim() !== "");
  const urlPath = topic.urlPath || `/topics/${topic.slug}/`;
  const canonicalUrl = absoluteUrl(siteUrl, urlPath);
  const rootSlug = topic.slug.split("/")[0];
  const rootTopic = (topics || []).find((candidate) => candidate.slug === rootSlug);
  const rootTitle = rootTopic ? rootTopic.title : topic.title;
  const crumbs = [{ name: "Notes", href: "/notes/" }];
  if (isRoot) crumbs.push({ name: topic.title, href: urlPath });
  else {
    const ancestors = Array.isArray(topic.ancestors) && topic.ancestors.length ? topic.ancestors : [{ title: rootTitle, urlPath: `/topics/${rootSlug}/` }];
    for (const ancestor of ancestors) crumbs.push({ name: ancestor.title, href: ancestor.urlPath });
    crumbs.push({ name: topic.title, href: urlPath });
  }
  const content = `<div class="note-layout${isRoot ? " note-layout-root" : ""}">
    ${renderBreadcrumb(crumbs)}
    <header class="note-header"><h1 class="site-title">${escapeHtml(topic.title)}</h1>${isRoot && topic.description ? `<p class="topic-meta">${escapeHtml(topic.description)}</p>` : ""}${renderTopicLabels(topic.labels)}${renderNotePublication(topic.publication, topic.corrections, topic.updatedAt)}</header>
    <div class="note-body">${isRoot ? renderTopicPillar(topic.pillar, topic.title, topic.notes) : ""}${renderDocumentOutline(topicContentHtml)}${topicContentHtml}${renderRelatedNotes(topic.related)}${renderNextReading(topic.nextReading)}</div>
  </div>`;
  return renderLayout({
    pageTitle: `${topic.title} · ${siteTitle}`, siteTitle, contentHtml: content, bodyClass: "note-page", activeSection: "notes",
    includeMath: topicContentHtml.includes("data-latex="), description: topic.description || `${topic.title} notes from ${siteTitle}.`, canonicalUrl,
    ogTitle: `${topic.title} · ${siteTitle}`, ogDescription: topic.description || `${topic.title} notes from ${siteTitle}.`, pageSchemaType: isRoot ? "CollectionPage" : "TechArticle",
    structuredData: createBreadcrumbSchema([{ name: "Home", url: absoluteUrl(siteUrl, "/") }, ...crumbs.map((crumb) => ({ name: crumb.name, url: absoluteUrl(siteUrl, crumb.href) }))]),
  });
}

function countWord(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function renderStatusCounts(statusCounts = {}) {
  const parts = Object.entries(statusCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([status, count]) => `${count} ${status.toLowerCase()}${count === 1 ? "" : "s"}`);
  return parts.join(", ");
}

function renderTopicRows(topics) {
  return topics
    .map((topic, index) => {
      const notes = Array.isArray(topic.notes) ? topic.notes : [];
      const noteItems = notes
        .map((note) => `<li class="topic-row-note${note.depth > 1 ? " topic-row-note-nested" : ""}"><a href="${escapeHtml(note.urlPath)}">${escapeHtml(note.title)}</a>${renderStatusBadge(note.publication)}</li>`)
        .join("");
      const count = Number.isInteger(topic.noteCount) ? topic.noteCount : notes.length;
      return `<details class="topic-row" id="topic-${escapeHtml(topic.slug)}" data-hash-disclosure>
  <summary>
    <span class="topic-row-title">${escapeHtml(topic.title)}</span>
    <span class="topic-row-count">${escapeHtml(countWord(count, "note"))}</span>
    <span class="topic-row-description">${escapeHtml(topic.description ?? "")}</span>
  </summary>
  <div class="topic-row-body">
    <p><a class="topic-row-open" href="/topics/${escapeHtml(topic.slug)}/"${index < 9 ? ` data-hotkey="${index + 1}"` : ""}>Open the ${escapeHtml(topic.title)} overview</a>${topic.statusCounts ? ` <span class="topic-row-status">${escapeHtml(renderStatusCounts(topic.statusCounts))}</span>` : ""}</p>
    ${noteItems ? `<ul class="topic-row-notes">${noteItems}</ul>` : ""}
  </div>
</details>`;
    })
    .join("");
}

// Client-side search: the index is fetched on first use rather than inlined, results
// rank exact titles first and show the matching passage, and the query lives in the URL
// so Back restores the results.
function renderSearchScript(topics) {
  const rootLinks = topics.map((topic) => ({ title: topic.title, urlPath: `/topics/${topic.slug}/` }));
  return `
    <script>
      (() => {
        ${rankSearchEntries.toString()}
        ${buildSearchSnippet.toString()}
        const roots = ${safeJsonForScript(rootLinks)};
        const input = document.getElementById("topic-search");
        const form = document.getElementById("search");
        const results = document.getElementById("search-results");
        const status = document.getElementById("topic-search-status");
        const browse = document.getElementById("notes-browse");
        let entries = null;
        let loading = null;
        let urlTimer = null;

        function escapeHtml(value) {
          return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
        }

        function highlight(text, terms) {
          let html = escapeHtml(text);
          for (const term of terms || []) {
            if (term.length < 2) continue;
            const pattern = new RegExp("(" + term.replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\$&") + ")", "gi");
            html = html.replace(pattern, "<mark>$1</mark>");
          }
          return html;
        }

        function statusBadge(entry) {
          const type = entry.contentType ? '<span class="note-type">' + escapeHtml(entry.contentType) + "</span>" : "";
          if (!entry.status) return type ? '<span class="note-publication" aria-label="' + escapeHtml(entry.contentType) + '">' + type + "</span>" : "";
          const map = { "Working note": "working", "Reviewed note": "reviewed", Archived: "archived" };
          const slug = map[entry.status] || "working";
          const visible = slug === "working" ? "" : '<span class="note-status note-status-' + slug + '">' + escapeHtml(entry.status) + "</span>";
          return '<span class="note-publication" aria-label="' + escapeHtml(entry.status + (entry.contentType ? ", " + entry.contentType : "")) + '">' + visible + type + "</span>";
        }

        function load() {
          if (entries) return Promise.resolve(entries);
          if (!loading) {
            loading = fetch("/search-index.json")
              .then((response) => {
                if (!response.ok) throw new Error("HTTP " + response.status);
                return response.json();
              })
              .then((data) => {
                entries = data;
                return entries;
              })
              .catch((error) => {
                loading = null;
                throw error;
              });
          }
          return loading;
        }

        function setUrl(query) {
          clearTimeout(urlTimer);
          urlTimer = setTimeout(() => {
            const url = new URL(window.location.href);
            if (query) url.searchParams.set("q", query);
            else url.searchParams.delete("q");
            url.hash = "";
            history.replaceState(null, "", url.pathname + url.search);
          }, 250);
        }

        function renderEmpty(query) {
          results.innerHTML = "";
          const suggestions = roots.map((root) => '<li><a href="' + escapeHtml(root.urlPath) + '">' + escapeHtml(root.title) + "</a></li>").join("");
          status.innerHTML = 'No notes match “' + escapeHtml(query) + '”. Try a shorter or more general term, check the spelling, or browse a topic: ';
          results.innerHTML = '<li class="search-empty"><ul class="search-suggestions">' + suggestions + '</ul><button type="button" class="text-button" data-clear-search>Clear search</button></li>';
        }

        function render(query) {
          const trimmed = query.trim();
          if (!trimmed) {
            results.hidden = true;
            results.innerHTML = "";
            browse.hidden = false;
            status.textContent = roots.length + " topics. Type to search every note and essay.";
            return;
          }
          browse.hidden = true;
          results.hidden = false;
          const ranked = rankSearchEntries(entries, trimmed, 40);
          if (ranked.length === 0) {
            renderEmpty(trimmed);
            return;
          }
          status.textContent = ranked.length + (ranked.length === 1 ? " result" : " results") + " for “" + trimmed + "”" + (ranked.length === 40 ? " (showing the best 40)" : "") + ".";
          results.innerHTML = '<li class="status-legend search-status-legend">Unmarked notes are working notes: public, not yet reviewed. Essays are labelled separately.</li>' + ranked.map((entry) => {
            const snippet = buildSearchSnippet(entry, trimmed, 90);
            const where = [entry.topicTitle, entry.parentTitle && entry.parentTitle !== entry.topicTitle ? entry.parentTitle : ""].filter(Boolean).join(" › ");
            return '<li class="search-result"><a class="search-result-link" href="' + escapeHtml(entry.urlPath) + '">' + escapeHtml(entry.title) + "</a>" +
              '<p class="search-result-meta">' + (where ? '<span>' + escapeHtml(where) + "</span>" : "") + statusBadge(entry) + "</p>" +
              '<p class="search-result-snippet">' + highlight(snippet.text, snippet.terms) + "</p></li>";
          }).join("");
        }

        function run(query, { updateUrl = true } = {}) {
          if (updateUrl) setUrl(query.trim());
          if (!query.trim()) {
            render("");
            return;
          }
          if (!entries) {
            status.textContent = "Loading the search index…";
            load().then(() => render(input.value)).catch(() => {
              status.innerHTML = 'The search index could not be loaded. <button type="button" class="text-button" data-retry-search>Try again</button>';
            });
            return;
          }
          render(query);
        }

        input.addEventListener("focus", () => { load().catch(() => {}); }, { once: true });
        input.addEventListener("input", () => run(input.value));
        form.addEventListener("submit", (event) => {
          event.preventDefault();
          run(input.value);
        });
        input.addEventListener("keydown", (event) => {
          if (event.key === "ArrowDown") {
            const first = results.querySelector("a");
            if (first) {
              event.preventDefault();
              first.focus();
            }
          } else if (event.key === "Escape" && input.value) {
            event.preventDefault();
            input.value = "";
            run("");
          }
        });
        results.addEventListener("keydown", (event) => {
          const links = Array.from(results.querySelectorAll("a"));
          const index = links.indexOf(document.activeElement);
          if (event.key === "ArrowDown" && index !== -1 && index < links.length - 1) {
            event.preventDefault();
            links[index + 1].focus();
          } else if (event.key === "ArrowUp" && index !== -1) {
            event.preventDefault();
            (index === 0 ? input : links[index - 1]).focus();
          } else if (event.key === "Escape") {
            event.preventDefault();
            input.focus();
          }
        });
        document.addEventListener("click", (event) => {
          const target = event.target instanceof Element ? event.target : null;
          if (target && target.closest("[data-clear-search]")) {
            input.value = "";
            run("");
            input.focus();
          } else if (target && target.closest("[data-retry-search]")) {
            run(input.value, { updateUrl: false });
          }
        });
        window.addEventListener("popstate", () => {
          input.value = new URLSearchParams(window.location.search).get("q") || "";
          run(input.value, { updateUrl: false });
        });

        const initialQuery = new URLSearchParams(window.location.search).get("q");
        // Fragment navigation resets focus after inline scripts run, so focus once it settles.
        const focusFromHash = () => {
          if (window.location.hash === "#search") requestAnimationFrame(() => requestAnimationFrame(() => input.focus()));
        };
        if (initialQuery) {
          input.value = initialQuery;
          run(initialQuery, { updateUrl: false });
        } else if (document.readyState === "complete") {
          focusFromHash();
        } else {
          window.addEventListener("load", focusFromHash, { once: true });
        }
        window.addEventListener("hashchange", focusFromHash);
      })();
    </script>`;
}

function renderReadingPathList(steps) {
  return `<ol class="reading-path-steps">${steps
    .map((step) => `<li><a href="${escapeHtml(step.href)}">${escapeHtml(step.title)}</a>${step.publication ? renderStatusBadge(step.publication) : `<span class="note-publication"><span class="note-type">${escapeHtml(step.kind)}</span></span>`}${step.note ? `<p>${escapeHtml(step.note)}</p>` : ""}</li>`)
    .join("")}</ol>`;
}

function renderReadingPaths(readingPaths, { headingLevel = 2 } = {}) {
  if (!Array.isArray(readingPaths) || readingPaths.length === 0) {
    return "";
  }
  const tag = `h${headingLevel}`;
  return readingPaths
    .map((pathEntry) => `<details class="reading-path" id="path-${escapeHtml(pathEntry.id)}" data-hash-disclosure>
  <summary><${tag} class="reading-path-title">${escapeHtml(pathEntry.title)}</${tag}><span class="reading-path-audience">${escapeHtml(pathEntry.audience || "")}</span></summary>
  <div class="reading-path-body">
    ${pathEntry.summary ? `<p>${escapeHtml(pathEntry.summary)}</p>` : ""}
    ${renderReadingPathList(pathEntry.steps)}
  </div>
</details>`)
    .join("");
}

function renderNotesIndexPage({
  siteTitle,
  siteUrl = DEFAULT_SITE_URL,
  topics = [],
  readingPaths = [],
  errataEntries = [],
}) {
  const noteTotal = topics.reduce((sum, topic) => sum + (Number.isInteger(topic.noteCount) ? topic.noteCount + 1 : 1), 0);
  const reviewed = topics.flatMap((topic) => (topic.notes || []).filter((note) => note.publication?.status === "Reviewed note"));
  const knowledgePaths = readingPaths.filter((pathEntry) => pathEntry.steps.some((step) => step.href.startsWith("/topics/")));
  const recentCorrections = errataEntries.slice(0, 3);

  const content = `
    ${renderPageHeader({
      title: "Computer science notes",
      id: "topics-title",
      intro: `An open notebook of ${countWord(noteTotal, "page")} across ${countWord(topics.length, "topic")}. <span id="publication-status">Unmarked notes are working notes: public, not yet reviewed.</span> Reviewed and Archived notes are tagged. Known errors are corrected on the <a href="/errata/">Errata</a> page.`,
    })}
    <section class="notes-search" aria-label="Search notes">
      <form id="search" class="search-anchor" aria-labelledby="search-label" role="search" action="/notes/" method="get">
        <label id="search-label" class="topic-search-label" for="topic-search">Search topics and subpages</label>
        <div class="search-field">
          <input id="topic-search" class="topic-search" name="q" type="search" autocomplete="off" placeholder="Try dijkstra, pointers, scheduling…" aria-describedby="topic-search-status" aria-controls="search-results" />
          <button type="submit" class="search-submit">Search</button>
        </div>
      </form>
      <p id="topic-search-status" class="topic-search-status" aria-live="polite">${countWord(topics.length, "topic")}. Type to search every note and essay.</p>
      <ol id="search-results" class="search-results" hidden></ol>
    <noscript><p class="search-no-js">Search needs JavaScript; every topic remains browsable below.</p></noscript>
    </section>
    <div id="notes-browse">
      <section class="notes-topics" aria-labelledby="notes-topics-title">
        <h2 id="notes-topics-title">Topics</h2>
        <p class="section-intro">Open a topic to see every note in it with its status, or go straight to its overview.</p>
        <div id="topic-grid" class="topic-rows">${renderTopicRows(topics)}</div>
      </section>
      ${knowledgePaths.length > 0 ? `<section class="notes-paths" aria-labelledby="notes-paths-title">
        <h2 id="notes-paths-title">Guided paths</h2>
        ${renderReadingPaths(knowledgePaths, { headingLevel: 3 })}
      </section>` : ""}
      <section class="notes-activity" aria-labelledby="notes-activity-title">
        <h2 id="notes-activity-title">Reviews and corrections</h2>
        ${reviewed.length > 0
          ? `<ul class="plain-list">${reviewed.map((note) => `<li><a href="${escapeHtml(note.urlPath)}">${escapeHtml(note.title)}</a>${renderStatusBadge(note.publication)}</li>`).join("")}</ul>`
          : `<p>No note has been marked reviewed yet, so every note is labelled a Working note.</p>`}
        ${recentCorrections.length > 0
          ? `<p>Recent corrections:</p><ul class="plain-list">${recentCorrections.map((entry) => `<li><a href="${escapeHtml(entry.noteUrlPath)}">${escapeHtml(entry.noteTitle)}</a> · ${escapeHtml(entry.kind)} on <a href="/errata/#${escapeHtml(entry.id)}"><time datetime="${escapeHtml(entry.date)}">${escapeHtml(entry.date)}</time></a></li>`).join("")}</ul><p><a href="/errata/">All ${countWord(errataEntries.length, "correction")} on the Errata page</a></p>`
          : ""}
      </section>
    </div>
  `;

  return renderLayout({
    pageTitle: `Notes · ${siteTitle}`,
    siteTitle,
    contentHtml: content,
    bodyClass: "notes-index-page",
    activeSection: "notes",
    description: NOTES_DESCRIPTION,
    canonicalUrl: absoluteUrl(siteUrl, "/notes/"),
    ogTitle: `Notes · ${siteTitle}`,
    ogDescription: NOTES_DESCRIPTION,
    pageSchemaType: "CollectionPage",
    structuredData: createBreadcrumbSchema([
      { name: "Home", url: absoluteUrl(siteUrl, "/") },
      { name: "Notes", url: absoluteUrl(siteUrl, "/notes/") },
    ]),
    extraScripts: renderSearchScript(topics),
  });
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

const DEFAULT_PROJECTS_DATA = {
  projects: [
    {
      slug: "notes",
      title: "Notes — this site",
      status: "active · current site",
      summary: "The site you are reading: a static build that turns Notion study notes into public pages.",
      problem: "Technical notes need source fidelity and durable discovery to remain useful beyond their original workspace.",
      method: "Build-time Notion ingestion and static route generation.",
      result: "Topic hierarchies, child pages, blog posts, RSS, sitemap, LaTeX, and code blocks.",
      codeUrl: "https://github.com/Praneeth-Suresh/Notes",
      writeupUrl: "/notes/",
      tags: ["static-site", "notion", "search"],
    },
  ],
};

function safeHref(value) {
  return typeof value === "string" && (/^https:\/\//u.test(value.trim()) || value.trim().startsWith("/"))
    ? value.trim()
    : "";
}

function normalizeProject(project) {
  if (!project || typeof project !== "object") {
    return null;
  }

  const slug = typeof project.slug === "string" ? project.slug.trim() : "";
  const title = typeof project.title === "string" ? project.title.trim() : "";
  if (!/^[a-z0-9-]+$/u.test(slug) || title === "") {
    return null;
  }
  const text = (key) => (typeof project[key] === "string" ? project[key].trim() : "");
  const artifact = project.artifact && typeof project.artifact === "object"
    ? {
        label: typeof project.artifact.label === "string" ? project.artifact.label.trim() : "",
        kind: project.artifact.kind === "list" ? "list" : "code",
        content: typeof project.artifact.content === "string" ? project.artifact.content : "",
        items: Array.isArray(project.artifact.items)
          ? project.artifact.items.filter((item) => typeof item === "string" && item.trim() !== "")
          : [],
      }
    : null;

  return {
    slug,
    title,
    status: text("status") || "active",
    updatedAt: text("updatedAt"),
    summary: text("summary"),
    role: text("role"),
    problem: text("problem"),
    method: text("method"),
    decision: text("decision"),
    limitation: text("limitation"),
    result: text("result"),
    artifact,
    codeUrl: safeHref(project.codeUrl),
    writeupUrl: safeHref(project.writeupUrl),
    demoUrl: safeHref(project.demoUrl),
    tags: Array.isArray(project.tags)
      ? project.tags.filter((tag) => typeof tag === "string" && tag.trim() !== "").map((tag) => tag.trim())
      : [],
  };
}

function getProjectItems(projectsData) {
  const source = projectsData && Array.isArray(projectsData.projects)
    ? projectsData.projects
    : DEFAULT_PROJECTS_DATA.projects;
  return source.map((project) => normalizeProject(project)).filter(Boolean);
}

function renderTagList(tags, ariaLabel = "Tags") {
  if (!Array.isArray(tags) || tags.length === 0) {
    return "";
  }

  return `<div class="topic-labels" aria-label="${escapeHtml(ariaLabel)}">${tags
    .map((tag) => `<span class="topic-label topic-label-default">${escapeHtml(tag)}</span>`)
    .join("")}</div>`;
}

function renderBlogTagLinks(tags, ariaLabel = "Post topics") {
  if (!Array.isArray(tags) || tags.length === 0) {
    return "";
  }

  return `<div class="topic-labels blog-topic-links" aria-label="${escapeHtml(ariaLabel)}">${tags
    .map((tag) => {
      const normalizedTag = tag.trim();
      const href = `/blog/?topic=${encodeURIComponent(normalizedTag)}#blog-posts`;
      return `<a class="topic-label topic-label-default" href="${escapeHtml(href)}">${escapeHtml(normalizedTag)}</a>`;
    })
    .join("")}</div>`;
}

function renderProjectLinks(project) {
  const links = [
    project.codeUrl ? `<a href="${escapeHtml(project.codeUrl)}"${project.codeUrl.includes("github.com") ? ' data-analytics-event="outbound_github_click"' : ""}>Source code</a>` : "",
    project.demoUrl ? `<a href="${escapeHtml(project.demoUrl)}">Live site</a>` : "",
    project.writeupUrl ? `<a href="${escapeHtml(project.writeupUrl)}">${project.writeupUrl.startsWith("/blog/") ? "Write-up" : "Open companion"}</a>` : "",
  ].filter(Boolean);
  return links.length > 0 ? `<p class="project-links">${links.join("")}</p>` : "";
}

function renderArtifact(artifact) {
  if (!artifact) {
    return "";
  }
  const body = artifact.kind === "list"
    ? `<ul>${artifact.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : `<div class="code-block"><div class="code-block-header"><span class="code-language">Output</span><button class="copy-action" type="button" data-copy-code>Copy</button><span class="visually-hidden" aria-live="polite" data-copy-status></span></div><pre tabindex="0" role="region" aria-label="Project evidence"><code>${escapeHtml(artifact.content)}</code></pre></div>`;
  return `<figure class="project-artifact">
  ${body}
  ${artifact.label ? `<figcaption>${escapeHtml(artifact.label)}</figcaption>` : ""}
</figure>`;
}

function renderProjectSummary(project, { headingLevel = 2 } = {}) {
  const tag = `h${headingLevel}`;
  return `<article class="project-summary" data-project="${escapeHtml(project.slug)}">
  <${tag}><a href="/projects/${escapeHtml(project.slug)}/">${escapeHtml(project.title)}</a></${tag}>
  <p class="project-status">${escapeHtml(project.status)}</p>
  <p>${escapeHtml(project.summary)}</p>
  ${project.role ? `<p class="project-role"><strong>Role:</strong> ${escapeHtml(project.role)}</p>` : ""}
  ${renderProjectLinks(project)}
</article>`;
}

function renderProjectsIndexPage({ siteTitle, siteUrl = DEFAULT_SITE_URL, projectsData = DEFAULT_PROJECTS_DATA }) {
  const projects = getProjectItems(projectsData);
  const rows = projects.length ? `<ul class="project-list page-rows">${projects.map((project) => `<li class="page-row"><a href="/projects/${escapeHtml(project.slug)}/"><span class="page-row-title">${escapeHtml(project.title)}</span>${project.summary ? `<span class="page-row-description">${escapeHtml(project.summary)}</span>` : ""}<span class="page-row-meta">${escapeHtml([project.role, project.updatedAt, project.status].filter(Boolean).join(" · "))}</span></a></li>`).join("")}</ul>` : `<p>No projects are listed yet.</p>`;
  const content = `${renderPageHeader({ title: "Projects", id: "projects-title", intro: "Inspectable project dossiers: the constraint, what I built, published evidence, and stated limits." })}<section class="projects-index" aria-label="Projects">${rows}</section>`;
  return renderLayout({ pageTitle: `Projects · ${siteTitle}`, siteTitle, contentHtml: content, bodyClass: "projects-page", activeSection: "projects", description: PROJECTS_DESCRIPTION, canonicalUrl: absoluteUrl(siteUrl, "/projects/"), ogTitle: `Projects · ${siteTitle}`, ogDescription: PROJECTS_DESCRIPTION, pageSchemaType: "CollectionPage" });
}

function renderProjectPage({ siteTitle, siteUrl = DEFAULT_SITE_URL, project, projectsData = DEFAULT_PROJECTS_DATA }) {
  const normalizedProject = normalizeProject(project) || getProjectItems(projectsData)[0];
  const projects = getProjectItems(projectsData);
  const others = projects.filter((candidate) => candidate.slug !== normalizedProject.slug);
  const projectUrlPath = `/projects/${normalizedProject.slug}/`;
  const sections = [
    ["Problem", normalizedProject.problem], ["What I built", normalizedProject.method],
    ["One hard decision", normalizedProject.decision], ["Where it stands", normalizedProject.result], ["Limits", normalizedProject.limitation],
  ].filter(([, value]) => value).map(([label, value]) => `<section class="project-section"><h2>${escapeHtml(label)}</h2><p>${escapeHtml(value)}</p></section>`);
  const evidence = normalizedProject.artifact ? `<section class="project-section"><h2>Evidence</h2>${renderArtifact(normalizedProject.artifact)}</section>` : "";
  const body = sections.length > 2 ? [...sections.slice(0, 2), evidence, ...sections.slice(2)].join("") : [...sections, evidence].join("");
  const facts = [
    ["Status", normalizedProject.status], ["Role", normalizedProject.role], ["Stack", normalizedProject.tags.join(", ")],
    ["Repository", normalizedProject.codeUrl ? `<a href="${escapeHtml(normalizedProject.codeUrl)}" data-analytics-event="outbound_github_click">Source code</a>` : ""],
    ["Dates", normalizedProject.updatedAt ? `<time datetime="${escapeHtml(normalizedProject.updatedAt)}">Updated ${escapeHtml(normalizedProject.updatedAt)}</time>` : ""],
  ].filter(([, value]) => value).map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("");
  const content = `${renderBreadcrumb([{ name: "Projects", href: "/projects/" }, { name: normalizedProject.title, href: projectUrlPath }])}<article class="project-page"><header class="project-header"><h1 id="project-title">${escapeHtml(normalizedProject.title)}</h1>${normalizedProject.summary ? `<p class="page-intro">${escapeHtml(normalizedProject.summary)}</p>` : ""}<dl class="project-facts">${facts}</dl>${renderProjectLinks({ ...normalizedProject, codeUrl: "" })}</header>${body}</article>${others.length ? `<nav class="project-others" aria-labelledby="project-others-title"><h2 id="project-others-title">Other projects</h2><ul class="plain-list">${others.map((other) => `<li><a href="/projects/${escapeHtml(other.slug)}/">${escapeHtml(other.title)}</a> — ${escapeHtml(other.summary)}</li>`).join("")}</ul></nav>` : ""}`;
  return renderLayout({ pageTitle: `${normalizedProject.title} · Projects · ${siteTitle}`, siteTitle, contentHtml: content, bodyClass: "project-detail-page", activeSection: "projects", description: normalizedProject.summary || PROJECTS_DESCRIPTION, canonicalUrl: absoluteUrl(siteUrl, projectUrlPath), ogTitle: `${normalizedProject.title} · Projects · ${siteTitle}`, ogDescription: normalizedProject.summary || PROJECTS_DESCRIPTION, pageSchemaType: "CreativeWork", dateModified: normalizedProject.updatedAt || null, structuredData: createBreadcrumbSchema([{ name: "Home", url: absoluteUrl(siteUrl, "/") }, { name: "Projects", url: absoluteUrl(siteUrl, "/projects/") }, { name: normalizedProject.title, url: absoluteUrl(siteUrl, projectUrlPath) }]) });
}

// ---------------------------------------------------------------------------
// Home, Start here, About, Contact
// ---------------------------------------------------------------------------

function renderContactLinks(source) {
  return `<ul class="contact-links">
  <li><span class="contact-label">Email</span> <a href="mailto:praneeth.suresh.s%40gmail.com" data-contact-source="${escapeHtml(source)}">${escapeHtml(PUBLIC_CONTACT_TEXT)}</a></li>
  <li><span class="contact-label">GitHub</span> <a href="${PUBLIC_GITHUB_URL}" data-analytics-event="outbound_github_click">github.com/Praneeth-Suresh</a></li>
  <li><span class="contact-label">LinkedIn</span> <a href="${PUBLIC_LINKEDIN_URL}" data-analytics-event="outbound_linkedin_click">linkedin.com/in/praneeth-suresh</a></li>
  <li><span class="contact-label">CV</span> <a href="/cv.pdf" data-analytics-event="cv_download_click">Two-page PDF</a></li>
</ul>`;
}

function renderHomePage({
  siteTitle,
  siteUrl = DEFAULT_SITE_URL,
  topics = [],
  projectsData = DEFAULT_PROJECTS_DATA,
  homeReadings = [],
  readingPaths = [],
  homeProjectSlugs = [],
  blogManifest = { sections: [] },
}) {
  const projects = getProjectItems(projectsData);
  const featured = (homeProjectSlugs.length > 0
    ? homeProjectSlugs.map((slug) => projects.find((project) => project.slug === slug)).filter(Boolean)
    : projects.slice(0, 2));
  const noteTotal = topics.reduce((sum, topic) => sum + (Number.isInteger(topic.noteCount) ? topic.noteCount + 1 : 1), 0);
  const professionalPath = readingPaths.find((pathEntry) => pathEntry.id === "recruiters");
  const posts = (blogManifest?.sections || []).flatMap((section) =>
    (section.posts || []).map((post) => ({ ...post, section: section.title })),
  ).sort((a, b) => String(b.publishedAt || "").localeCompare(String(a.publishedAt || "")));
  const row = ({ href, title, description = "", meta = "" }) => `<li class="page-row"><a href="${escapeHtml(href)}"><span class="page-row-title">${escapeHtml(title)}</span>${description ? `<span class="page-row-description">${escapeHtml(description)}</span>` : ""}${meta ? `<span class="page-row-meta">${escapeHtml(meta)}</span>` : ""}</a></li>`;
  const legend = `<p class="status-legend">Unmarked notes are working notes: public, not yet reviewed.</p>`;

  const content = `
    <section class="home-index" aria-labelledby="home-title">
      <h1 id="home-title">Praneeth Suresh</h1>
      <p class="home-lede">I am an ML engineer and a computer science and mathematics student at NUS. I build tools that make AI-assisted software development checkable, and publish my study notes as an open notebook.</p>
      <p class="home-instruction">Open a section</p>
      <div class="home-disclosures">
        <details id="projects" name="home-index" data-home-section><summary><span>Projects</span><small>${countWord(projects.length, "project")}</small></summary><div class="home-panel">${featured.length ? `<ul class="page-rows">${featured.map((project) => row({ href: `/projects/${project.slug}/`, title: project.title, description: project.summary, meta: project.status })).join("")}</ul>` : `<p>No projects are listed yet.</p>`}${professionalPath ? `<h2>${escapeHtml(professionalPath.title)}</h2><p>${escapeHtml(professionalPath.summary || "")}</p>${renderReadingPathList(professionalPath.steps)}` : ""}<p><a href="/projects/">View all projects</a></p></div></details>
        <details id="notes" name="home-index" data-home-section><summary><span>Notes</span><small>${countWord(noteTotal, "page")}</small></summary><div class="home-panel">${legend}<ul class="page-rows">${topics.slice(0, 8).map((topic) => row({ href: `/topics/${topic.slug}/`, title: topic.title, description: topic.description, meta: countWord(topic.noteCount + 1, "page") })).join("")}</ul><p><a href="/notes/">Browse and search all notes</a></p></div></details>
        <details id="writing" name="home-index" data-home-section><summary><span>Writing</span><small>${countWord(posts.length, "post")}</small></summary><div class="home-panel">${posts.length ? `<ul class="page-rows">${posts.slice(0, 5).map((post) => row({ href: `/blog/${post.slug}/`, title: post.title, description: post.description || "", meta: post.publishedAt || post.section })).join("")}</ul>` : `<p>No writing is listed yet.</p>`}<p><a href="/blog/">View all writing</a></p></div></details>
        <details id="about" name="home-index" data-home-section><summary><span>About</span></summary><div class="home-panel"><p>I work on AI tooling, applied machine learning, and technical systems that can be inspected rather than taken on trust.</p>${renderContactLinks("home")}<p><a href="/about/">About Praneeth</a></p></div></details>
      </div>
    </section>`;

  return renderLayout({
    pageTitle: siteTitle,
    siteTitle,
    contentHtml: content,
    bodyClass: "home-page",
    description: HOME_DESCRIPTION,
    canonicalUrl: absoluteUrl(siteUrl, "/"),
    ogTitle: siteTitle,
    ogDescription: HOME_DESCRIPTION,
  });
}


const DEFAULT_PORTFOLIO_DATA = { reviewedRepositoryCount: 0, portfolioProjects: [], repositoryGroups: [] };

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
    href: safeHref(repo.href) || `https://github.com/Praneeth-Suresh/${name}`,
  };
}

const ABOUT_EXPERIENCE = [
  { role: "AI Legal Automation Intern", org: "Agile Counsel", dates: "May – Jul 2026", detail: "Built a React and Node.js legal document-automation workflow with validated intake and generated incorporation documents." },
  { role: "Co-founder and ML Engineer", org: "Kabal Research", dates: "Sep 2023 – Jan 2026", detail: "Built NLP and graph-analytics pipelines that turned geopolitical news into structured risk signals for analysts." },
  { role: "Co-founder and ML Engineer", org: "ReProse", dates: "Dec 2023 – Jun 2024", detail: "Built an OCR system for handwritten input and a retrieval-augmented generation prototype." },
];

function renderPersonalPage({
  siteTitle,
  siteUrl = DEFAULT_SITE_URL,
  portfolioData = DEFAULT_PORTFOLIO_DATA,
  projectsData = DEFAULT_PROJECTS_DATA,
  researchTasteData = { topics: [], currentQuestions: [] },
}) {
  const resolvedPortfolioData = portfolioData && typeof portfolioData === "object" ? portfolioData : DEFAULT_PORTFOLIO_DATA;
  const repositoryGroups = Array.isArray(resolvedPortfolioData.repositoryGroups) ? resolvedPortfolioData.repositoryGroups : [];
  const projects = getProjectItems(projectsData);
  const repoHtml = repositoryGroups.map((group) => {
    const repos = (Array.isArray(group.repos) ? group.repos : []).map(normalizeRepositoryLink).filter(Boolean);
    return repos.length ? `<div class="repo-group"><h3>${escapeHtml(group.label || "Repositories")}</h3><p>${repos.map((repo) => `<a href="${escapeHtml(repo.href)}" data-analytics-event="outbound_github_click">${escapeHtml(repo.name)}</a>`).join(", ")}</p></div>` : "";
  }).join("");
  const questions = Array.isArray(researchTasteData?.currentQuestions) ? researchTasteData.currentQuestions : [];
  const topics = Array.isArray(researchTasteData?.topics) ? researchTasteData.topics.map(normalizeResearchTasteTopic).filter(Boolean) : [];
  const questionsHtml = questions.map((item, index) => `<details class="research-question" id="question-${index + 1}"><summary>${escapeHtml(item.question)}</summary><div>${item.why ? `<p><strong>Why it matters to me:</strong> ${escapeHtml(item.why)}</p>` : ""}${item.wouldChangeMyView ? `<p><strong>What would change my view:</strong> ${escapeHtml(item.wouldChangeMyView)}</p>` : ""}${normalizeLinks(item.links).length ? `<ul class="research-sources">${normalizeLinks(item.links).map((link) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`).join("")}</ul>` : ""}</div></details>`).join("");
  const topicsHtml = topics.map((topic) => `<li class="research-topic"><h3>${escapeHtml(topic.title)}</h3>${topic.rationale ? `<p>${escapeHtml(topic.rationale)}</p>` : ""}${topic.sources.length ? `<ul class="research-sources">${topic.sources.map((source) => `<li><a href="${escapeHtml(source.href)}">${escapeHtml(source.label)}</a></li>`).join("")}</ul>` : ""}</li>`).join("");
  const content = `
    ${renderPageHeader({ title: "Praneeth Suresh", id: "portfolio-title", intro: "ML engineer and computer science and mathematics student at the National University of Singapore (double major, 2025–2028). I work on tools that make AI-assisted software development checkable, and I keep my study notes public." })}
    <section class="about-section" aria-labelledby="about-now-title"><h2 id="about-now-title">Now</h2><p>I maintain <a href="/projects/beryl/">Beryl</a>, a set of repository files and checks for working with coding agents, and I am researching, as CP3106 independent research at NUS, whether machine-readable repository policies with deterministic enforcement improve coding-agent outcomes over the same rules in prose. The study is in progress and has no results yet.</p></section>
    <section class="about-section" aria-labelledby="about-experience-title"><h2 id="about-experience-title">Experience</h2><ul class="experience-list">${ABOUT_EXPERIENCE.map((item) => `<li><p class="experience-role"><strong>${escapeHtml(item.role)}</strong>, ${escapeHtml(item.org)} <span>${escapeHtml(item.dates)}</span></p><p>${escapeHtml(item.detail)}</p></li>`).join("")}</ul><p>Details, including education and awards, are in the <a href="/cv.pdf" data-analytics-event="cv_download_click">CV</a>.</p></section>
    <section class="about-section" aria-labelledby="about-work-title"><h2 id="about-work-title">Work you can inspect</h2><ul class="plain-list">${projects.map((project) => `<li><a href="/projects/${escapeHtml(project.slug)}/">${escapeHtml(project.title)}</a> — ${escapeHtml(project.summary)}</li>`).join("")}</ul><p>I also write about <a href="/blog/">research reading and projects</a> and keep <a href="/notes/">computer science notes</a>.</p>${repoHtml ? `<details class="repo-map"><summary>Other public repositories</summary>${repoHtml}</details>` : ""}</section>
    <section id="research" class="about-section" aria-labelledby="about-research-title"><h2 id="about-research-title">Research questions</h2><p>The questions I am working on now, why they matter to me, and what evidence would change my view.</p>${questionsHtml || "<p>No current questions are listed.</p>"}${topicsHtml ? `<details class="research-archive"><summary>Reading list archive (${countWord(topics.length, "theme")})</summary><ol class="research-topics">${topicsHtml}</ol></details>` : ""}</section>
    <section id="contact" class="about-section" aria-labelledby="about-contact-title"><h2 id="about-contact-title">Contact</h2><p>Email is the best way to reach me. I usually reply within a week.</p>${renderContactLinks("about")}<div id="collaboration-fit"><h3>What I am open to</h3><ul><li>Research conversations about interpretability, model evaluation, and coding-agent reliability.</li><li>Internships and engineering roles in AI tooling, applied ML, and developer tools.</li><li>Feedback on Beryl, SIAP, or a note on this site, including corrections.</li><li>NUS AI Society collaborations: talks, workshops, and partners.</li></ul><h3>What helps</h3><p>Say who you are, what you are working on, and what kind of reply would be useful. For a correction, include the page and the claim.</p></div></section>`;
  return renderLayout({ pageTitle: "About", siteTitle, contentHtml: content, bodyClass: "about-page", activeSection: "about", description: "About Praneeth Suresh: ML engineer and NUS computer science and mathematics student working on checks for AI-assisted software development.", canonicalUrl: absoluteUrl(siteUrl, "/about/"), ogTitle: `About — Praneeth Suresh`, ogDescription: "ML engineer and NUS computer science and mathematics student working on checks for AI-assisted software development.", pageSchemaType: "ProfilePage" });
}


function renderNotFoundPage({ siteTitle, siteUrl = DEFAULT_SITE_URL }) {
  const content = `
    <header class="page-header">
      <p class="error-code">404</p>
      <h1 id="not-found-title">Page not found</h1>
      <p class="page-intro">This page does not exist or has moved. Notes that were renamed redirect automatically, so if you followed an old link, try searching for its title.</p>
    </header>
    <form class="not-found-search" role="search" action="/notes/" method="get">
      <label class="topic-search-label" for="not-found-search">Search the notes</label>
      <div class="search-field"><input id="not-found-search" class="topic-search" name="q" type="search" /><button type="submit" class="search-submit">Search</button></div>
    </form>
    <nav aria-label="404 recovery links">
      <ul class="plain-list">
        <li><a href="/">Home</a></li>
        <li><a href="/notes/">Notes</a></li>
        <li><a href="/blog/">Writing</a></li>
        <li><a href="/projects/">Projects</a></li>
        <li><a href="/about/#contact">Contact</a></li>
      </ul>
    </nav>
  `;

  return renderLayout({
    pageTitle: `Page not found · ${siteTitle}`,
    siteTitle,
    contentHtml: content,
    bodyClass: "not-found-page",
    description: NOT_FOUND_DESCRIPTION,
    canonicalUrl: absoluteUrl(siteUrl, "/404.html"),
    ogTitle: `Page not found · ${siteTitle}`,
    ogDescription: NOT_FOUND_DESCRIPTION,
  });
}

// ---------------------------------------------------------------------------
// Research questions, Errata, RSS
// ---------------------------------------------------------------------------

function normalizeResearchTasteTopic(topic) {
  if (!topic || typeof topic !== "object") {
    return null;
  }

  const title = typeof topic.title === "string" ? topic.title.trim() : "";
  if (!title) {
    return null;
  }

  const rationale = typeof topic.rationale === "string" ? topic.rationale.trim() : "";
  const sources = normalizeLinks(topic.sources);
  return { title, rationale, sources };
}

function normalizeLinks(links) {
  return Array.isArray(links)
    ? links
        .filter((source) => source && typeof source === "object")
        .map((source) => ({
          label: typeof source.label === "string" ? source.label.trim() : "",
          href: safeHref(source.href),
        }))
        .filter((source) => source.label !== "" && source.href !== "")
    : [];
}


function renderErrataEntries(errataEntries) {
  if (!Array.isArray(errataEntries) || errataEntries.length === 0) {
    return "";
  }
  return `<ol class="errata-log">${errataEntries
    .map((entry) => `<li class="errata-entry errata-entry-${escapeHtml(entry.kind.toLowerCase())}" id="${escapeHtml(entry.id)}">
  <p class="errata-entry-meta"><span class="errata-kind">${escapeHtml(entry.kind)}</span> · <time datetime="${escapeHtml(entry.date)}">${escapeHtml(entry.date)}</time> · <a href="${escapeHtml(entry.noteUrlPath)}">${escapeHtml(entry.topicTitle)}${entry.noteTitle !== entry.topicTitle ? ` / ${escapeHtml(entry.noteTitle)}` : ""}</a></p>
  <p>${escapeHtml(entry.summary)}</p>
  ${entry.original || entry.corrected ? `<div class="errata-change">${entry.original ? `<p class="errata-original"><span>Original</span>${escapeHtml(entry.original)}</p>` : ""}${entry.corrected ? `<p class="errata-corrected"><span>Now</span>${escapeHtml(entry.corrected)}</p>` : ""}</div>` : ""}
</li>`)
    .join("")}</ol>`;
}

function renderErrataPage({ siteTitle, siteUrl = DEFAULT_SITE_URL, errataEntries = [] }) {
  const content = `
    ${renderPageHeader({
      title: "Errata",
      id: "errata-title",
      intro: "Public corrections and clarifications for Praneeth Suresh. Each entry names the affected page, the original claim, and what it says now; the corrected page links back here from its status block.",
    })}
    <section class="errata-panel" aria-labelledby="errata-current">
      <h2 id="errata-current">${errataEntries.length > 0 ? `${errataEntries.length} published ${errataEntries.length === 1 ? "entry" : "entries"}.` : "No published corrections yet."}</h2>
      <p>When a substantive error is found, this page records the affected page, the original claim, the correction, and the date. Clarifications that change interpretation without changing a result, and removals of unpublished working material, are labelled separately from factual or mathematical corrections.</p>
      ${renderErrataEntries(errataEntries)}
    </section>
    <section class="errata-policy" aria-labelledby="errata-policy-title">
      <h2 id="errata-policy-title">Correction policy</h2>
      <ul>
        <li>Mathematical, algorithmic, and factual errors get an entry here and a link from the affected note.</li>
        <li>Minor grammar or wording edits that do not change a claim are fixed without an entry.</li>
        <li>Source updates keep the original citation visible when the correction depends on it.</li>
      </ul>
      <p>Found an error? <a href="/about/#contact">Tell me</a> which page and claim. Essays are covered too; start with <a href="${FLAGSHIP_ESSAY_PATH}">${FLAGSHIP_ESSAY_TITLE}</a>.</p>
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


// ---------------------------------------------------------------------------
// Writing (blog)
// ---------------------------------------------------------------------------

const FEATURED_POST_SLUGS = [
  "tracing-the-mental-models-of-deep-learning-lessons-from-foundational-papers",
  "engineering-discipline-for-agentic-coding",
  "np-completeness-formal-definition-proof-sketches-and-reductions",
];

function renderBlogIndexPage({ siteTitle, siteUrl = DEFAULT_SITE_URL, blogManifest, homeContentHtml = "" }) {
  const allPosts = (blogManifest?.sections || []).flatMap((section) => (section.posts || []).map((post) => ({ post, section })));
  allPosts.sort((a, b) => String(b.post.publishedAt || "").localeCompare(String(a.post.publishedAt || "")) || a.post.title.localeCompare(b.post.title));
  const years = new Map();
  for (const item of allPosts) {
    const year = /^\d{4}/u.test(item.post.publishedAt || "") ? item.post.publishedAt.slice(0, 4) : "Undated";
    years.set(year, [...(years.get(year) || []), item]);
  }
  const archive = allPosts.length ? Array.from(years, ([year, items]) => `<section class="blog-year" data-blog-section><h2>${escapeHtml(year)}</h2><ul class="blog-post-list page-rows">${items.map(({ post, section }) => {
    const tags = Array.isArray(post.tags) ? post.tags.filter((tag) => typeof tag === "string") : [];
    const searchable = `${section.title} ${section.subtitle || ""} ${post.title} ${post.description || ""} ${tags.join(" ")}`.toLowerCase();
    return `<li class="blog-post-item page-row" data-blog-search="${escapeHtml(searchable)}"><a href="/blog/${escapeHtml(post.slug)}/"><span class="page-row-title">${escapeHtml(post.title)}</span>${post.description ? `<span class="page-row-description">${escapeHtml(post.description)}</span>` : ""}<span class="page-row-meta">${post.publishedAt ? `<time datetime="${escapeHtml(post.publishedAt)}">${escapeHtml(post.publishedAt)}</time>` : ""}${post.publishedAt && section.title ? " · " : ""}${escapeHtml(section.title || "")}</span></a></li>`;
  }).join("")}</ul></section>`).join("") : `<p>No writing has been published yet.</p>`;
  const content = `${renderPageHeader({ title: "Writing", id: "blog-title", intro: "Research essays, engineering write-ups, and project stories, listed by publication date." })}${homeContentHtml ? `<div class="blog-home-content">${homeContentHtml}</div>` : ""}<section id="blog-posts" class="blog-toc" aria-labelledby="blog-archive-title"><h2 id="blog-archive-title">Archive</h2><label class="topic-search-label" for="blog-search">Search writing</label><input id="blog-search" class="topic-search" type="search" placeholder="Try interpretability, proofs, project story…" aria-describedby="blog-search-status" /><p id="blog-search-status" class="topic-search-status" aria-live="polite">Showing all ${escapeHtml(countWord(allPosts.length, "post"))}.</p><div aria-label="Writing archive">${archive}</div></section><p class="blog-acknowledgements">Unless otherwise noted, blog illustrations were generated with Stable Diffusion XL under the CreativeML Open RAIL++-M License.</p>
  <script>(() => { const input=document.getElementById("blog-search"); const status=document.getElementById("blog-search-status"); const items=Array.from(document.querySelectorAll(".blog-post-item")); const sections=Array.from(document.querySelectorAll("[data-blog-section]")); const initial=new URLSearchParams(window.location.search).get("topic"); function update(){const q=input.value.trim().toLowerCase();let shown=0;for(const item of items){const match=!q||item.dataset.blogSearch.includes(q);item.hidden=!match;if(match)shown++;}for(const section of sections)section.hidden=!Array.from(section.querySelectorAll(".blog-post-item")).some(item=>!item.hidden);status.textContent=q?(shown?shown+" result"+(shown===1?"":"s")+" shown.":"No writing matches this search. Clear it to restore the archive."):"Showing all "+items.length+" posts.";}if(initial)input.value=initial;input.addEventListener("input",update);update(); })();</script>`;
  return renderLayout({ pageTitle: `Writing · ${siteTitle}`, siteTitle, contentHtml: content, bodyClass: "blog-page", activeSection: "writing", description: BLOG_INDEX_DESCRIPTION, canonicalUrl: absoluteUrl(siteUrl, "/blog/"), ogTitle: `Writing · ${siteTitle}`, ogDescription: BLOG_INDEX_DESCRIPTION, pageSchemaType: "CollectionPage" });
}

function renderBlogPostPage({ siteTitle, siteUrl = DEFAULT_SITE_URL, post, section, blogContentHtml, blogManifest }) {
  const orderedPosts = blogManifest.sections
    .flatMap((group) => group.posts || [])
    .sort((a, b) => String(b.publishedAt || "").localeCompare(String(a.publishedAt || "")) || a.title.localeCompare(b.title));
  const postIndex = orderedPosts.findIndex((candidate) => candidate.slug === post.slug);
  const newerPost = postIndex > 0 ? orderedPosts[postIndex - 1] : null;
  const olderPost = postIndex >= 0 && postIndex < orderedPosts.length - 1 ? orderedPosts[postIndex + 1] : null;
  const navHtml = (newerPost || olderPost) ? `<nav class="blog-post-nav" aria-label="Writing by date">${newerPost ? `<a href="/blog/${escapeHtml(newerPost.slug)}/"><span>Newer</span><br>${escapeHtml(newerPost.title)}</a>` : "<span></span>"}${olderPost ? `<a href="/blog/${escapeHtml(olderPost.slug)}/"><span>Older</span><br>${escapeHtml(olderPost.title)}</a>` : "<span></span>"}</nav>` : "";
  const description =
    typeof post.description === "string" && post.description.trim() !== ""
      ? post.description.trim()
      : `${post.title} from ${section} on ${siteTitle}.`;
  const socialPreview =
    typeof post.socialPreview === "string" && post.socialPreview.trim() !== ""
      ? post.socialPreview.trim()
      : description;
  const canonicalUrl = absoluteUrl(siteUrl, `/blog/${post.slug}/`);
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl);
  const socialImageUrl = absoluteUrl(siteUrl, SOCIAL_PREVIEW_IMAGE_PATH);
  const publishedAt = typeof post.publishedAt === "string" ? post.publishedAt.trim() : "";
  const updatedAt = typeof post.updatedAt === "string" && post.updatedAt.trim() !== ""
    ? post.updatedAt.trim()
    : publishedAt;
  const blogTags = Array.isArray(post.tags) ? post.tags.filter((tag) => typeof tag === "string") : [];
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
    "@type": "BlogPosting",
    "@id": `${canonicalUrl}#blogposting`,
    headline: post.title,
    description,
    image: socialImageUrl,
    author: { "@id": `${normalizedSiteUrl}/#person` },
    publisher: { "@id": `${normalizedSiteUrl}/#organization` },
    isPartOf: { "@id": `${normalizedSiteUrl}/#website` },
    mainEntityOfPage: { "@id": `${canonicalUrl}#webpage` },
    url: canonicalUrl,
    ...(publishedAt ? { datePublished: publishedAt } : {}),
    ...(updatedAt ? { dateModified: updatedAt } : {}),
  };
  if (blogTags.length > 0) {
    articleSchema.keywords = blogTags.join(", ");
  }
  const faqSchema = faqItems.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
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
    <div class="blog-reading-panel">
      ${renderBreadcrumb([{ name: "Writing", href: "/blog/" }, { name: post.title, href: `/blog/${post.slug}/` }])}
      <header class="blog-post-header">
        <h1>${escapeHtml(post.title)}</h1>
        <dl class="post-properties">
          ${publishedAt ? `<div><dt>Published</dt><dd><time datetime="${escapeHtml(publishedAt)}">${escapeHtml(publishedAt)}</time></dd></div>` : ""}
          ${updatedAt && updatedAt !== publishedAt ? `<div><dt>Updated</dt><dd><time datetime="${escapeHtml(updatedAt)}">${escapeHtml(updatedAt)}</time></dd></div>` : ""}
          <div><dt>Section</dt><dd>${escapeHtml(section)}</dd></div>
          ${blogTags.length ? `<div><dt>Tags</dt><dd>${renderBlogTagLinks(blogTags, "Post topics")}</dd></div>` : ""}
        </dl>
        <div class="blog-post-meta-actions">
          <button class="blog-share-button copy-action" type="button" data-share-url="${escapeHtml(canonicalUrl)}" data-analytics-event="copy_share_link_click">Copy link</button>
          <span class="copy-status" aria-live="polite" data-share-status></span>
        </div>
      </header>
      ${blogContentHtml}
      <p class="blog-correction-note">Corrections and clarifications for this post are tracked through the <a href="/errata/">errata page</a>.</p>
      ${navHtml}
      <a class="blog-back" href="/blog/">&larr; All writing</a>
    </div>
    <script>
      (() => {
        const button = document.querySelector("[data-share-url]");
        if (!button) {
          return;
        }
        const status = document.querySelector("[data-share-status]");
        button.addEventListener("click", async () => {
          const shareUrl = button.dataset.shareUrl || window.location.href;
          try {
            if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("Clipboard unavailable");
            await navigator.clipboard.writeText(shareUrl);
            status.textContent = "Link copied.";
          } catch (error) {
            status.textContent = "Copy failed. Copy the address from your browser.";
          }
        });
      })();
    </script>
  `;

  return renderLayout({
    pageTitle: `${post.title} · Writing · ${siteTitle}`,
    siteTitle,
    contentHtml: content,
    bodyClass: "blog-page blog-post-page",
    activeSection: "writing",
    includeMath: /\\\(|\\\[/u.test(blogContentHtml),
    description,
    canonicalUrl,
    ogTitle: `${post.title} · Writing · ${siteTitle}`,
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
  renderNotesIndexPage,
  renderNotFoundPage,
  renderPersonalPage,
  renderProjectPage,
  renderProjectsIndexPage,
  renderTopicPage,
};
