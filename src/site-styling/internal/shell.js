"use strict";

const DEFAULT_SITE_URL = "https://notes.praneeth-suresh-s.workers.dev";
const HOME_DESCRIPTION = "A collection of Praneeth Suresh's computer science notes, writings, research reading, and projects across AI research, algorithms, systems, and software engineering.";
const BLOG_INDEX_DESCRIPTION = "Stories, project notes, and AI research reflections from Computer Science Notes.";
const START_HERE_DESCRIPTION = "A guided first path through Computer Science Notes: start with AI research, read one paper-backed essay, and subscribe by RSS.";
const RESEARCH_TASTE_DESCRIPTION = "A public research taste list for Computer Science Notes: AI research topics, why they matter, selected essays, and source trails.";
const ERRATA_DESCRIPTION = "Public corrections and clarification policy for Computer Science Notes.";
const SUBSCRIBE_DESCRIPTION = "Subscribe for monthly AI research and project updates from Computer Science Notes by email request or RSS.";
const PROJECTS_DESCRIPTION = "Selected projects from Praneeth Suresh across static knowledge systems, AI engineering, research notebooks, and agentic tooling.";
const CONTACT_DESCRIPTION = "Contact Praneeth Suresh about research, internships, consulting, NUS AI Society collaboration, and technical projects.";
const COLLABORATE_DESCRIPTION = "Collaboration and consulting route for research, AI engineering, project work, and NUS AI Society opportunities.";
const SOCIAL_PREVIEW_IMAGE_PATH = "/assets/social/theoretical-cs-preview.svg";
const SOCIAL_PREVIEW_IMAGE_ALT = "AI Research, from papers to mechanisms.";
const FLAGSHIP_ESSAY_PATH = "/blog/tracing-the-mental-models-of-deep-learning-lessons-from-foundational-papers/";
const FLAGSHIP_ESSAY_TITLE = "The mental models of deep learning";
const PUBLIC_CONTACT_EMAIL = "praneeth.suresh.s@gmail.com";
const PUBLIC_GITHUB_URL = "https://github.com/Praneeth-Suresh";
const PUBLIC_LINKEDIN_URL = "https://www.linkedin.com/in/praneeth-suresh-a114aa250/";
const SUBSCRIBE_MAILTO = `mailto:${PUBLIC_CONTACT_EMAIL}?subject=Subscribe%20to%20monthly%20AI%20research%20and%20project%20updates`;

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
          <a href="/projects/">Projects</a>
          <a href="/blog/">Blog</a>
          <a href="/about/">Portfolio</a>
          <a href="/contact/">Contact</a>
          <a href="/collaborate/">Collaborate</a>
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
      email: `mailto:${PUBLIC_CONTACT_EMAIL}`,
      sameAs: [PUBLIC_GITHUB_URL, PUBLIC_LINKEDIN_URL],
      jobTitle: "Software engineer and AI developer/researcher",
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
          urlTemplate: `${siteUrl}/?q={search_term_string}#topic-search`,
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
  };
}

function composeStructuredData({
  siteTitle,
  pageTitle,
  description,
  canonicalUrl,
  pageSchemaType,
  structuredData,
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
    }),
    ...normalizeStructuredDataItems(structuredData),
  ];
}

function renderSubscribePanel({ source = "site", compact = false } = {}) {
  const className = compact ? "subscribe-panel subscribe-panel-compact" : "subscribe-panel";

  return `
    <section id="subscribe-${escapeHtml(source)}" class="${className}" aria-labelledby="subscribe-title-${escapeHtml(source)}">
      <div>
        <p class="section-kicker">/ Subscribe</p>
        <h2 id="subscribe-title-${escapeHtml(source)}">Subscribe for monthly AI research/project updates.</h2>
          <p>One rigorous AI research or project update every 3-4 weeks, with paper trails, mechanisms, experiments, and implementation tradeoffs in one place.</p>
      </div>
      <div class="subscribe-actions" aria-label="Subscription actions">
        <a class="primary-action" href="${escapeHtml(SUBSCRIBE_MAILTO)}" data-analytics-event="email_subscribe_click" data-subscribe-source="${escapeHtml(source)}">Subscribe by email</a>
        <a class="secondary-action" href="/subscribe/" data-analytics-event="newsletter_cta_click" data-subscribe-source="${escapeHtml(source)}">Subscription options</a>
        <a class="secondary-action" href="/feed.xml" data-analytics-event="rss_click" data-subscribe-source="${escapeHtml(source)}">Subscribe by RSS</a>
      </div>
    </section>
  `;
}

function renderContactCtaPanel({ source = "site" } = {}) {
  return `
    <section class="panel portfolio-section" aria-labelledby="contact-cta-title-${escapeHtml(source)}">
      <div class="portfolio-section-header">
        <p class="section-kicker">/ Contact</p>
        <h2 id="contact-cta-title-${escapeHtml(source)}" class="section-title">Contact me about research, internships, consulting, or NUS AI Society collaboration.</h2>
      </div>
      <div class="portfolio-philosophy-grid">
        <p>Useful messages usually start from a specific overlap: a paper, project, team, startup problem, internship role, workshop, sponsor idea, or AI Society collaboration.</p>
        <p>Calendly is intentionally omitted until availability can be honored reliably.</p>
      </div>
      <div class="home-actions" aria-label="Contact actions">
        <a class="primary-action" href="mailto:${escapeHtml(PUBLIC_CONTACT_EMAIL)}" data-analytics-event="email_contact_click" data-contact-source="${escapeHtml(source)}">Email me</a>
        <a class="secondary-action" href="/contact/">Contact page</a>
        <a class="secondary-action" href="/collaborate/">Collaborate</a>
      </div>
    </section>
  `;
}

function renderLayout({
  pageTitle,
  siteTitle,
  contentHtml,
  bodyClass = "",
  includeHomeShowcaseMotion = false,
  description,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogType,
  socialImageUrl,
  socialImageAlt,
  structuredData,
  pageSchemaType,
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
  });
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
    structuredData: composedStructuredData,
  });
  const homeShowcaseMotionScript = includeHomeShowcaseMotion
    ? `
    <script>
      (() => {
        function initHomeShowcaseMotion() {
          const root = document.querySelector(".home-showcase");
          if (!root) {
            return;
          }

          const sections = Array.from(root.querySelectorAll(".home-showcase-section"));
          const railLinks = Array.from(root.querySelectorAll(".home-showcase-rail a"));
          if (sections.length === 0) {
            return;
          }

          const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
          const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
          const palettes = sections.map((section) => ({
            background: section.dataset.motionBg || "#05060a",
            next: section.dataset.motionNext || section.dataset.motionBg || "#05060a",
          }));
          let ticking = false;

          function setActiveSection(activeIndex) {
            const activeSection = sections[activeIndex] || sections[0];
            root.dataset.activeSection = activeSection.id || "";
            sections.forEach((section, index) => {
              section.classList.toggle("is-active", index === activeIndex);
            });
            railLinks.forEach((link, index) => {
              const isActive = index === activeIndex;
              link.classList.toggle("is-active", isActive);
              if (isActive) {
                link.setAttribute("aria-current", "true");
              } else {
                link.removeAttribute("aria-current");
              }
            });
          }

          function updateMotionState() {
            ticking = false;
            const viewportHeight = window.innerHeight || 1;
            let activeIndex = 0;
            let activeVisibility = -1;

            sections.forEach((section, index) => {
              const rect = section.getBoundingClientRect();
              const rawProgress = (viewportHeight * 0.72 - rect.top) / (rect.height + viewportHeight * 0.28);
              const progress = clamp(rawProgress, 0, 1);
              const presence = 1 - clamp(Math.abs(progress - 0.54) / 0.54, 0, 1);
              const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
              const direction = index % 2 === 0 ? -1 : 1;
              const drift = (progress - 0.5) * direction;
              const entry = clamp((0.34 - progress) / 0.34, 0, 1);
              const exit = clamp((progress - 0.66) / 0.34, 0, 1);
              const laneShift = (entry * 78 - exit * 78).toFixed(1) + "px";
              const cardsTravel = (drift * 172).toFixed(1) + "px";
              const cardsAltTravel = (drift * -132).toFixed(1) + "px";
              const visualTravel = (drift * -156).toFixed(1) + "px";
              const visualDepth = (Math.sin(progress * Math.PI) * 42).toFixed(1) + "px";
              const cardLift = (Math.sin(progress * Math.PI) * -54).toFixed(1) + "px";
              const cardSwing = (drift * -8).toFixed(2) + "deg";

              section.style.setProperty("--section-progress", progress.toFixed(3));
              section.style.setProperty("--section-presence", presence.toFixed(3));
              section.style.setProperty("--section-offset", laneShift);
              section.style.setProperty("--stage-pin-offset", laneShift);
              section.style.setProperty("--copy-drift", laneShift);
              section.style.setProperty("--card-drift", cardsTravel);
              section.style.setProperty("--card-drift-alt", cardsAltTravel);
              section.style.setProperty("--card-lift", cardLift);
              section.style.setProperty("--card-swing", cardSwing);
              section.style.setProperty("--visual-drift-x", visualTravel);
              section.style.setProperty("--visual-drift-y", "0px");
              section.style.setProperty("--visual-depth", visualDepth);
              section.style.setProperty("--visual-offset", "0px");
              section.style.setProperty("--visual-scale", (0.94 + Math.sin(progress * Math.PI) * 0.09).toFixed(3));
              section.style.setProperty("--line-offset", (220 - progress * 220).toFixed(1));
              section.style.setProperty("--band-offset", ((progress - 0.5) * 140).toFixed(1) + "px");

              if (visibleHeight > activeVisibility) {
                activeVisibility = visibleHeight;
                activeIndex = index;
              }
            });

            const activePalette = palettes[activeIndex] || palettes[0];
            const activeSection = sections[activeIndex] || sections[0];
            const activeProgress = Number.parseFloat(activeSection.style.getPropertyValue("--section-progress")) || 0;
            const bgMix = clamp((activeProgress - 0.58) / 0.34, 0, 1);
            root.style.setProperty("--showcase-bg-current", activePalette.background);
            root.style.setProperty("--showcase-bg-next", activePalette.next);
            root.style.setProperty("--showcase-bg-mix", bgMix.toFixed(3));
            setActiveSection(activeIndex);
          }

          function requestMotionUpdate() {
            if (ticking) {
              return;
            }
            ticking = true;
            window.requestAnimationFrame(updateMotionState);
          }

          if (reduceMotion.matches) {
            root.classList.add("home-showcase-motion-reduced");
            root.style.setProperty("--showcase-bg-current", palettes[0].background);
            root.style.setProperty("--showcase-bg-next", palettes[0].next);
            root.style.setProperty("--showcase-bg-mix", "0");
            setActiveSection(0);
            return;
          }

          root.classList.add("home-showcase-motion");
          window.addEventListener("scroll", requestMotionUpdate, { passive: true });
          window.addEventListener("resize", requestMotionUpdate, { passive: true });
          requestMotionUpdate();
        }

        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", initHomeShowcaseMotion, { once: true });
        } else {
          initHomeShowcaseMotion();
        }
      })();
    </script>`
    : "";

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
        <a class="brand-link" href="/" data-hotkey="H" aria-label="${escapeHtml(siteTitle)} home">Home</a>
        <nav class="site-links" aria-label="Site navigation">
          <a href="/start-here/" data-hotkey="S">Start</a>
          <a href="/about/" data-hotkey="A">About</a>
          <a href="/projects/" data-hotkey="P">Projects</a>
          <a href="/#main-content" data-hotkey="N">Notes</a>
          <a href="/blog/" data-hotkey="B">Blog</a>
          <a href="/contact/" data-hotkey="C">Contact</a>
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
          if (hotkey === "/") {
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
    </script>${homeShowcaseMotionScript}
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

const DEFAULT_PROJECTS_DATA = {
  projects: [
    {
      slug: "computer-science-notes",
      title: "Computer Science Notes",
      status: "active flagship",
      summary:
        "Static technical hub with Notion ingestion, route generation, search, RSS, and formatting fidelity checks.",
      problem:
        "Technical notes need durable navigation, search, sharing metadata, and formatting fidelity to become useful public proof.",
      method:
        "Build-time Notion ingestion and static route generation keep the deployed site fast, inspectable, and Cloudflare Pages compatible.",
      result:
        "The site publishes topic hierarchies, child pages, blog posts, RSS, sitemap, MathJax-backed LaTeX, code blocks, and deterministic checks.",
      codeUrl: "https://github.com/Praneeth-Suresh/Notes",
      writeupUrl: "/topics/agent-coding/the-design-concept/",
      tags: ["static-site", "notion", "search"],
    },
  ],
};

function normalizeProject(project) {
  if (!project || typeof project !== "object") {
    return null;
  }

  const slug = typeof project.slug === "string" ? project.slug.trim() : "";
  const title = typeof project.title === "string" ? project.title.trim() : "";
  if (!/^[a-z0-9-]+$/u.test(slug) || title === "") {
    return null;
  }

  return {
    slug,
    title,
    status: typeof project.status === "string" ? project.status.trim() : "active",
    summary: typeof project.summary === "string" ? project.summary.trim() : "",
    problem: typeof project.problem === "string" ? project.problem.trim() : "",
    method: typeof project.method === "string" ? project.method.trim() : "",
    result: typeof project.result === "string" ? project.result.trim() : "",
    codeUrl: typeof project.codeUrl === "string" ? project.codeUrl.trim() : "",
    writeupUrl: typeof project.writeupUrl === "string" ? project.writeupUrl.trim() : "",
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

function renderProjectTagList(tags) {
  return renderTagList(tags, "Project tags");
}

function renderProjectCard(project, index) {
  return `<a class="portfolio-project" href="/projects/${escapeHtml(project.slug)}/" data-index="${String(index + 1).padStart(2, "0")}">
  <span class="portfolio-project-kind">${escapeHtml(project.status)}</span>
  <h3>${escapeHtml(project.title)}</h3>
  <p>${escapeHtml(project.summary)}</p>
</a>`;
}

function renderRouteFigure(kind) {
  const variant = kind === "contact" ? "contact" : "projects";
  const label = variant === "contact" ? "[ Fig. C ]" : "[ Fig. P ]";
  return `<div class="route-figure route-figure-${variant}" aria-hidden="true">
  <span class="route-figure-label">${label}</span>
  <span class="route-figure-grid"></span>
  <span class="route-figure-orbit"></span>
</div>`;
}

function renderHomeVisual(kind) {
  const variants = {
    hero: {
      label: "START",
      accent: "#635bff",
      secondary: "#00d4ff",
      path: "M86 224 C164 128 244 104 326 162 S482 258 574 114",
      nodes: [
        [94, 224, "notes"],
        [212, 130, "proof"],
        [338, 164, "read"],
        [470, 244, "build"],
        [574, 114, "ship"],
      ],
    },
    research: {
      label: "RESEARCH",
      accent: "#00d4ff",
      secondary: "#635bff",
      path: "M74 206 C158 70 256 270 340 132 S498 82 596 218",
      nodes: [
        [74, 206, "paper"],
        [214, 108, "model"],
        [340, 132, "test"],
        [470, 102, "trace"],
        [596, 218, "write"],
      ],
    },
    projects: {
      label: "PROJECTS",
      accent: "#ff7a1a",
      secondary: "#ffd166",
      path: "M88 118 C176 246 248 74 338 178 S492 294 584 116",
      nodes: [
        [88, 118, "repo"],
        [214, 230, "eval"],
        [338, 178, "api"],
        [468, 278, "ux"],
        [584, 116, "case"],
      ],
    },
    writing: {
      label: "WRITING",
      accent: "#00a66f",
      secondary: "#9db7ff",
      path: "M82 246 C166 184 218 94 326 132 S468 258 584 168",
      nodes: [
        [82, 246, "draft"],
        [196, 174, "cite"],
        [326, 132, "arg"],
        [462, 238, "edit"],
        [584, 168, "essay"],
      ],
    },
    contact: {
      label: "CONTACT",
      accent: "#00a66f",
      secondary: "#00d4ff",
      path: "M90 230 C170 86 262 248 350 126 S496 82 582 232",
      nodes: [
        [90, 230, "fit"],
        [218, 112, "role"],
        [350, 126, "mail"],
        [482, 96, "meet"],
        [582, 232, "go"],
      ],
    },
  };
  const visual = variants[kind] || variants.hero;
  const nodes = visual.nodes
    .map(
      ([x, y, label]) => `<g class="home-visual-node">
  <rect x="${x - 31}" y="${y - 18}" width="62" height="36" rx="0"></rect>
  <text x="${x}" y="${y + 4}" text-anchor="middle">${escapeHtml(label)}</text>
</g>`,
    )
    .join("");

  return `<div class="home-visual home-visual-${kind}" aria-hidden="true">
  <svg viewBox="0 0 660 360" role="presentation" focusable="false">
    <defs>
      <linearGradient id="home-${kind}-line" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${visual.accent}" stop-opacity="0.96" />
        <stop offset="100%" stop-color="${visual.secondary}" stop-opacity="0.72" />
      </linearGradient>
      <pattern id="home-${kind}-grid" width="28" height="28" patternUnits="userSpaceOnUse">
        <path d="M 28 0 L 0 0 0 28" fill="none" stroke="currentColor" stroke-opacity="0.09" stroke-width="1" />
      </pattern>
    </defs>
    <rect class="home-visual-base" x="1" y="1" width="658" height="358"></rect>
    <rect class="home-visual-grid" x="36" y="30" width="588" height="300" fill="url(#home-${kind}-grid)"></rect>
    <path class="home-visual-plane" d="M66 296 L598 296 L534 64 L128 64 Z"></path>
    <path class="home-visual-thread" d="${visual.path}" stroke="url(#home-${kind}-line)"></path>
    <path class="home-visual-thread home-visual-thread-alt" d="M82 92 C194 144 260 50 352 98 S502 202 588 84"></path>
    <text class="home-visual-label" x="58" y="56">${visual.label}</text>
    ${nodes}
  </svg>
</div>`;
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
    pageSchemaType: topic.parentTitle ? "TechArticle" : "CollectionPage",
    structuredData: createBreadcrumbSchema(breadcrumbItems),
  });
}

function renderHomePage({ siteTitle, siteUrl = DEFAULT_SITE_URL, topics, searchEntries = [], projectsData = DEFAULT_PROJECTS_DATA }) {
  const topicCount = topics.length;
  const topicWord = topicCount === 1 ? "topic" : "topics";
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
  const exploreCards = [
    {
      index: "01",
      title: "Notes by topic",
      description: "Browse organized computer science notes across algorithms, systems, AI engineering, software engineering, and agent-building.",
      href: "#main-content",
    },
    {
      index: "02",
      title: "Essays and research notes",
      description: "Read longer-form writing about AI research, interpretability, deep learning, projects, and technical thinking.",
      href: "/blog/",
    },
    {
      index: "03",
      title: "AI research trail",
      description: "Follow the papers and questions shaping my current research taste.",
      href: "/research-taste/",
    },
    {
      index: "04",
      title: "Projects",
      description: "See selected software, AI, and systems work behind the notes.",
      href: "/projects/",
    },
    {
      index: "05",
      title: "Portfolio",
      description: "Inspect the author, research taste, leadership, and professional context behind the site.",
      href: "/about/",
    },
    {
      index: "06",
      title: "Start here",
      description: "Use a guided path if you want a first route through the site.",
      href: "/start-here/",
    },
  ]
    .map(
      (card) => `<a class="topic-card" href="${escapeHtml(card.href)}" data-index="${card.index}">
  <h3 class="topic-card-title">${escapeHtml(card.title)}</h3>
  <p class="topic-card-description">${escapeHtml(card.description)}</p>
</a>`,
    )
    .join("");
  const selectedProjects = getProjectItems(projectsData)
    .slice(0, 3)
    .map(
      (project, index) => `<a class="topic-card" href="/projects/${escapeHtml(project.slug)}/" data-index="${String(index + 1).padStart(2, "0")}">
  <h3 class="topic-card-title">${escapeHtml(project.title)}</h3>
  <p class="topic-card-description">${escapeHtml(project.summary)}</p>
</a>`,
    )
    .join("");
  const selectedWriting = [
    {
      index: "01",
      title: "The mental models of deep learning",
      description: "A paper-backed AI research trail through universal approximation, CNNs, transformers, and deep RL.",
      href: FLAGSHIP_ESSAY_PATH,
    },
    {
      index: "02",
      title: "NP-Completeness: formal definitions and reductions",
      description: "A proof-backed algorithms essay about hardness evidence and how reductions change design targets.",
      href: "/blog/np-completeness-formal-definition-proof-sketches-and-reductions/",
    },
    {
      index: "03",
      title: "Peeking inside the black box",
      description: "Interpretability notes that connect AI research reading to practical model-inspection questions.",
      href: "/blog/peeking-inside-the-black-box/",
    },
  ]
    .map(
      (card) => `<a class="topic-card" href="${escapeHtml(card.href)}" data-index="${card.index}">
  <h3 class="topic-card-title">${escapeHtml(card.title)}</h3>
  <p class="topic-card-description">${escapeHtml(card.description)}</p>
</a>`,
    )
    .join("");
  const currentAsks = [
    "Research conversations around interpretability, model evaluation, representation analysis, memory, routing, and agent reliability.",
    "AI engineering internship paths where rigorous ML systems, tooling, and evaluation matter.",
    "Consulting or prototype work for founders who need fast, inspectable AI engineering execution.",
    "NUS AI Society collaboration, speakers, workshops, sponsors, and technically serious community projects.",
  ]
    .map((ask) => `<li class="ask-item">${escapeHtml(ask)}</li>`)
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
    <div class="home-showcase" data-home-motion="ready" data-active-section="home-start">
      <nav class="home-showcase-rail" aria-label="Homepage sections">
        <a href="#home-start">01</a>
        <a href="#home-research">02</a>
        <a href="#home-projects">03</a>
        <a href="#home-writing">04</a>
        <a href="#home-contact">05</a>
      </nav>
      <section id="home-start" class="home-showcase-section home-showcase-hero" aria-labelledby="home-title" data-motion-bg="#05060a" data-motion-next="#0b1220">
        <div class="home-showcase-copy">
          <p class="home-kicker">[ Computer Science Notes ]</p>
          <h1 id="home-title" class="home-title" aria-label="Theoretical CS: No Handwaving Allowed"><span>Theoretical CS:</span><span>No Handwaving</span><span>Allowed</span></h1>
          <p class="home-intro">A collection of my work across computer science: notes from what I study, essays about ideas I am working through, research reading in AI, and projects that turn those ideas into systems.</p>
          <div class="home-actions" aria-label="Primary actions">
            <a class="primary-action" href="#main-content">Explore notes</a>
            <a class="secondary-action" href="/start-here/" data-hotkey="S">Start here</a>
            <a class="secondary-action" href="/blog/">Read writings</a>
            <a class="secondary-action" href="/research-taste/">AI research trail</a>
            <a class="secondary-action" href="/projects/" data-hotkey="P">Projects</a>
            <a class="secondary-action" href="/about/" data-hotkey="A">Portfolio</a>
            <a class="secondary-action" href="#topic-search" data-hotkey="/">Search notes</a>
          </div>
        </div>
        ${renderHomeVisual("hero")}
        <div class="home-explore-band" aria-labelledby="home-explore-title">
          <div>
            <p class="section-kicker">/ Start exploring</p>
            <h2 id="home-explore-title" class="section-title">Pick a doorway</h2>
          </div>
          <div class="topic-grid">${exploreCards}</div>
        </div>
      </section>
      <section id="home-research" class="home-showcase-section home-showcase-research" aria-labelledby="home-research-title" data-motion-bg="#0b1220" data-motion-next="#10231e">
        <div class="home-showcase-copy">
          <p class="section-kicker">/ Research</p>
          <h2 id="home-research-title" class="section-title">Read my best technical write-ups.</h2>
          <a class="topic-index-link" href="/blog/">Read all writing</a>
        </div>
        ${renderHomeVisual("research")}
        <div class="home-showcase-cards topic-grid">${selectedWriting}</div>
      </section>
      <section id="home-projects" class="home-showcase-section home-showcase-projects" aria-labelledby="home-projects-title" data-motion-bg="#10231e" data-motion-next="#f1efe7">
        <div class="home-showcase-copy">
          <p class="section-kicker">/ Selected projects</p>
          <h2 id="home-projects-title" class="section-title">See the work, not just the archive.</h2>
          <a class="topic-index-link" href="/projects/">See my projects</a>
        </div>
        ${renderHomeVisual("projects")}
        <div class="home-showcase-cards topic-grid">${selectedProjects}</div>
      </section>
      <section id="home-writing" class="home-showcase-section home-showcase-writing" aria-labelledby="home-writing-title" data-motion-bg="#f1efe7" data-motion-next="#e9eef5">
        <div class="home-showcase-copy">
          <p class="section-kicker">/ Selected writing</p>
          <h2 id="home-writing-title" class="section-title">Read my best technical write-ups.</h2>
          <a class="topic-index-link" href="/blog/">Read all writing</a>
        </div>
        ${renderHomeVisual("writing")}
        <div class="home-showcase-cards topic-grid">${selectedWriting}</div>
      </section>
      <section id="home-contact" class="home-showcase-section home-showcase-contact" aria-labelledby="home-asks-title" data-motion-bg="#0f1115" data-motion-next="#05060a">
        <div class="home-showcase-copy">
          <p class="section-kicker">/ Current asks</p>
          <h2 id="home-asks-title" class="section-title">Contact me about research, internships, consulting, or NUS AI Society collaboration.</h2>
          <div class="home-actions" aria-label="Current ask actions">
            <a class="primary-action" href="/contact/">Contact me</a>
            <a class="secondary-action" href="/collaborate/">Collaborate</a>
          </div>
        </div>
        ${renderHomeVisual("contact")}
        <div class="portfolio-philosophy-grid">
          <ul class="ask-list">${currentAsks}</ul>
          <p>Best next step: start from a specific overlap, link, paper, project, team, or event idea. The site is designed to make that context quick to inspect.</p>
        </div>
        ${renderSubscribePanel({ source: "home" })}
      </section>
    </div>
    <section id="main-content" class="panel topic-hub" aria-labelledby="topics-title">
      <div class="topic-hub-header">
        <div>
          <p class="section-kicker">/ Notes</p>
          <h2 id="topics-title" class="section-title">Browse by topic</h2>
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
    includeHomeShowcaseMotion: true,
    description: HOME_DESCRIPTION,
    canonicalUrl: absoluteUrl(siteUrl, "/"),
    ogTitle: `Theoretical CS: No Handwaving Allowed · ${siteTitle}`,
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
      <a class="active" href="/start-here/" data-hotkey="S" aria-current="page">Start here</a>
      <a href="/#main-content" data-hotkey="N">Notes</a>
      <a href="/blog/" data-hotkey="B">Blog</a>
    </nav>
    <section id="main-content" class="start-hero" aria-labelledby="start-title">
      <p class="home-kicker">[ Start here ]</p>
      <h1 id="start-title">A first path through the notes.</h1>
      <p>Use this route if you are new to the site and want the AI research thread before browsing the full corpus.</p>
    </section>
    <section class="start-path" aria-label="First reading path">
      <a class="start-step" href="/research-taste/">
        <span>01</span>
        <h2>Start with the AI research trail</h2>
        <p>See the paper map behind the site: deep learning foundations, interpretability, reinforcement learning, agents, routing, and efficient inference.</p>
      </a>
      <a class="start-step" href="${FLAGSHIP_ESSAY_PATH}">
        <span>02</span>
        <h2>Read one paper-backed essay</h2>
        <p>${FLAGSHIP_ESSAY_TITLE} is the entry point into the research style this site rewards.</p>
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
        .filter((source) => source.label !== "" && (/^https?:\/\//u.test(source.href) || source.href.startsWith("/")))
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
      <a href="/start-here/" data-hotkey="S">Start here</a>
      <a class="active" href="/research-taste/" aria-current="page">Research taste</a>
      <a href="/#main-content" data-hotkey="N">Notes</a>
      <a href="/blog/" data-hotkey="B">Blog</a>
    </nav>
    <section id="main-content" class="research-hero" aria-labelledby="research-title">
      <p class="home-kicker">[ Research taste ]</p>
      <h1 id="research-title">Research taste</h1>
      <p>This is the public source trail behind future AI research notes: problems, methods, selected essays, and papers that shape what gets studied next.</p>
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
    pageSchemaType: "CollectionPage",
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
      <p>Start with the current flagship essay: <a href="${FLAGSHIP_ESSAY_PATH}">${FLAGSHIP_ESSAY_TITLE}</a>.</p>
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
      <p>Monthly AI research and project updates, with RSS available now.</p>
    </section>
    <section class="subscribe-route" aria-labelledby="subscribe-route-title">
      <div>
        <p class="section-kicker">/ Owned channel</p>
        <h2 id="subscribe-route-title">Subscribe for monthly AI research/project updates.</h2>
        <p>Email provider automation is still intentionally simple: send a subscribe request by email, or use RSS as the instant self-serve feed for notes, flagship essays, and future deep dives.</p>
      </div>
      <div class="subscribe-route-actions" aria-label="Subscribe page actions">
        <a class="primary-action" href="${escapeHtml(SUBSCRIBE_MAILTO)}" data-analytics-event="email_subscribe_click" data-subscribe-source="subscribe-page">Subscribe by email</a>
        <a class="secondary-action" href="/feed.xml" data-analytics-event="rss_click" data-subscribe-source="subscribe-page">Subscribe by RSS</a>
        <a class="secondary-action" href="/start-here/">Start here</a>
        <a class="secondary-action" href="${FLAGSHIP_ESSAY_PATH}">Read the flagship essay</a>
      </div>
    </section>
    <section class="subscribe-route-details" aria-labelledby="subscribe-route-details-title">
      <h2 id="subscribe-route-details-title">What you get</h2>
      <ul>
        <li>Paper-backed AI research essays with source trails, mechanisms, experiments, and open questions.</li>
        <li>Project updates across AI engineering, agents, algorithms, systems, and software engineering.</li>
        <li>A low-noise cadence built around one substantial monthly update.</li>
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

function renderProjectsIndexPage({ siteTitle, siteUrl = DEFAULT_SITE_URL, projectsData = DEFAULT_PROJECTS_DATA }) {
  const projects = getProjectItems(projectsData);
  const projectCards = projects.map((project, index) => renderProjectCard(project, index)).join("");
  const content = `
    <section id="main-content" class="start-hero" aria-labelledby="projects-title">
      <p class="home-kicker">[ Projects ]</p>
      <h1 id="projects-title">Selected projects</h1>
      <p>Inspectable project case studies: problem, method, result, code, write-up, and status.</p>
    </section>
    <section class="panel portfolio-section" aria-labelledby="projects-route-title">
      <div class="route-proof-layout">
        <div class="portfolio-section-header">
          <p class="section-kicker">/ Proof assets</p>
          <h2 id="projects-route-title" class="section-title">A small number of strong projects beats a wall of repositories.</h2>
        </div>
        ${renderRouteFigure("projects")}
      </div>
      <div class="portfolio-project-grid">${projectCards}</div>
    </section>
    ${renderContactCtaPanel({ source: "projects-index" })}
  `;

  return renderLayout({
    pageTitle: `Projects · ${siteTitle}`,
    siteTitle,
    contentHtml: content,
    bodyClass: "portfolio-page utility-page",
    description: PROJECTS_DESCRIPTION,
    canonicalUrl: absoluteUrl(siteUrl, "/projects/"),
    ogTitle: `Projects · ${siteTitle}`,
    ogDescription: PROJECTS_DESCRIPTION,
    pageSchemaType: "CollectionPage",
  });
}

function renderProjectPage({ siteTitle, siteUrl = DEFAULT_SITE_URL, project, projectsData = DEFAULT_PROJECTS_DATA }) {
  const normalizedProject = normalizeProject(project) || getProjectItems(projectsData)[0];
  const projects = getProjectItems(projectsData);
  const relatedProjects = projects
    .filter((candidate) => candidate.slug !== normalizedProject.slug)
    .slice(0, 2)
    .map((candidate, index) => renderProjectCard(candidate, index))
    .join("");
  const projectUrlPath = `/projects/${normalizedProject.slug}/`;
  const details = [
    ["Problem", normalizedProject.problem],
    ["Method", normalizedProject.method],
    ["Result", normalizedProject.result],
    ["Status", normalizedProject.status],
  ]
    .map(
      ([label, value]) => `<section class="repo-group" aria-label="${escapeHtml(label)}">
  <h3>${escapeHtml(label)}</h3>
  <p>${escapeHtml(value || "To be documented.")}</p>
</section>`,
    )
    .join("");
  const codeLink = normalizedProject.codeUrl
    ? `<a class="primary-action" href="${escapeHtml(normalizedProject.codeUrl)}">Code</a>`
    : "";
  const writeupLink = normalizedProject.writeupUrl
    ? `<a class="secondary-action" href="${escapeHtml(normalizedProject.writeupUrl)}">Write-up</a>`
    : "";

  const content = `
    <nav class="topic-nav" aria-label="Project navigation">
      <a href="/" data-hotkey="H">Home</a>
      <a href="/projects/" data-hotkey="P">Projects</a>
      <a href="/contact/" data-hotkey="C">Contact</a>
    </nav>
    <section id="main-content" class="start-hero" aria-labelledby="project-title">
      <p class="home-kicker">[ Project ]</p>
      <h1 id="project-title">${escapeHtml(normalizedProject.title)}</h1>
      <p>${escapeHtml(normalizedProject.summary)}</p>
      ${renderProjectTagList(normalizedProject.tags)}
      <div class="home-actions" aria-label="Project actions">
        ${codeLink}
        ${writeupLink}
      </div>
    </section>
    <section class="panel portfolio-section" aria-labelledby="project-case-title">
      <div class="portfolio-section-header">
        <p class="section-kicker">/ Case study</p>
        <h2 id="project-case-title" class="section-title">Problem, method, result, code, write-up, and status.</h2>
      </div>
      <div class="repo-map">${details}</div>
    </section>
    ${renderContactCtaPanel({ source: `project-${normalizedProject.slug}` })}
    ${relatedProjects ? `<section class="panel portfolio-section" aria-labelledby="project-related-title">
      <div class="portfolio-section-header">
        <p class="section-kicker">/ More projects</p>
        <h2 id="project-related-title" class="section-title">Continue inspecting the project trail.</h2>
      </div>
      <div class="portfolio-project-grid">${relatedProjects}</div>
    </section>` : ""}
  `;

  return renderLayout({
    pageTitle: `${normalizedProject.title} · Projects · ${siteTitle}`,
    siteTitle,
    contentHtml: content,
    bodyClass: "portfolio-page utility-page",
    description: normalizedProject.summary || PROJECTS_DESCRIPTION,
    canonicalUrl: absoluteUrl(siteUrl, projectUrlPath),
    ogTitle: `${normalizedProject.title} · Projects · ${siteTitle}`,
    ogDescription: normalizedProject.summary || PROJECTS_DESCRIPTION,
    pageSchemaType: "CreativeWork",
    structuredData: createBreadcrumbSchema([
      { name: "Home", url: absoluteUrl(siteUrl, "/") },
      { name: "Projects", url: absoluteUrl(siteUrl, "/projects/") },
      { name: normalizedProject.title, url: absoluteUrl(siteUrl, projectUrlPath) },
    ]),
  });
}

function renderContactPage({ siteTitle, siteUrl = DEFAULT_SITE_URL }) {
  const content = `
    <section id="main-content" class="start-hero" aria-labelledby="contact-title">
      <p class="home-kicker">[ Contact ]</p>
      <h1 id="contact-title">Contact</h1>
      <p>Prepared contact route for research, internships, consulting, NUS AI Society collaboration, and technical project conversations.</p>
    </section>
    <section class="panel portfolio-section" aria-labelledby="contact-route-title">
      <div class="portfolio-section-header">
        <p class="section-kicker">/ Available channels</p>
        <h2 id="contact-route-title" class="section-title">Start with public professional links.</h2>
      </div>
      <div class="contact-channel-layout">
        ${renderRouteFigure("contact")}
        <div class="portfolio-project-grid">
          <a class="portfolio-project" href="mailto:${escapeHtml(PUBLIC_CONTACT_EMAIL)}" data-analytics-event="email_contact_click" data-contact-source="contact-page" data-index="01">
            <span class="portfolio-project-kind">Direct / Email</span>
            <h3>Email</h3>
            <p>${escapeHtml(PUBLIC_CONTACT_EMAIL)}</p>
          </a>
          <a class="portfolio-project" href="https://github.com/Praneeth-Suresh" data-analytics-event="outbound_github_click" data-index="02">
            <span class="portfolio-project-kind">Code / GitHub</span>
            <h3>GitHub</h3>
            <p>Inspect public repositories and project activity.</p>
          </a>
          <a class="portfolio-project" href="https://www.linkedin.com/in/praneeth-suresh-a114aa250/" data-analytics-event="outbound_linkedin_click" data-index="03">
            <span class="portfolio-project-kind">Professional / LinkedIn</span>
            <h3>LinkedIn</h3>
            <p>Use LinkedIn for professional context, affiliations, and warm outreach.</p>
          </a>
        </div>
      </div>
    </section>
    <section class="panel portfolio-section" aria-labelledby="contact-scope-title">
      <div class="portfolio-section-header">
        <p class="section-kicker">/ Good reasons to reach out</p>
        <h2 id="contact-scope-title" class="section-title">Research, internships, consulting, and AI Society collaboration.</h2>
      </div>
      <div class="repo-map">
        <section class="repo-group" aria-label="Research">
          <h3>Research</h3>
          <p>Interpretability, model evaluation, representation analysis, memory, routing, and agent reliability.</p>
        </section>
        <section class="repo-group" aria-label="Internships">
          <h3>Internships</h3>
          <p>AI engineering, applied ML, developer tools, ML systems, and research-adjacent engineering teams.</p>
        </section>
        <section class="repo-group" aria-label="Consulting">
          <h3>Consulting</h3>
          <p>Prototype work, technical writing, model evaluation, paper implementation, and AI workflow design.</p>
        </section>
        <section class="repo-group" aria-label="NUS AI Society">
          <h3>NUS AI Society</h3>
          <p>Speaker, workshop, sponsor, partner, and community-infrastructure conversations.</p>
        </section>
      </div>
    </section>
  `;

  return renderLayout({
    pageTitle: `Contact · ${siteTitle}`,
    siteTitle,
    contentHtml: content,
    bodyClass: "portfolio-page utility-page",
    description: CONTACT_DESCRIPTION,
    canonicalUrl: absoluteUrl(siteUrl, "/contact/"),
    ogTitle: `Contact · ${siteTitle}`,
    ogDescription: CONTACT_DESCRIPTION,
    pageSchemaType: "ContactPage",
  });
}

function renderCollaboratePage({ siteTitle, siteUrl = DEFAULT_SITE_URL }) {
  const content = `
    <nav class="topic-nav" aria-label="Collaborate navigation">
      <a href="/" data-hotkey="H">Home</a>
      <a href="/projects/" data-hotkey="P">Projects</a>
      <a href="/contact/" data-hotkey="C">Contact</a>
      <a class="active" href="/collaborate/" aria-current="page">Collaborate</a>
    </nav>
    <section id="main-content" class="start-hero" aria-labelledby="collaborate-title">
      <p class="home-kicker">[ Collaborate ]</p>
      <h1 id="collaborate-title">Collaboration and consulting</h1>
      <p>A prepared route for research collaborations, AI engineering prototypes, technical writing, consulting, and NUS AI Society partnership conversations.</p>
    </section>
    <section class="panel portfolio-section" aria-labelledby="collaborate-route-title">
      <div class="portfolio-section-header">
        <p class="section-kicker">/ Prepared route</p>
        <h2 id="collaborate-route-title" class="section-title">Useful collaborations need a specific technical overlap.</h2>
      </div>
      <div class="portfolio-philosophy-grid">
        <p>The collaboration surface will stay narrow: research conversations, internship paths, AI engineering work, flagship project feedback, and AI Society partnerships.</p>
        <p>This keeps the site aligned with the mission: build real professional leverage from rigorous public work instead of broad self-promotion.</p>
      </div>
    </section>
    ${renderContactCtaPanel({ source: "collaborate" })}
  `;

  return renderLayout({
    pageTitle: `Collaborate · ${siteTitle}`,
    siteTitle,
    contentHtml: content,
    bodyClass: "portfolio-page utility-page",
    description: COLLABORATE_DESCRIPTION,
    canonicalUrl: absoluteUrl(siteUrl, "/collaborate/"),
    ogTitle: `Collaborate · ${siteTitle}`,
    ogDescription: COLLABORATE_DESCRIPTION,
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
    <section id="main-content" class="portfolio-hero" aria-labelledby="portfolio-title">
      <div class="portfolio-hero-copy">
        <p class="home-kicker">[ Portfolio ]</p>
        <h1 id="portfolio-title" class="portfolio-title">Praneeth Suresh</h1>
        <p class="portfolio-positioning">I publish rigorous, paper-backed explanations of AI research topics with research-level depth and clear intuition.</p>
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
        <span>NUS CS + Math</span>
        <p>computer science with a second major in mathematics</p>
      </div>
      <div>
        <span>AI + SWE</span>
        <p>research notebooks, apps, agents, and static systems</p>
      </div>
    </section>
    <section class="panel portfolio-section" aria-labelledby="portfolio-credentials">
      <div class="portfolio-section-header">
        <p class="section-kicker">/ Credentials</p>
        <h2 id="portfolio-credentials" class="section-title">Academic and leadership context.</h2>
      </div>
      <div class="repo-map">
        <section class="repo-group" aria-label="Education">
          <h3>Education</h3>
          <p>NUS Computer Science student with a second major in Mathematics and a perfect GPA.</p>
        </section>
        <section class="repo-group" aria-label="Leadership roles">
          <h3>Leadership roles</h3>
          <p>Tech and Research Director of the NUS AI Society, and Tech Director of the residence student committee.</p>
        </section>
        <section class="repo-group" aria-label="Public work">
          <h3>Public work</h3>
          <p>Maintains a public technical site, GitHub project trail, AI research reading path, and selected project case studies.</p>
        </section>
      </div>
    </section>
    <section class="panel portfolio-section" aria-labelledby="portfolio-focus">
      <div class="portfolio-section-header">
        <p class="section-kicker">/ Current focus</p>
        <h2 id="portfolio-focus" class="section-title">Building rigorous ML systems into tools people can inspect, trust, and use.</h2>
      </div>
      <div class="portfolio-philosophy-grid">
        <p>Current interests: interpretability, representation analysis, model evaluation, memory, routing, agent reliability, and the engineering systems around AI research.</p>
        <p>Current opportunities: research collaborations, AI engineering internships, high-signal projects, consulting prototypes, and NUS AI Society collaborations.</p>
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
    ${renderContactCtaPanel({ source: "about" })}
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
    pageSchemaType: "ProfilePage",
  });
}

function renderBlogIndexPage({ siteTitle, siteUrl = DEFAULT_SITE_URL, blogManifest, homeContentHtml }) {
  const toc = blogManifest.sections.map((section) => {
    const posts = section.posts.map((post) => {
      const chapterHtml = post.chapter != null
        ? `<span class="blog-post-chapter">${String(post.chapter).padStart(2, "0")}</span>`
        : `<span class="blog-post-chapter">&bull;</span>`;
      const tags = Array.isArray(post.tags) ? post.tags.filter((tag) => typeof tag === "string") : [];
      const tagText = tags.join(" ");
      const tagHtml = renderTagList(tags, `Tags for ${post.title}`);
      const searchableText = `${section.title} ${section.subtitle || ""} ${post.title} ${post.description || ""} ${tagText}`;
      return `<li class="blog-post-item" data-blog-search="${escapeHtml(searchableText.toLowerCase())}"><a class="blog-post-link" href="/blog/${escapeHtml(post.slug)}/">${chapterHtml}<span class="blog-post-title">${escapeHtml(post.title)}</span></a>${tagHtml}</li>`;
    }).join("");
    return `<div class="blog-section-group" data-blog-section><h3 class="blog-section-heading">${escapeHtml(section.title)}</h3><p class="blog-section-subtitle">${escapeHtml(section.subtitle)}</p><ul class="blog-post-list">${posts}</ul></div>`;
  }).join("");

  const content = `
    <section class="blog-hero">
      <p class="blog-kicker">[ Blog ]</p>
      <h1 class="blog-title">A Developer&rsquo;s Story</h1>
      <p class="blog-subtitle">The thought processes behind the projects.</p>
    </section>
    <div class="blog-home-content" id="main-content">${homeContentHtml}</div>
    <section class="blog-toc" aria-label="Blog search and tagged index">
      <label class="topic-search-label" for="blog-search">Search writing</label>
      <input id="blog-search" class="topic-search" type="search" placeholder="Try interpretability, proofs, project story..." aria-describedby="blog-search-status" />
      <p id="blog-search-status" class="topic-search-status" aria-live="polite">Showing all posts.</p>
      <nav aria-label="Blog table of contents">${toc}</nav>
    </section>
    ${renderSubscribePanel({ source: "blog-index" })}
    <script>
      (() => {
        const input = document.getElementById("blog-search");
        const status = document.getElementById("blog-search-status");
        const items = Array.from(document.querySelectorAll(".blog-post-item"));
        const sections = Array.from(document.querySelectorAll("[data-blog-section]"));

        function update() {
          const query = input.value.trim().toLowerCase();
          let shown = 0;
          for (const item of items) {
            const isMatch = !query || item.dataset.blogSearch.includes(query);
            item.hidden = !isMatch;
            if (isMatch) {
              shown += 1;
            }
          }
          for (const section of sections) {
            const hasVisibleItem = Array.from(section.querySelectorAll(".blog-post-item")).some((item) => !item.hidden);
            section.hidden = !hasVisibleItem;
          }
          status.textContent = query ? \`\${shown} result\${shown === 1 ? "" : "s"} shown.\` : "Showing all posts.";
        }

        input.addEventListener("input", update);
      })();
    </script>
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
    pageSchemaType: "CollectionPage",
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
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl);
  const socialImageUrl = absoluteUrl(siteUrl, SOCIAL_PREVIEW_IMAGE_PATH);
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
    <div class="blog-reading-panel" id="main-content">
      <a class="blog-back" href="/blog/">&larr; All posts</a>
      <header class="blog-post-header">
        <p class="blog-post-section">${escapeHtml(section)}</p>
        <h1>${escapeHtml(post.title)}</h1>
        ${renderTagList(blogTags, "Post tags")}
        <button class="secondary-action blog-share-button" type="button" data-share-url="${escapeHtml(canonicalUrl)}" data-analytics-event="copy_share_link_click">Copy link</button>
      </header>
      ${blogContentHtml}
      ${renderSubscribePanel({ source: "blog-post" })}
      ${navHtml}
    </div>
    <script>
      (() => {
        const button = document.querySelector("[data-share-url]");
        if (!button) {
          return;
        }
        button.addEventListener("click", async () => {
          const shareUrl = button.dataset.shareUrl || window.location.href;
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(shareUrl);
              button.textContent = "Copied";
              return;
            }
          } catch (error) {
            // Keep the visible URL fallback below.
          }
          button.textContent = shareUrl;
        });
      })();
    </script>
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
  renderCollaboratePage,
  renderContactPage,
  renderErrataPage,
  renderHomePage,
  renderPersonalPage,
  renderProjectPage,
  renderProjectsIndexPage,
  renderResearchTastePage,
  renderStartHerePage,
  renderSubscribePage,
  renderTopicPage,
};
