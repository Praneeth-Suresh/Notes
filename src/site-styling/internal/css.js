"use strict";

const SITE_CSS = `
@property --showcase-bg-current {
  syntax: "<color>";
  inherits: true;
  initial-value: #05060a;
}

@property --showcase-bg-next {
  syntax: "<color>";
  inherits: true;
  initial-value: #0b1220;
}

:root {
  color-scheme: light dark;
  --bg: #e8e8e8;
  --surface: #f4f4f2;
  --surface-soft: #deded9;
  --surface-strong: #ffffff;
  --text: #1e1e1e;
  --muted: #646464;
  --faint: #8c8c86;
  --border: #1e1e1e;
  --hairline: rgb(30 30 30 / 0.18);
  --accent: #635bff;
  --accent-strong: #2f2a8d;
  --cyan: #00d4ff;
  --orange: #ff7a1a;
  --green: #00a66f;
  --inline-code-bg: rgb(30 30 30 / 0.07);
  --code-bg: #011627;
  --code-text: #f6f8ff;
  --font-sans: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #151515;
    --surface: #202020;
    --surface-soft: #2b2b2b;
    --surface-strong: #111111;
    --text: #f1f1ed;
    --muted: #b3b3aa;
    --faint: #898982;
    --border: #f1f1ed;
    --hairline: rgb(241 241 237 / 0.2);
    --accent: #9db7ff;
    --accent-strong: #b8c3ff;
    --inline-code-bg: rgb(241 241 237 / 0.09);
    --code-bg: #060b12;
  }
}

* {
  box-sizing: border-box;
}

html {
  max-width: 100%;
  overflow-x: clip;
  scroll-behavior: smooth;
}

body {
  max-width: 100%;
  overflow-x: clip;
  margin: 0;
  font-family: var(--font-sans);
  background:
    radial-gradient(circle at 15% 0%, rgb(99 91 255 / 0.12), transparent 22rem),
    linear-gradient(90deg, rgb(30 30 30 / 0.035) 1px, transparent 1px),
    linear-gradient(180deg, rgb(30 30 30 / 0.035) 1px, transparent 1px),
    var(--bg);
  background-size: auto, 36px 36px, 36px 36px, auto;
  color: var(--text);
  line-height: 1.58;
}

a {
  color: inherit;
}

a:focus-visible,
button:focus-visible,
input:focus-visible,
summary:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.skip-link {
  position: absolute;
  left: 0.75rem;
  top: 0.75rem;
  z-index: 10;
  transform: translateY(-160%);
  background: var(--text);
  color: var(--bg);
  border-radius: 2px;
  padding: 0.5rem 0.7rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-decoration: none;
}

.skip-link:focus {
  transform: translateY(0);
}

.layout {
  width: min(100%, 1280px);
  max-width: 100%;
  overflow-x: clip;
  margin: 0 auto;
  padding: 0.75rem 0.75rem 4.5rem;
}

.site-header {
  position: relative;
  top: auto;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 3rem;
  margin-bottom: 0.95rem;
  border: 1px solid rgb(30 30 30 / 0.18);
  background: color-mix(in oklab, var(--surface-strong) 88%, transparent);
  padding: 0.45rem;
  box-shadow: 0 0.75rem 2rem rgb(5 6 10 / 0.08);
  backdrop-filter: blur(18px);
}

.brand-link,
.site-links a,
.topic-nav a,
.home-kicker,
.section-kicker,
.topic-search-label,
.topic-search-status,
.topic-index-link,
.topic-parent,
.topic-card-parent {
  font-family: var(--font-mono);
}

.brand-link,
.site-links a,
.topic-nav a {
  display: inline-flex;
  align-items: center;
  min-height: 1.65rem;
  border-radius: 2px;
  padding: 0.22rem 0.4rem;
  background: rgb(30 30 30 / 0.067);
  text-decoration: none;
  color: var(--text);
  font-size: 0.75rem;
  line-height: 1.2;
}

.brand-link::before,
.site-links a[data-hotkey]::before,
.topic-nav a[data-hotkey]::before,
.primary-action[data-hotkey]::before,
.secondary-action[data-hotkey]::before {
  content: "[" attr(data-hotkey) "]";
  margin-right: 0.35rem;
  color: var(--muted);
}

.site-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: end;
  gap: 0.4rem;
  margin: 0;
  min-width: 0;
}

.home-page .site-header {
  border-color: rgb(226 232 240 / 0.22);
  background: rgb(15 23 42 / 0.72);
}

.home-page .brand-link,
.home-page .site-links a {
  background: rgb(248 250 252 / 0.11);
  color: #f8fafc;
}

.home-page .brand-link::before,
.home-page .site-links a[data-hotkey]::before {
  color: rgb(248 250 252 / 0.62);
}

.layout > *,
.panel,
.topic-card,
.home-showcase-section > *,
.portfolio-section-header > *,
.subscribe-panel > * {
  min-width: 0;
}

.home-title,
.site-title,
.section-title,
.topic-card-title,
.portfolio-title,
.research-hero h1,
.errata-hero h1,
.subscribe-page-hero h1 {
  max-width: 100%;
  overflow-wrap: anywhere;
}

img,
svg,
video,
canvas {
  max-width: 100%;
}

.panel {
  background: color-mix(in oklab, var(--surface) 92%, transparent);
  border: 1px solid var(--border);
  border-radius: 0;
}

.home-hero {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(22rem, 0.74fr);
  gap: 0.75rem;
  align-items: stretch;
  min-height: 26rem;
  margin: 0 0 0.75rem;
}

.home-hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: end;
  border: 1px solid var(--border);
  background: var(--surface);
  padding: clamp(1.1rem, 3vw, 2rem);
}

.home-kicker,
.section-kicker {
  margin: 0 0 1rem;
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
}

.site-title,
.home-title,
.section-title {
  margin: 0;
  font-family: var(--font-sans);
  font-weight: 720;
  letter-spacing: 0;
}

.home-title {
  max-width: 12ch;
  font-size: clamp(2.55rem, 7.5vw, 6.1rem);
  line-height: 0.94;
  color: var(--text);
}

.home-intro {
  max-width: 42rem;
  margin: 1rem 0 0;
  color: var(--muted);
  font-size: clamp(1rem, 1.35vw, 1.2rem);
  line-height: 1.42;
}

.home-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.primary-action,
.secondary-action {
  display: inline-flex;
  align-items: center;
  min-height: 2.2rem;
  border-radius: 2px;
  padding: 0.5rem 0.7rem;
  text-decoration: none;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 700;
}

.primary-action {
  background: var(--text);
  color: var(--bg);
}

.primary-action::before {
  color: color-mix(in oklab, var(--bg) 72%, transparent);
}

.secondary-action {
  border: 1px solid var(--border);
  color: var(--text);
  background: rgb(30 30 30 / 0.04);
}

.stripe-field {
  position: relative;
  overflow: hidden;
  min-height: 100%;
  border: 1px solid var(--border);
  background:
    linear-gradient(135deg, transparent 0 47%, var(--hairline) 47% 48%, transparent 48%),
    linear-gradient(90deg, rgb(30 30 30 / 0.04) 1px, transparent 1px),
    linear-gradient(180deg, rgb(30 30 30 / 0.04) 1px, transparent 1px),
    var(--surface-soft);
  background-size: auto, 28px 28px, 28px 28px, auto;
}

.stripe-field::before,
.stripe-field::after,
.stripe-field-grid,
.stripe-field-orbit {
  content: "";
  position: absolute;
  pointer-events: none;
}

.stripe-field::before {
  inset: 18% -18% auto;
  height: 44%;
  background:
    linear-gradient(90deg, transparent, var(--accent), var(--cyan), var(--orange), transparent);
  transform: skewY(-10deg);
  opacity: 0.85;
  animation: stripe-drift 14s linear infinite;
}

.stripe-field::after {
  inset: auto 8% 12% auto;
  width: 38%;
  aspect-ratio: 1;
  border: 1px solid var(--border);
  background:
    linear-gradient(90deg, transparent 49%, var(--border) 49% 51%, transparent 51%),
    linear-gradient(180deg, transparent 49%, var(--border) 49% 51%, transparent 51%);
  opacity: 0.9;
}

.stripe-field-label,
.stripe-field-title {
  position: absolute;
  z-index: 1;
  font-family: var(--font-mono);
  color: var(--text);
}

.stripe-field-label {
  top: 0.75rem;
  left: 0.75rem;
  font-size: 0.72rem;
}

.stripe-field-title {
  right: 0.75rem;
  bottom: 0.75rem;
  font-size: clamp(1.7rem, 4vw, 3.6rem);
  font-weight: 700;
  line-height: 0.95;
}

.stripe-field-grid {
  inset: 3.2rem 12% 5rem;
  border: 1px solid var(--border);
  background:
    repeating-linear-gradient(90deg, transparent 0 1.35rem, rgb(30 30 30 / 0.16) 1.35rem 1.42rem),
    repeating-linear-gradient(180deg, transparent 0 1.35rem, rgb(30 30 30 / 0.16) 1.35rem 1.42rem);
  animation: stripe-grid-pulse 6s ease-in-out infinite;
}

.stripe-field-orbit {
  width: 7rem;
  height: 7rem;
  left: 12%;
  bottom: 13%;
  border: 1px solid var(--border);
  background: rgb(244 244 242 / 0.55);
  animation: stripe-orbit 10s ease-in-out infinite;
}

.home-showcase {
  position: relative;
  display: grid;
  gap: clamp(2.5rem, 8vw, 7rem);
  margin: 0 0 0.75rem;
  padding: clamp(1rem, 3vw, 2rem) 0;
  scroll-snap-type: none;
  isolation: isolate;
  --section-band: rgb(99 91 255 / 0.28);
  --showcase-bg-current: #05060a;
  --showcase-bg-next: #0b1220;
  --showcase-bg-mix: 0;
  --showcase-foreground: #171717;
  --showcase-muted: #555;
  --showcase-link: #121212;
  --showcase-card: #fff;
  --showcase-card-foreground: #171717;
  --showcase-card-muted: #555;
  --showcase-card-hover: #f8fafc;
  --showcase-card-hover-foreground: #121417;
  --showcase-card-hover-muted: #3f4650;
  --showcase-border: rgb(24 24 24 / 0.18);
  transition:
    --showcase-bg-current 620ms cubic-bezier(0.22, 0.8, 0.22, 1),
    --showcase-bg-next 620ms cubic-bezier(0.22, 0.8, 0.22, 1);
}

.home-showcase::before,
.home-showcase::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.home-showcase::before {
  background:
    radial-gradient(circle at 18% 18%, rgb(125 211 252 / 0.2), transparent 30%),
    radial-gradient(circle at 86% 28%, rgb(244 63 94 / 0.16), transparent 32%),
    var(--showcase-bg-current);
}

.home-showcase::after {
  background:
    radial-gradient(circle at 72% 16%, rgb(52 211 153 / 0.2), transparent 28%),
    radial-gradient(circle at 12% 74%, rgb(37 99 235 / 0.18), transparent 34%),
    var(--showcase-bg-next);
  opacity: var(--showcase-bg-mix);
  transition: opacity 260ms linear;
}

.home-showcase > * {
  position: relative;
  z-index: 1;
}

.home-showcase-section {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(18rem, 1.1fr);
  column-gap: clamp(1rem, 3vw, 2.6rem);
  row-gap: clamp(2rem, 6vw, 5rem);
  align-items: start;
  min-height: auto;
  padding: clamp(1rem, 3vw, 2rem);
  margin: 0 0 clamp(1.5rem, 4vw, 3rem);
  border: 1px solid var(--showcase-border);
  background: var(--surface);
  color: var(--showcase-foreground);
  overflow: visible;
  scroll-margin-top: 0.8rem;
  scroll-snap-align: none;
  isolation: isolate;
  --stage-title-progress: 1;
  --stage-copy-progress: 1;
  --stage-actions-progress: 1;
  --stage-hold-progress: 1;
  --stage-exit-progress: 0;
  --stage-title-opacity: 1;
  --stage-copy-opacity: 1;
  --stage-actions-opacity: 1;
  --stage-visual-opacity: 1;
  --stage-title-x: 0px;
  --stage-copy-x: 0px;
  --stage-copy-y: 0px;
  --stage-actions-x: 0px;
  --stage-actions-y: 0px;
  --stage-actions-scale: 1;
  --stage-actions-clip: 0%;
  --stage-visual-x: 0px;
  --stage-exit-y: 0px;
  --build-card-x: 0px;
  --build-card-y: 0px;
  --index-rule-progress: 1;
  --line-offset: 0;
  --band-offset: 0px;
}

.home-showcase-section::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgb(30 30 30 / 0.045) 1px, transparent 1px),
    linear-gradient(180deg, rgb(30 30 30 / 0.045) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: linear-gradient(180deg, black, transparent 78%);
}

.home-showcase-section::after {
  content: "";
  position: absolute;
  left: -12%;
  right: -12%;
  bottom: 8%;
  height: 28%;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, var(--section-band), transparent);
  opacity: calc(0.14 + var(--stage-hold-progress, 1) * 0.22);
  transform: translate3d(var(--band-offset), 0, 0) skewY(-5deg);
}

.home-showcase-motion .home-showcase-section {
  transition:
    background 900ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 900ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.home-showcase-section > .home-showcase-copy,
.home-showcase-section > .home-visual {
  position: relative;
  top: auto;
}

.home-showcase-motion .home-showcase-copy .home-kicker,
.home-showcase-motion .home-showcase-copy .section-kicker,
.home-showcase-motion .home-showcase-copy .home-title,
.home-showcase-motion .home-showcase-copy .section-title {
  opacity: var(--stage-title-opacity);
  transform: translate3d(var(--stage-title-x), var(--stage-exit-y), 0);
  will-change: transform, opacity;
}

.home-showcase-motion .home-showcase-copy .home-intro,
.home-showcase-motion .home-showcase-copy .home-actions,
.home-showcase-motion .home-showcase-copy .topic-index-link {
  opacity: var(--stage-copy-opacity);
  transform: translate3d(var(--stage-copy-x), calc(var(--stage-copy-y) + var(--stage-exit-y)), 0);
  will-change: transform, opacity;
}

.home-showcase-motion .home-visual {
  opacity: var(--stage-visual-opacity);
  transform: translate3d(var(--stage-visual-x), 0, 0);
  will-change: transform, opacity;
}

.home-showcase-motion .home-showcase-cards,
.home-showcase-motion .home-explore-band,
.home-showcase-motion .home-showcase-contact .portfolio-philosophy-grid,
.home-showcase-motion .home-showcase-contact .subscribe-panel {
  opacity: var(--stage-actions-opacity);
  transform: translate3d(var(--stage-actions-x), var(--stage-actions-y), 0) scale(var(--stage-actions-scale));
  transform-origin: center right;
  will-change: transform, opacity;
}

.home-showcase-motion .home-showcase-cards .topic-card,
.home-showcase-motion .home-explore-band .topic-card {
  transform: none;
  will-change: auto;
}

.home-showcase-motion .home-showcase-section:not(.is-active) .topic-card {
  filter: saturate(0.92);
}

.home-showcase-copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  color: var(--showcase-foreground);
}

.home-showcase-copy .section-title {
  color: var(--showcase-foreground);
  font-size: clamp(2rem, 5.4vw, 4.8rem);
  line-height: 0.97;
}

.home-showcase-copy .topic-index-link {
  display: inline-block;
  width: fit-content;
  margin-top: clamp(0.95rem, 1.8vw, 1.25rem);
}

@media (min-width: 821px) {
  .home-showcase-section {
    min-height: clamp(54rem, 158vh, 84rem);
  }

  .home-showcase-hero {
    min-height: clamp(68rem, 190vh, 98rem);
  }

  .home-showcase-section > .home-showcase-copy,
  .home-showcase-section > .home-visual {
    position: sticky;
    top: clamp(9rem, 27vh, 14rem);
    align-self: start;
  }

  .home-showcase-hero > .home-showcase-copy,
  .home-showcase-hero > .home-visual,
  .home-showcase-contact > .home-showcase-copy,
  .home-showcase-contact > .home-visual {
    position: relative;
    top: auto;
  }

  .home-showcase-cards,
  .home-explore-band,
  .home-showcase-contact .portfolio-philosophy-grid,
  .home-showcase-contact .subscribe-panel {
    scroll-margin-top: clamp(5rem, 10vh, 7.5rem);
  }

  .home-showcase-cards,
  .home-explore-band {
    position: sticky;
    top: clamp(9rem, 34vh, 18rem);
    align-self: start;
  }
}

.home-showcase-hero {
  grid-template-columns: minmax(0, 1.08fr) minmax(18rem, 0.92fr);
  grid-template-rows: auto auto;
  min-height: clamp(68rem, 190vh, 98rem);
  --section-band: rgb(99 91 255 / 0.26);
  --showcase-foreground: #f7f7f2;
  --showcase-muted: #cbd5e1;
  --showcase-link: #f7f7f2;
  --showcase-card: #111827;
  --showcase-card-foreground: #f7f7f2;
  --showcase-card-muted: #cbd5e1;
  --showcase-border: rgb(247 247 242 / 0.2);
  background:
    linear-gradient(118deg, rgb(125 211 252 / 0.14) 0 31%, transparent 31% 100%),
    linear-gradient(146deg, transparent 0 57%, rgb(99 102 241 / 0.16) 57% 100%),
    linear-gradient(320deg, rgb(14 165 233 / 0.2), transparent 42%),
    rgb(5 6 10 / 0.92);
  background-color: #05060a;
}

.home-showcase-hero .home-showcase-copy {
  grid-column: 1;
}

.home-showcase-hero .home-title {
  max-width: 10ch;
  color: var(--showcase-foreground);
  font-size: clamp(3.8rem, 7.8vw, 6.7rem);
  line-height: 0.88;
}

.home-showcase-hero .home-title span {
  display: block;
  overflow-wrap: normal;
  word-break: normal;
  hyphens: manual;
}

.home-showcase-hero .home-intro {
  max-width: 48rem;
  color: var(--showcase-muted);
}

.home-explore-band {
  position: relative;
  z-index: 1;
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: minmax(12rem, 0.35fr) minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
  margin-top: clamp(1.5rem, 5vw, 4rem);
  padding-top: clamp(1.2rem, 3vw, 2rem);
  border-top: 1px solid var(--border);
  overflow: clip;
}

.home-explore-band .section-title {
  font-size: clamp(1.8rem, 4vw, 3.4rem);
}

.home-showcase-cards {
  position: relative;
  z-index: 1;
  grid-column: 1 / -1;
  align-self: end;
  overflow: clip;
}

.home-showcase-section:not(.home-showcase-hero) .home-showcase-cards {
  z-index: 2;
  grid-column: 2;
  grid-row: 1;
  align-self: end;
  margin-top: clamp(3rem, 12vh, 7rem);
  overflow: visible;
}

.home-showcase-research .home-showcase-cards {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.7rem;
  clip-path: inset(0 var(--stage-actions-clip) 0 0);
}

.home-showcase-research .topic-card {
  min-height: 6.6rem;
  padding: 1.35rem 1rem 0.9rem;
  border-left: 4px solid color-mix(in srgb, var(--section-band) 78%, white);
  background:
    linear-gradient(90deg, rgb(255 255 255 / 0.08), transparent 42%),
    var(--showcase-card);
}

.home-showcase-research .topic-card:nth-child(2) {
  margin-left: 1.2rem;
}

.home-showcase-research .topic-card:nth-child(3) {
  margin-left: 2.4rem;
}

.home-showcase-projects .home-showcase-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: end;
  gap: 0.75rem;
}

.home-showcase-projects .topic-card {
  min-height: 13rem;
  padding-top: 1.2rem;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.18);
  transform: translate3d(var(--build-card-x), var(--build-card-y), 0);
}

.home-showcase-projects .topic-card:nth-child(2) {
  min-height: 15.5rem;
  transform: translate3d(calc(var(--build-card-x) * 0.58), calc(var(--build-card-y) * 0.42), 0);
}

.home-showcase-projects .topic-card:nth-child(3) {
  min-height: 11.5rem;
  transform: translate3d(calc(var(--build-card-x) * 0.26), calc(var(--build-card-y) * 0.18), 0);
}

.home-showcase-writing .home-showcase-cards {
  grid-column: 1 / -1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: clamp(4rem, 14vh, 8rem);
  padding-block: 1rem;
  border-top: 1px solid var(--showcase-border);
  border-bottom: 1px solid var(--showcase-border);
}

.home-showcase-writing .home-showcase-cards::before {
  content: "";
  position: absolute;
  top: -1px;
  left: 0;
  width: calc(var(--index-rule-progress) * 100%);
  height: 2px;
  background: var(--showcase-foreground);
}

.home-showcase-writing .topic-card {
  min-height: 7.4rem;
  padding: 1.5rem 0.85rem 0.85rem;
  background:
    linear-gradient(180deg, rgb(18 20 23 / 0.035), transparent 48%),
    var(--showcase-card);
}

@media (min-width: 821px) {
  .home-showcase-cards,
  .home-explore-band {
    position: sticky;
    top: clamp(9rem, 34vh, 18rem);
    align-self: start;
  }
}

.home-showcase-section .topic-grid {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
}

.home-showcase-section .topic-card {
  min-height: 8.5rem;
  padding: 2.65rem 0.85rem 0.85rem;
  border-color: var(--showcase-border);
  background: var(--showcase-card);
  color: var(--showcase-card-foreground);
}

.home-showcase-writing .topic-card {
  padding: 3.35rem 1rem 1rem;
}

.home-showcase-writing .topic-card::before {
  top: 1rem;
  left: 1rem;
}

.home-showcase-writing .topic-card::after {
  top: 1.05rem;
  right: 1rem;
}

.home-showcase-section .topic-card-title {
  color: var(--showcase-card-foreground);
  font-size: 1.05rem;
}

.home-showcase-section .topic-card:hover,
.home-showcase-section .topic-card:focus-visible {
  border-color: color-mix(in oklab, var(--showcase-card-hover-foreground) 42%, var(--showcase-border));
  background: var(--showcase-card-hover);
  color: var(--showcase-card-hover-foreground);
}

.home-showcase-section .topic-card:hover .topic-card-title,
.home-showcase-section .topic-card:focus-visible .topic-card-title {
  color: var(--showcase-card-hover-foreground);
}

.home-showcase-section .topic-card-description {
  margin-top: 0.55rem;
  color: var(--showcase-card-muted);
  font-size: 0.82rem;
  line-height: 1.45;
}

.home-showcase-section .topic-card:hover .topic-card-description,
.home-showcase-section .topic-card:focus-visible .topic-card-description,
.home-showcase-section .topic-card:hover .topic-card-parent,
.home-showcase-section .topic-card:focus-visible .topic-card-parent {
  color: var(--showcase-card-hover-muted);
}

.home-showcase-section.home-showcase-research .home-showcase-cards {
  grid-template-columns: minmax(0, 1fr);
}

.home-showcase-section.home-showcase-projects .home-showcase-cards {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.home-showcase-section.home-showcase-writing .home-showcase-cards {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.home-showcase-section .home-kicker,
.home-showcase-section .section-kicker,
.home-showcase-section .topic-index-link {
  color: var(--showcase-muted);
}

.home-showcase-section .secondary-action {
  border-color: var(--showcase-border);
  color: var(--showcase-link);
}

.home-showcase-section .primary-action {
  background: var(--showcase-foreground);
  color: var(--showcase-card);
}

.home-showcase-research {
  --section-band: rgb(0 212 255 / 0.34);
  --showcase-foreground: #eaf6ff;
  --showcase-muted: #b8cce0;
  --showcase-link: #eaf6ff;
  --showcase-card: #111f2d;
  --showcase-card-foreground: #eaf6ff;
  --showcase-card-muted: #bfd0df;
  --showcase-border: rgb(234 246 255 / 0.22);
  background:
    linear-gradient(112deg, rgb(52 211 153 / 0.12) 0 36%, transparent 36% 100%),
    linear-gradient(145deg, transparent 0 56%, rgb(125 211 252 / 0.14) 56% 100%),
    linear-gradient(320deg, rgb(37 99 235 / 0.18), transparent 42%),
    rgb(11 18 32 / 0.92);
  background-color: #0b1220;
}

.home-showcase-projects {
  --section-band: rgb(255 122 26 / 0.38);
  --showcase-foreground: #f4fff8;
  --showcase-muted: #c2d8cd;
  --showcase-link: #f4fff8;
  --showcase-card: #16342d;
  --showcase-card-foreground: #f4fff8;
  --showcase-card-muted: #c6ded1;
  --showcase-border: rgb(244 255 248 / 0.24);
  color: var(--showcase-foreground);
  background:
    linear-gradient(118deg, rgb(167 243 208 / 0.14) 0 27%, transparent 27% 100%),
    linear-gradient(145deg, transparent 0 59%, rgb(125 211 252 / 0.12) 59% 100%),
    linear-gradient(135deg, #10231e, #17352e 58%, #07120f);
  background-color: #10231e;
}

.home-showcase-projects .home-kicker,
.home-showcase-projects .section-kicker,
.home-showcase-projects .topic-index-link,
.home-showcase-projects .topic-card-description {
  color: var(--showcase-muted);
}

.home-showcase-projects .topic-card,
.home-showcase-projects .secondary-action {
  border-color: var(--showcase-border);
  background: var(--showcase-card);
  color: var(--showcase-card-foreground);
}

.home-showcase-projects .primary-action {
  background: var(--showcase-foreground);
  color: #111827;
}

.home-showcase-writing {
  --section-band: rgb(0 166 118 / 0.3);
  --showcase-foreground: #121417;
  --showcase-muted: #4b5563;
  --showcase-link: #121417;
  --showcase-card: #fff;
  --showcase-card-foreground: #121417;
  --showcase-card-muted: #4b5563;
  --showcase-border: rgb(18 20 23 / 0.18);
  background:
    linear-gradient(118deg, #f1efe7 0 34%, transparent 34% 100%),
    linear-gradient(145deg, transparent 0 58%, rgb(233 238 245 / 0.92) 58% 100%),
    linear-gradient(320deg, rgb(217 119 6 / 0.14), transparent 42%),
    #f1efe7;
}

.home-showcase-contact {
  --section-band: rgb(125 211 252 / 0.24);
  --showcase-foreground: #f8fafc;
  --showcase-muted: #d5dde8;
  --showcase-link: #f8fafc;
  --showcase-card: #314154;
  --showcase-card-foreground: #f8fafc;
  --showcase-card-muted: #d5dde8;
  --showcase-border: rgb(226 232 240 / 0.22);
  color: var(--showcase-foreground);
  background:
    linear-gradient(118deg, rgb(244 63 94 / 0.12) 0 32%, transparent 32% 100%),
    linear-gradient(145deg, transparent 0 60%, rgb(125 211 252 / 0.16) 60% 100%),
    linear-gradient(135deg, #253340, #334557 58%, #1c2834);
  background-color: #253340;
}

.home-showcase-contact .home-kicker,
.home-showcase-contact .section-kicker,
.home-showcase-contact .ask-list,
.home-showcase-contact .portfolio-philosophy-grid p {
  color: var(--showcase-muted);
}

.home-showcase-contact .portfolio-philosophy-grid {
  position: relative;
  z-index: 1;
  grid-column: 1 / -1;
  border-color: var(--showcase-border);
  background: var(--showcase-card);
  color: var(--showcase-card-foreground);
}

.home-showcase-contact .ask-list,
.home-showcase-contact .portfolio-philosophy-grid p,
.home-showcase-contact .subscribe-panel {
  background: var(--showcase-card);
  color: var(--showcase-card-foreground);
}

.home-showcase-contact .secondary-action,
.home-showcase-contact .subscribe-panel {
  border-color: var(--showcase-border);
  color: var(--showcase-card-foreground);
}

.home-showcase-contact .primary-action {
  background: var(--showcase-foreground);
  color: #0e2c22;
}

.home-showcase-contact .subscribe-panel {
  position: relative;
  z-index: 1;
  grid-column: 1 / -1;
  margin-top: 0;
}

.home-showcase-contact .subscribe-panel h2,
.home-showcase-contact .subscribe-panel p,
.home-showcase-contact .subscribe-panel .section-kicker {
  color: var(--showcase-card-foreground);
}

.home-showcase-contact .subscribe-panel p:not(.section-kicker) {
  color: var(--showcase-card-muted);
}

.home-visual {
  position: relative;
  z-index: 1;
  display: grid;
  min-width: 0;
  min-height: 100%;
  align-self: stretch;
  border: 1px solid var(--showcase-border);
  background: color-mix(in srgb, var(--showcase-card) 78%, transparent);
  color: var(--showcase-foreground);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.68);
  backdrop-filter: blur(18px);
}

.home-visual svg {
  display: block;
  width: 100%;
  height: 100%;
  min-height: clamp(20rem, 38vw, 32rem);
}

.home-visual-base {
  fill: rgb(255 255 255 / 0.48);
  stroke: rgb(30 30 30 / 0.14);
}

.home-visual-grid,
.home-visual-plane {
  fill: none;
  stroke: rgb(30 30 30 / 0.18);
  stroke-width: 1;
}

.home-visual-plane {
  fill: rgb(255 255 255 / 0.32);
}

.home-visual-thread {
  fill: none;
  stroke-dasharray: 720;
  stroke-dashoffset: var(--line-offset);
  stroke-width: 2.4;
  stroke-linecap: round;
}

.home-visual-thread-alt {
  opacity: 0.5;
  stroke: currentColor;
  stroke-width: 1.4;
}

.home-visual-label,
.home-visual-node text {
  fill: currentColor;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0;
}

.home-visual-node rect {
  fill: rgb(255 255 255 / 0.72);
  stroke: rgb(30 30 30 / 0.2);
}

.home-showcase-projects .home-visual,
.home-showcase-contact .home-visual {
  border-color: rgb(255 255 255 / 0.18);
  background: rgb(255 255 255 / 0.08);
  color: rgb(255 255 255 / 0.78);
}

.home-showcase-projects .home-visual-base,
.home-showcase-contact .home-visual-base,
.home-showcase-projects .home-visual-node rect,
.home-showcase-contact .home-visual-node rect {
  fill: rgb(255 255 255 / 0.08);
  stroke: rgb(255 255 255 / 0.22);
}

.home-showcase-projects .home-visual-grid,
.home-showcase-projects .home-visual-plane,
.home-showcase-contact .home-visual-grid,
.home-showcase-contact .home-visual-plane {
  stroke: rgb(255 255 255 / 0.2);
}

@keyframes stripe-drift {
  0% {
    transform: translateX(-18%) skewY(-10deg);
  }
  50% {
    transform: translateX(18%) skewY(-10deg);
  }
  100% {
    transform: translateX(-18%) skewY(-10deg);
  }
}

@keyframes stripe-grid-pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.85;
  }
}

@keyframes stripe-orbit {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(1rem, -0.8rem);
  }
}

.topic-hub {
  scroll-margin-top: 1rem;
  --notes-reveal-progress: 1;
  padding: clamp(1rem, 3vw, 1.6rem);
  opacity: calc(0.72 + var(--notes-reveal-progress) * 0.28);
  transform: translate3d(0, calc((1 - var(--notes-reveal-progress)) * 28px), 0);
  transition:
    opacity 420ms ease,
    transform 420ms ease;
  will-change: opacity, transform;
}

.home-proof {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0 0 3rem;
  border-top: 1px solid var(--border);
  border-left: 1px solid var(--border);
}

.home-proof div {
  min-height: 8.5rem;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: color-mix(in oklab, var(--surface) 90%, transparent);
  padding: 1rem;
}

.home-proof span {
  display: block;
  font-family: var(--font-mono);
  font-size: clamp(1.35rem, 3vw, 2rem);
  font-weight: 700;
  line-height: 1;
}

.home-proof p {
  max-width: 24rem;
  margin: 0.75rem 0 0;
  color: var(--muted);
}

.home-bio {
  display: grid;
  grid-template-columns: minmax(8rem, 0.55fr) minmax(0, 1.45fr) auto;
  gap: 1rem;
  align-items: center;
  margin: 0 0 1.5rem;
  padding: 1rem 0;
  border-top: 1px solid var(--hairline);
  border-bottom: 1px solid var(--hairline);
}

.home-bio h2,
.home-bio p {
  margin: 0;
}

.home-bio h2 {
  font-size: 1.2rem;
}

.home-bio p:not(.section-kicker) {
  color: var(--muted);
  line-height: 1.6;
}

.home-bio-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: end;
  gap: 0.75rem;
}

.home-bio a {
  justify-self: end;
  color: var(--accent-strong);
  font-weight: 800;
  text-decoration: none;
}

.home-bio a:hover,
.home-bio a:focus-visible {
  text-decoration: underline;
}

.home-featured {
  display: grid;
  grid-template-columns: minmax(8rem, 0.55fr) minmax(0, 1.45fr);
  gap: 1rem;
  align-items: start;
  margin: 0 0 1.5rem;
  border-bottom: 1px solid var(--hairline);
  padding: 0 0 1rem;
}

.home-featured a {
  display: block;
  color: var(--text);
  text-decoration: none;
}

.home-featured span {
  display: block;
  max-width: 44rem;
  color: var(--accent-strong);
  font-size: clamp(1.25rem, 3vw, 2rem);
  font-weight: 850;
  line-height: 1;
}

.home-featured p {
  max-width: 44rem;
  margin: 0.65rem 0 0;
  color: var(--muted);
  line-height: 1.6;
}

.home-featured a:hover span,
.home-featured a:focus-visible span {
  text-decoration: underline;
  text-underline-offset: 0.18rem;
}

.research-hero {
  margin: 2rem 0 1.25rem;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: clamp(1.5rem, 5vw, 3rem) 0;
}

.research-hero h1 {
  max-width: 9ch;
  margin: 0;
  font-size: clamp(3rem, 10vw, 7rem);
  line-height: 0.88;
  letter-spacing: 0;
}

.research-hero p:not(.home-kicker) {
  max-width: 46rem;
  margin: 1rem 0 0;
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.65;
}

.research-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  margin: 0 0 1.5rem;
  border: 1px solid var(--border);
  background: var(--border);
}

.research-topic {
  position: relative;
  min-height: 19rem;
  background: var(--surface);
  padding: clamp(1rem, 3vw, 1.4rem);
}

.research-topic-index {
  display: inline-block;
  margin-bottom: 1.75rem;
  font-family: var(--font-mono);
  color: var(--accent-strong);
  font-weight: 800;
}

.research-topic h2 {
  max-width: 24rem;
  margin: 0;
  font-size: clamp(1.35rem, 3vw, 2.1rem);
  line-height: 1;
  letter-spacing: 0;
}

.research-topic p {
  margin: 1rem 0 0;
  color: var(--muted);
  line-height: 1.6;
}

.research-sources {
  display: grid;
  gap: 0.45rem;
  margin: 1.1rem 0 0;
  padding: 0;
  list-style: none;
}

.research-sources a {
  color: var(--text);
  font-weight: 800;
  text-decoration-color: color-mix(in oklab, var(--accent) 45%, transparent);
  text-decoration-thickness: 0.12rem;
  text-underline-offset: 0.18rem;
}

.research-sources a:hover,
.research-sources a:focus-visible {
  color: var(--accent-strong);
}

.start-research-link {
  margin: 1.25rem 0 0;
}

.start-research-link a {
  color: var(--accent-strong);
  font-weight: 800;
  text-decoration: none;
}

.start-research-link a:hover,
.start-research-link a:focus-visible {
  text-decoration: underline;
}

.errata-hero {
  margin: 2rem 0 1.25rem;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: clamp(1.5rem, 5vw, 3rem) 0;
}

.errata-hero h1 {
  margin: 0;
  font-size: clamp(3rem, 10vw, 7rem);
  line-height: 0.88;
  letter-spacing: 0;
}

.errata-hero p:not(.home-kicker) {
  max-width: 44rem;
  margin: 1rem 0 0;
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.65;
}

.errata-panel {
  padding: clamp(1rem, 3vw, 1.6rem);
}

.errata-copy {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.errata-copy p,
.errata-policy li,
.errata-policy p {
  color: var(--muted);
  line-height: 1.65;
}

.errata-policy {
  margin: 1.5rem 0;
  border-top: 1px solid var(--hairline);
  border-bottom: 1px solid var(--hairline);
  padding: 1rem 0;
}

.errata-policy h2 {
  margin: 0 0 0.8rem;
  font-size: 1.2rem;
}

.errata-policy ul {
  margin: 0;
  padding-left: 1.1rem;
}

.errata-policy a {
  color: var(--accent-strong);
  font-weight: 800;
}

.subscribe-page-hero {
  margin: 2rem 0 1.25rem;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: clamp(1.5rem, 5vw, 3rem) 0;
}

.subscribe-page-hero h1 {
  margin: 0;
  font-size: clamp(3rem, 10vw, 7rem);
  line-height: 0.88;
  letter-spacing: 0;
}

.subscribe-page-hero p:not(.home-kicker) {
  max-width: 34rem;
  margin: 1rem 0 0;
  color: var(--accent-strong);
  font-size: 1.25rem;
  font-weight: 850;
  line-height: 1.25;
}

.subscribe-route {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(16rem, 0.75fr);
  gap: 1rem;
  align-items: start;
  margin: 0 0 1.5rem;
  border: 1px solid var(--border);
  background: var(--surface);
  padding: clamp(1rem, 3vw, 1.4rem);
}

.subscribe-route h2,
.subscribe-route p {
  margin: 0;
}

.subscribe-route h2 {
  font-size: clamp(1.8rem, 5vw, 3rem);
  line-height: 0.95;
}

.subscribe-route p:not(.section-kicker) {
  max-width: 44rem;
  margin-top: 1rem;
  color: var(--muted);
  line-height: 1.65;
}

.subscribe-route-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: end;
  gap: 0.5rem;
}

.subscribe-route-details {
  margin: 1.5rem 0;
  border-top: 1px solid var(--hairline);
  border-bottom: 1px solid var(--hairline);
  padding: 1rem 0;
}

.subscribe-route-details h2 {
  margin: 0 0 0.8rem;
  font-size: 1.2rem;
}

.subscribe-route-details ul {
  margin: 0;
  padding-left: 1.1rem;
}

.subscribe-route-details li {
  color: var(--muted);
  line-height: 1.65;
}

.site-footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: end;
  margin-top: 3rem;
  border-top: 1px solid var(--border);
  padding: 1.25rem 0 0;
}

.site-footer p {
  max-width: 34rem;
  margin: 0.35rem 0 0;
  color: var(--muted);
  line-height: 1.55;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: end;
  gap: 0.5rem 0.85rem;
}

.footer-links a {
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 800;
  text-decoration: none;
  text-transform: uppercase;
}

.footer-links a:hover,
.footer-links a:focus-visible {
  color: var(--accent-strong);
  text-decoration: underline;
  text-underline-offset: 0.18rem;
}

.topic-hub-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.2rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1rem;
}

.topic-hub-intro {
  max-width: 48rem;
  margin: 0.85rem 0 0;
  color: var(--muted);
  font-size: clamp(0.95rem, 1.6vw, 1.08rem);
  line-height: 1.65;
}

.section-title {
  font-size: clamp(2rem, 5vw, 3.35rem);
  line-height: 0.98;
}

.section-title sup {
  vertical-align: super;
  font-family: var(--font-mono);
  font-size: 0.33em;
  color: var(--muted);
}

.topic-index-link {
  color: var(--text);
  font-size: 0.78rem;
  font-weight: 700;
}

.topic-search-label {
  display: block;
  margin-bottom: 0.35rem;
  color: var(--muted);
  font-size: 0.76rem;
  font-weight: 700;
}

.topic-search {
  width: 100%;
  margin: 0;
  padding: 0.78rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 0;
  background: var(--surface-strong);
  color: var(--text);
  font: inherit;
}

.topic-search-status {
  min-height: 1.5rem;
  margin: 0.35rem 0 1rem;
  color: var(--muted);
  font-size: 0.78rem;
}

.topic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
  border-top: 1px solid var(--border);
  border-left: 1px solid var(--border);
}

.subscribe-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: end;
  margin-top: 0.75rem;
  border: 1px solid var(--border);
  background:
    linear-gradient(90deg, rgb(99 91 255 / 0.08), transparent 42%),
    var(--surface);
  padding: clamp(1rem, 3vw, 1.35rem);
}

.subscribe-panel h2 {
  max-width: 16ch;
  margin: 0;
  font-size: clamp(1.75rem, 4vw, 3.1rem);
  line-height: 0.95;
  letter-spacing: 0;
}

.subscribe-panel p:not(.section-kicker) {
  max-width: 43rem;
  margin: 0.85rem 0 0;
  color: var(--muted);
}

.subscribe-panel-compact {
  margin: 1rem 0 1.4rem;
  padding: 0.85rem;
  background: color-mix(in oklab, var(--surface) 88%, transparent);
}

.subscribe-panel-compact h2 {
  max-width: none;
  font-size: 1.2rem;
  line-height: 1.1;
}

.subscribe-panel-compact p:not(.section-kicker) {
  max-width: 39rem;
  margin-top: 0.45rem;
  font-size: 0.9rem;
}

.subscribe-panel-compact .subscribe-actions {
  gap: 0.45rem;
}

.subscribe-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: end;
  gap: 0.5rem;
}

.start-hero {
  max-width: 900px;
  margin: 0 auto 1rem;
  padding: clamp(1.1rem, 4vw, 2.4rem) 0;
}

.start-hero h1 {
  max-width: 10ch;
  margin: 0;
  font-size: clamp(2.6rem, 7vw, 4.8rem);
  line-height: 0.94;
  letter-spacing: 0;
}

.start-hero p:not(.home-kicker) {
  max-width: 44rem;
  margin: 1rem 0 0;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.65;
}

.start-path {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-width: 900px;
  margin: 0 auto 1rem;
  border-top: 1px solid var(--border);
  border-left: 1px solid var(--border);
}

.start-step {
  display: block;
  min-height: 15rem;
  padding: 1rem;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  text-decoration: none;
}

.start-step:hover,
.start-step:focus-visible {
  background: color-mix(in oklab, var(--accent) 9%, var(--surface));
}

.start-step span {
  display: block;
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 800;
}

.start-step h2 {
  margin: 0.7rem 0 0;
  font-size: 1.35rem;
  line-height: 1.05;
}

.start-step p {
  margin: 0.8rem 0 0;
  color: var(--muted);
  line-height: 1.55;
}

.start-topics {
  max-width: 900px;
  margin: 0 auto 1rem;
  padding: clamp(1rem, 3vw, 1.5rem);
}

.start-topic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: 0.7rem;
}

.start-topic-link {
  min-height: 8rem;
  padding: 0.8rem;
  border: 1px solid var(--hairline);
  background: var(--surface);
  color: var(--text);
  text-decoration: none;
}

.start-topic-link:hover,
.start-topic-link:focus-visible {
  border-color: color-mix(in oklab, var(--accent) 60%, var(--hairline));
}

.start-topic-link span {
  display: block;
  font-weight: 850;
}

.start-topic-link p {
  margin: 0.55rem 0 0;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

.topic-card {
  position: relative;
  display: block;
  min-height: 11rem;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: color-mix(in oklab, var(--surface) 88%, transparent);
  padding: 2.55rem 1rem 1rem;
  text-decoration: none;
  transition: background 160ms ease, color 160ms ease;
}

.topic-card::before {
  content: "[" attr(data-index) "]";
  position: absolute;
  top: 0.75rem;
  left: 1rem;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  line-height: 1;
}

.topic-card::after {
  content: "";
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  width: 1.3rem;
  height: 1.3rem;
  border: 1px solid currentColor;
  background:
    linear-gradient(90deg, transparent 45%, currentColor 45% 55%, transparent 55%),
    linear-gradient(180deg, transparent 45%, currentColor 45% 55%, transparent 55%);
  opacity: 0.45;
}

.topic-card:hover,
.topic-card:focus-visible {
  background: var(--text);
  color: var(--bg);
}

.topic-card-title {
  margin: 0;
  max-width: 18ch;
  font-family: var(--font-sans);
  font-size: 1.35rem;
  line-height: 1.05;
  letter-spacing: 0;
}

.topic-card-description {
  margin: 0.8rem 0 0;
  color: var(--muted);
  font-size: 0.95rem;
}

.topic-card:hover .topic-card-description,
.topic-card:focus-visible .topic-card-description,
.topic-card:hover .topic-card-parent,
.topic-card:focus-visible .topic-card-parent {
  color: color-mix(in oklab, var(--bg) 72%, transparent);
}

.topic-card-parent {
  margin: 0.45rem 0 0;
  color: var(--accent-strong);
  font-size: 0.75rem;
  font-weight: 700;
}

.notes-panel {
  max-width: 900px;
  margin: 0 auto;
  padding: clamp(1.1rem, 4vw, 2.4rem);
  background: var(--surface);
}

.site-title {
  max-width: 13ch;
  font-size: clamp(2.8rem, 9vw, 5.7rem);
  line-height: 0.88;
}

.topic-meta {
  max-width: 42rem;
  color: var(--muted);
  margin: 1rem 0 1.5rem;
  font-size: 1.05rem;
}

.topic-pillar {
  margin: 1.4rem 0 2rem;
  padding: 1rem;
  border: 1px solid var(--hairline);
  background: color-mix(in oklab, var(--bg) 54%, transparent);
}

.topic-pillar-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.9rem;
}

.topic-pillar h2,
.topic-pillar h3,
.topic-pillar p {
  margin: 0;
}

.topic-pillar h2 {
  font-size: 1.15rem;
}

.topic-pillar h3 {
  color: var(--accent-strong);
  font-size: 0.78rem;
  text-transform: uppercase;
  font-family: var(--font-mono);
  font-weight: 700;
}

.topic-pillar-start,
.topic-pillar-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
  gap: 0.7rem;
}

.topic-pillar-card,
.topic-pillar-link {
  display: block;
  min-height: 100%;
  border: 1px solid var(--hairline);
  background: var(--surface);
  color: var(--text);
  text-decoration: none;
}

.topic-pillar-card {
  padding: 0.85rem;
}

.topic-pillar-link {
  padding: 0.7rem;
}

.topic-pillar-card:hover,
.topic-pillar-card:focus-visible,
.topic-pillar-link:hover,
.topic-pillar-link:focus-visible {
  border-color: color-mix(in oklab, var(--accent) 60%, var(--hairline));
  background: color-mix(in oklab, var(--accent) 10%, var(--surface));
}

.topic-pillar-card span,
.topic-pillar-link span {
  display: block;
  font-weight: 800;
}

.topic-pillar-card p {
  margin-top: 0.5rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.topic-pillar-path {
  margin-top: 1rem;
}

.topic-pillar-path > h2 {
  margin-bottom: 0.8rem;
}

.topic-pillar-path-section + .topic-pillar-path-section {
  margin-top: 0.9rem;
}

.topic-pillar-path-section h3 {
  margin-bottom: 0.45rem;
}

.topic-parent {
  margin: 0.8rem 0 0;
  color: var(--muted);
  font-size: 0.76rem;
  font-weight: 700;
}

.next-reading {
  margin: 1.5rem 0 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--hairline);
}

.next-reading-link {
  display: block;
  border: 1px solid var(--hairline);
  background: color-mix(in oklab, var(--surface) 88%, transparent);
  color: var(--text);
  padding: 0.85rem;
  text-decoration: none;
}

.next-reading-link:hover,
.next-reading-link:focus-visible {
  border-color: color-mix(in oklab, var(--accent) 60%, var(--hairline));
  background: color-mix(in oklab, var(--accent) 8%, var(--surface));
}

.next-reading-link span {
  display: block;
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
}

.next-reading-link strong {
  display: block;
  margin-top: 0.4rem;
  font-size: 1.25rem;
}

.next-reading-link p {
  margin: 0.45rem 0 0;
  color: var(--muted);
}

.topic-labels,
.note-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.topic-labels {
  margin: 0.9rem 0 0;
}

.topic-label,
.note-label {
  display: inline-flex;
  align-items: center;
  min-height: 1.35rem;
  border: 1px solid color-mix(in oklab, currentColor 34%, transparent);
  border-radius: 999px;
  padding: 0.12rem 0.48rem;
  background: rgb(212 76 71 / 0.14);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  line-height: 1.1;
}

.portfolio-page .layout {
  max-width: 1400px;
}

.portfolio-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(21rem, 0.62fr);
  gap: 0.75rem;
  min-height: 31rem;
  margin-bottom: 0.75rem;
}

.portfolio-hero-copy,
.portfolio-signal {
  border: 1px solid var(--border);
  background: var(--surface);
}

.portfolio-hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: end;
  padding: clamp(1.2rem, 4vw, 2.4rem);
}

.portfolio-title {
  max-width: 9ch;
  margin: 0;
  font-size: clamp(3rem, 8vw, 6.4rem);
  font-weight: 720;
  line-height: 0.94;
  letter-spacing: 0;
}

.portfolio-positioning {
  max-width: 40rem;
  margin: 1.2rem 0 0;
  color: var(--accent-strong);
  font-weight: 800;
  line-height: 1.55;
}

.portfolio-intro {
  max-width: 48rem;
  margin: 1.2rem 0 0;
  color: var(--muted);
  font-size: clamp(1rem, 1.35vw, 1.18rem);
  line-height: 1.45;
}

.portfolio-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.portfolio-signal {
  position: relative;
  overflow: hidden;
  min-height: 23rem;
  background:
    linear-gradient(120deg, transparent 0 36%, rgb(0 166 111 / 0.22) 36% 38%, transparent 38%),
    linear-gradient(60deg, transparent 0 58%, rgb(255 122 26 / 0.2) 58% 60%, transparent 60%),
    repeating-linear-gradient(90deg, transparent 0 1.6rem, rgb(30 30 30 / 0.09) 1.6rem 1.66rem),
    repeating-linear-gradient(180deg, transparent 0 1.6rem, rgb(30 30 30 / 0.09) 1.6rem 1.66rem),
    var(--surface-soft);
}

.portfolio-signal::before,
.portfolio-signal::after {
  content: "";
  position: absolute;
  pointer-events: none;
}

.portfolio-signal::before {
  inset: 12% 10%;
  border: 1px solid var(--border);
  background:
    linear-gradient(90deg, transparent 49%, var(--border) 49% 51%, transparent 51%),
    linear-gradient(180deg, transparent 49%, var(--border) 49% 51%, transparent 51%);
  opacity: 0.55;
  animation: portfolio-scan 9s ease-in-out infinite;
}

.portfolio-signal::after {
  width: 58%;
  height: 0.8rem;
  left: 16%;
  top: 52%;
  background: linear-gradient(90deg, var(--accent), var(--cyan), var(--green), var(--orange));
  transform: rotate(-18deg);
  animation: portfolio-band 10s linear infinite;
}

.portfolio-signal-label,
.portfolio-signal-node {
  position: absolute;
  z-index: 1;
}

.portfolio-signal-label {
  top: 0.8rem;
  left: 0.8rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text);
}

.portfolio-signal-node {
  width: 4.4rem;
  aspect-ratio: 1;
  border: 1px solid var(--border);
  background: color-mix(in oklab, var(--surface-strong) 68%, transparent);
}

.portfolio-signal-node-a {
  right: 12%;
  top: 18%;
}

.portfolio-signal-node-b {
  left: 14%;
  bottom: 16%;
}

.portfolio-signal-node-c {
  right: 22%;
  bottom: 18%;
  width: 6.2rem;
}

@keyframes portfolio-scan {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(0.85rem);
  }
}

@keyframes portfolio-band {
  0% {
    transform: translateX(-10%) rotate(-18deg);
  }
  50% {
    transform: translateX(10%) rotate(-18deg);
  }
  100% {
    transform: translateX(-10%) rotate(-18deg);
  }
}

.portfolio-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 0.75rem;
  border-top: 1px solid var(--border);
  border-left: 1px solid var(--border);
}

.portfolio-strip div {
  min-height: 8rem;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: color-mix(in oklab, var(--surface) 88%, transparent);
  padding: 1rem;
}

.portfolio-strip span {
  display: block;
  font-family: var(--font-mono);
  font-size: clamp(1.35rem, 3vw, 2rem);
  font-weight: 700;
}

.portfolio-strip p {
  max-width: 18rem;
  margin: 0.65rem 0 0;
  color: var(--muted);
}

.portfolio-section {
  margin-top: 0.75rem;
  padding: clamp(1rem, 3vw, 1.6rem);
}

.portfolio-section-header {
  display: grid;
  grid-template-columns: minmax(10rem, 0.35fr) minmax(0, 1fr);
  gap: 1rem;
  align-items: end;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1rem;
}

.portfolio-section .section-title {
  max-width: 16ch;
  font-size: clamp(1.85rem, 3.7vw, 2.85rem);
  line-height: 1.02;
}

.portfolio-philosophy-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  margin-top: 1rem;
  background: var(--border);
  border: 1px solid var(--border);
}

.portfolio-philosophy-grid p,
.ask-list {
  margin: 0;
  background: var(--surface);
  color: var(--muted);
  padding: clamp(1rem, 2vw, 1.4rem);
  font-size: 1.02rem;
}

.ask-list {
  display: grid;
  gap: 0.7rem;
  list-style: none;
}

.ask-item {
  position: relative;
  padding-left: 1.2rem;
  line-height: 1.55;
}

.ask-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.62rem;
  width: 0.42rem;
  height: 0.42rem;
  border: 1px solid var(--accent-strong);
  background: var(--surface-strong);
}

.utility-page .start-hero {
  padding: clamp(0.9rem, 3vw, 1.8rem) 0;
}

.utility-page .start-hero h1 {
  max-width: 14ch;
  font-size: clamp(2.45rem, 6vw, 4.1rem);
}

.utility-page .portfolio-section-header {
  align-items: start;
}

.utility-page .portfolio-section .section-title {
  max-width: 22ch;
  font-size: clamp(1.7rem, 3.2vw, 2.45rem);
}

.route-proof-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(17rem, 1.08fr);
  gap: 1rem;
  align-items: stretch;
}

.route-proof-layout .portfolio-section-header {
  align-content: end;
  border-bottom: 0;
  padding-bottom: 0;
}

.contact-channel-layout {
  display: grid;
  grid-template-columns: minmax(15rem, 0.58fr) minmax(0, 1.42fr);
  gap: 1rem;
  align-items: stretch;
  margin-top: 1rem;
}

.contact-channel-layout .portfolio-project-grid {
  margin-top: 0;
}

.route-figure {
  position: relative;
  min-height: clamp(15rem, 30vw, 22rem);
  overflow: hidden;
  border: 1px solid var(--border);
  background:
    radial-gradient(circle at 16% 16%, rgb(157 183 255 / 0.16), transparent 28%),
    linear-gradient(90deg, rgb(30 30 30 / 0.06) 1px, transparent 1px),
    linear-gradient(180deg, rgb(30 30 30 / 0.06) 1px, transparent 1px),
    var(--surface-soft);
  background-size: auto, 28px 28px, 28px 28px, auto;
}

.route-figure::before,
.route-figure::after,
.route-figure-grid,
.route-figure-orbit {
  content: "";
  position: absolute;
  pointer-events: none;
}

.route-figure::before {
  inset: 20% -16% auto;
  height: 42%;
  background:
    linear-gradient(90deg, transparent, var(--accent), var(--cyan), var(--orange), transparent);
  opacity: 0.84;
  transform: skewY(-10deg);
  animation: stripe-drift 14s linear infinite;
}

.route-figure::after {
  inset: auto 8% 12% auto;
  width: 36%;
  aspect-ratio: 1;
  border: 1px solid var(--border);
  background:
    linear-gradient(90deg, transparent 49%, var(--border) 49% 51%, transparent 51%),
    linear-gradient(180deg, transparent 49%, var(--border) 49% 51%, transparent 51%);
}

.route-figure-label {
  position: absolute;
  z-index: 1;
  top: 0.75rem;
  left: 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text);
}

.route-figure-grid {
  inset: 3rem 12% 4.5rem;
  border: 1px solid var(--border);
  background:
    repeating-linear-gradient(90deg, transparent 0 1.15rem, rgb(30 30 30 / 0.16) 1.15rem 1.22rem),
    repeating-linear-gradient(180deg, transparent 0 1.15rem, rgb(30 30 30 / 0.16) 1.15rem 1.22rem);
  animation: stripe-grid-pulse 6s ease-in-out infinite;
}

.route-figure-orbit {
  width: clamp(4.6rem, 11vw, 6.6rem);
  height: clamp(4.6rem, 11vw, 6.6rem);
  left: 12%;
  bottom: 12%;
  border: 1px solid var(--border);
  background: rgb(244 244 242 / 0.58);
  animation: stripe-orbit 10s ease-in-out infinite;
}

.route-figure-contact {
  background:
    radial-gradient(circle at 82% 18%, rgb(0 212 255 / 0.14), transparent 29%),
    linear-gradient(90deg, rgb(30 30 30 / 0.06) 1px, transparent 1px),
    linear-gradient(180deg, rgb(30 30 30 / 0.06) 1px, transparent 1px),
    var(--surface-soft);
  background-size: auto, 26px 26px, 26px 26px, auto;
}

.route-figure-contact::before {
  inset: 32% -18% auto;
  height: 31%;
  background:
    linear-gradient(90deg, transparent, var(--green), var(--cyan), var(--accent), transparent);
  transform: skewY(8deg);
}

.route-figure-contact::after {
  inset: 15% auto auto 11%;
  width: 31%;
}

.route-figure-contact .route-figure-orbit {
  right: 13%;
  left: auto;
  bottom: 16%;
}

.portfolio-project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  margin-top: 1rem;
  border-top: 1px solid var(--border);
  border-left: 1px solid var(--border);
}

.portfolio-project {
  position: relative;
  display: block;
  min-height: 17rem;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  padding: 3rem 1rem 1rem;
  text-decoration: none;
  transition: background 160ms ease, color 160ms ease;
}

.portfolio-project::before {
  content: "[" attr(data-index) "]";
  position: absolute;
  top: 0.85rem;
  left: 1rem;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.72rem;
}

.portfolio-project:hover,
.portfolio-project:focus-visible {
  background: var(--text);
  color: var(--bg);
}

.portfolio-project-kind,
.repo-group h3,
.portfolio-quote {
  font-family: var(--font-mono);
}

.portfolio-project-kind {
  color: var(--accent-strong);
  font-size: 0.74rem;
  font-weight: 700;
}

.portfolio-project h3 {
  margin: 0.5rem 0 0;
  font-size: 1.45rem;
  line-height: 1.05;
}

.portfolio-project p {
  margin: 0.85rem 0 0;
  color: var(--muted);
}

.portfolio-project:hover p,
.portfolio-project:focus-visible p,
.portfolio-project:hover .portfolio-project-kind,
.portfolio-project:focus-visible .portfolio-project-kind {
  color: color-mix(in oklab, var(--bg) 72%, transparent);
}

.repo-map {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.repo-group {
  border: 1px solid var(--border);
  background: var(--surface);
  padding: 1rem;
}

.repo-group h3 {
  margin: 0 0 0.8rem;
  font-size: 0.78rem;
}

.repo-group ul {
  display: grid;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.repo-group a {
  display: inline-block;
  color: var(--muted);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.16rem;
}

.repo-group a:hover,
.repo-group a:focus-visible {
  color: var(--text);
}

.portfolio-quote {
  margin-top: 0.75rem;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  padding: 1rem;
  color: var(--text);
  font-size: 0.92rem;
}

.portfolio-quote p {
  margin: 0;
}

.notion-page-content {
  color: var(--text);
  border-top: 1px solid var(--border);
  margin-top: 1.5rem;
  padding-top: 1.25rem;
}

.notion-block {
  min-width: 0;
}

.notion-heading {
  font-family: var(--font-sans);
  font-weight: 720;
  line-height: 1.05;
  margin: 1.5rem 0 0.65rem;
  letter-spacing: 0;
}

.notion-heading-1,
.note-heading-1 {
  font-size: 2rem;
}

.notion-heading-2,
.note-heading-2 {
  font-size: 1.55rem;
}

.notion-heading-3,
.note-heading-3 {
  font-size: 1.28rem;
}

.notion-heading-4,
.notion-heading-5,
.notion-heading-6 {
  font-size: 1.08rem;
}

.notion-paragraph,
.note-paragraph {
  margin: 0.78rem 0;
}

.note-list {
  margin: 0.65rem 0 0.9rem 1.2rem;
  padding: 0;
}

.note-list-item {
  margin: 0.35rem 0;
}

.notion-rich-text {
  border-radius: 2px;
  padding: 0 0.06rem;
}

.notion-color-gray {
  color: #787774;
}

.notion-color-brown {
  color: #9f6b53;
}

.notion-color-orange {
  color: #d9730d;
}

.notion-color-yellow {
  color: #cb912f;
}

.notion-color-green {
  color: #448361;
}

.notion-color-blue {
  color: #337ea9;
}

.notion-color-purple {
  color: #9065b0;
}

.notion-color-pink {
  color: #c14c8a;
}

.notion-color-red {
  color: #d44c47;
}

.notion-color-gray_background,
.notion-color-brown_background,
.notion-color-orange_background,
.notion-color-yellow_background,
.notion-color-green_background,
.notion-color-blue_background,
.notion-color-purple_background,
.notion-color-pink_background,
.notion-color-red_background,
.notion-color-default_background {
  background: rgb(212 76 71 / 0.18);
  color: inherit;
}

.note-inline-code {
  font-family: var(--font-mono);
  background: var(--inline-code-bg);
  border-radius: 2px;
  padding: 0.08rem 0.28rem;
  font-size: 0.92em;
}

.notion-code {
  margin: 1rem 0;
}

.note-code-block {
  margin: 1rem 0;
  background: var(--code-bg);
  color: var(--code-text);
  border-radius: 0;
  padding: 1rem;
  overflow-x: auto;
}

.note-code-block code {
  font-family: var(--font-mono);
  white-space: pre;
}

.notion-caption {
  margin-top: 0.35rem;
  color: var(--muted);
  font-size: 0.88rem;
}

.notion-equation,
.note-inline-equation {
  font-family: "Times New Roman", serif;
}

.note-inline-equation {
  display: inline-block;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  vertical-align: middle;
}

.note-inline-equation mjx-container {
  max-width: 100%;
}

.notion-equation {
  margin: 1rem 0;
  overflow-x: auto;
}

mjx-container[jax="SVG"][display="true"] {
  display: block;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.note-child-database {
  margin: 1rem 0;
  border-left: 3px solid var(--accent);
  background: rgb(99 91 255 / 0.07);
  padding: 0.75rem 0.9rem;
}

.note-child-database h3 {
  margin: 0 0 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  text-transform: uppercase;
}

.notion-quote {
  border-left: 3px solid var(--border);
  margin: 1rem 0;
  padding: 0.3rem 0.9rem;
  color: var(--muted);
}

.notion-divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 1.2rem 0;
}

.notion-table {
  display: block;
  width: 100%;
  margin: 1rem 0;
  border-collapse: collapse;
  overflow-x: auto;
}

.notion-table tbody {
  display: table;
  min-width: 100%;
  border-collapse: collapse;
}

.notion-table th,
.notion-table td {
  border: 1px solid var(--border);
  padding: 0.45rem 0.6rem;
  text-align: left;
  vertical-align: top;
}

.notion-table th {
  background: var(--surface-soft);
  font-weight: 700;
}

.notion-toggle {
  margin: 0.75rem 0;
  border: 1px solid var(--hairline);
  padding: 0.6rem 0.75rem;
  background: rgb(30 30 30 / 0.025);
}

.notion-toggle summary {
  cursor: pointer;
  font-weight: 700;
}

.notion-to-do {
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;
  margin: 0.55rem 0;
}

.notion-to-do-checkbox {
  width: 1rem;
  height: 1rem;
  margin-top: 0.35rem;
  accent-color: var(--accent);
}

.notion-to-do-checked .notion-to-do-body {
  color: var(--muted);
  text-decoration: line-through;
}

.notion-column-list {
  display: flex;
  align-items: stretch;
  gap: 1.2rem;
  margin: 1rem 0;
}

.notion-column {
  flex: var(--notion-column-width, 1) 1 0;
}

.notion-bookmark,
.notion-embed,
.notion-link-preview,
.notion-synced-block,
.notion-template,
.notion-table-of-contents {
  margin: 1rem 0;
  border: 1px solid var(--border);
  border-radius: 0;
  padding: 0.85rem 1rem;
  background: color-mix(in oklab, var(--surface) 92%, transparent);
}

.note-callout {
  display: flex;
  gap: 0.75rem;
  margin: 1rem 0;
  border: 1px solid var(--hairline);
  border-left: 3px solid var(--orange);
  border-radius: 0;
  padding: 0.85rem 1rem;
  background: var(--surface-soft);
}

.note-callout-icon {
  flex: none;
}

.note-callout-body {
  min-width: 0;
}

.note-asset {
  margin: 1rem 0;
}

.note-asset img,
.note-asset video,
.note-asset object {
  display: block;
  max-width: 100%;
  border-radius: 0;
}

.note-child-page {
  margin: 1rem 0;
  border: 1px solid var(--border);
  border-radius: 0;
  background: color-mix(in oklab, var(--surface) 92%, transparent);
}

.note-child-page .note-labels {
  padding: 0 1rem 0.85rem;
}

.note-child-page h3 {
  margin: 0;
  padding: 0.85rem 1rem;
  font-family: var(--font-sans);
  font-size: 1.05rem;
}

.note-child-page-link {
  display: block;
  padding: 0.85rem 1rem;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.86rem;
  font-weight: 700;
  text-decoration: none;
}

.note-child-page-link::after {
  content: " ->";
}

.note-child-page-link:hover,
.note-child-page-link:focus-visible {
  background: var(--text);
  color: var(--bg);
}

.topic-nav {
  margin: 0 0 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.topic-nav a.active {
  background: var(--text);
  color: var(--bg);
}

.topic-nav a.active[data-hotkey]::before {
  color: color-mix(in oklab, var(--bg) 72%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  .home-showcase {
    scroll-snap-type: none;
  }

  .home-showcase-section > .home-showcase-copy,
  .home-showcase-section > .home-visual,
  .home-showcase-cards,
  .home-explore-band {
    position: static;
  }

  .home-showcase-motion .home-showcase-copy,
  .home-showcase-motion .home-showcase-cards,
  .home-showcase-motion .home-explore-band,
  .home-showcase-motion .home-visual,
  .home-showcase-motion .home-showcase-contact .portfolio-philosophy-grid,
  .home-showcase-motion .home-showcase-contact .subscribe-panel {
    opacity: 1 !important;
    transform: none !important;
  }

  .home-showcase-motion .home-showcase-cards .topic-card {
    transform: none !important;
  }

  .home-visual-thread {
    stroke-dashoffset: 0 !important;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}

@media (max-width: 820px) {
  .layout {
    padding: 0.65rem 0.65rem 3rem;
  }

  .site-header {
    top: auto;
    max-width: 100%;
  }

  .site-header,
  .topic-hub-header {
    align-items: start;
    flex-direction: column;
  }

  .site-links {
    justify-content: start;
    max-width: 100%;
  }

  .home-showcase {
    scroll-snap-type: none;
  }

  .home-showcase-rail {
    display: none;
  }

  .home-showcase-section,
  .home-showcase-hero,
  .home-explore-band {
    grid-template-columns: 1fr;
  }

  .home-showcase::before,
  .home-showcase::after {
    display: none;
  }

  .home-showcase-section {
    min-height: auto;
    padding: 1rem;
    overflow: clip;
  }

  .home-showcase-hero {
    min-height: auto;
  }

  .home-showcase-section:not(.home-showcase-hero) .home-showcase-cards {
    grid-column: auto;
    grid-row: auto;
    margin-top: 0;
    overflow: clip;
  }

  .home-showcase-research .topic-card:nth-child(2),
  .home-showcase-research .topic-card:nth-child(3) {
    margin-left: 0;
  }

  .home-showcase-section.home-showcase-projects .home-showcase-cards,
  .home-showcase-section.home-showcase-writing .home-showcase-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .home-showcase-section.home-showcase-research .home-showcase-cards {
    grid-template-columns: 1fr;
  }

  .home-showcase-projects .topic-card,
  .home-showcase-projects .topic-card:nth-child(2),
  .home-showcase-projects .topic-card:nth-child(3) {
    min-height: 7rem;
    transform: none;
  }

  .home-showcase-writing .home-showcase-cards {
    padding-block: 0;
    border: 0;
  }

  .home-showcase-section > .home-showcase-copy,
  .home-showcase-section > .home-visual,
  .home-showcase-cards,
  .home-explore-band {
    position: static;
  }

  .home-showcase-motion .home-showcase-copy .home-kicker,
  .home-showcase-motion .home-showcase-copy .section-kicker,
  .home-showcase-motion .home-showcase-copy .home-title,
  .home-showcase-motion .home-showcase-copy .section-title,
  .home-showcase-motion .home-showcase-copy .home-intro,
  .home-showcase-motion .home-showcase-copy .home-actions,
  .home-showcase-motion .home-showcase-copy .topic-index-link,
  .home-showcase-motion .home-showcase-cards,
  .home-showcase-motion .home-explore-band,
  .home-showcase-motion .home-visual,
  .home-showcase-motion .home-showcase-contact .portfolio-philosophy-grid,
  .home-showcase-motion .home-showcase-contact .subscribe-panel,
  .home-showcase-motion .home-showcase-cards .topic-card,
  .home-showcase-motion .home-explore-band .topic-card {
    opacity: 1 !important;
    transform: none !important;
  }

  .home-showcase-hero .home-title {
    max-width: 100%;
    font-size: clamp(1.85rem, 11vw, 3.85rem);
    line-height: 0.92;
  }

  .home-visual svg {
    min-height: 16rem;
  }

  .home-showcase-section:not(.home-showcase-hero) .home-visual {
    display: none;
  }

  .home-showcase-section .topic-grid {
    grid-template-columns: 1fr;
  }

  .home-showcase-section .topic-card {
    min-height: auto;
    padding: 2.35rem 0.7rem 0.7rem;
  }

  .home-showcase-section .topic-card-title {
    font-size: 0.92rem;
  }

  .home-showcase-section .topic-card-description {
    font-size: 0.76rem;
    line-height: 1.36;
  }

  .section-title {
    font-size: clamp(1.75rem, 9vw, 2.85rem);
    line-height: 1;
  }

  .site-title {
    font-size: clamp(2rem, 11vw, 3.6rem);
  }

  .portfolio-hero,
  .portfolio-section-header,
  .route-proof-layout,
  .contact-channel-layout,
  .portfolio-philosophy-grid,
  .repo-map,
  .home-bio,
  .home-featured,
  .research-grid,
  .errata-copy,
  .subscribe-route,
  .site-footer,
  .start-path,
  .subscribe-panel {
    grid-template-columns: 1fr;
  }

  .home-bio-actions {
    justify-content: start;
  }

  .route-proof-layout .portfolio-section-header {
    border-bottom: 1px solid var(--border);
    padding-bottom: 1rem;
  }

  .route-figure {
    min-height: 15rem;
  }

  .research-topic {
    min-height: auto;
  }

  .footer-links {
    justify-content: start;
  }

  .subscribe-route-actions {
    justify-content: start;
  }

  .subscribe-actions {
    justify-content: start;
  }

  .portfolio-hero {
    min-height: auto;
  }

  .portfolio-signal {
    min-height: 17rem;
  }

  .portfolio-strip {
    grid-template-columns: 1fr;
  }

  .notes-panel {
    padding: 1rem;
  }

  .notion-column-list {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 520px) {
  .home-showcase-section.home-showcase-projects .home-showcase-cards,
  .home-showcase-section.home-showcase-writing .home-showcase-cards,
  .home-showcase-section .topic-grid {
    grid-template-columns: 1fr;
  }
}

/* === Blog === */
.blog-page { --blog-accent: #e85d04; --blog-accent-soft: rgb(232 93 4 / 0.12); }
@media (prefers-color-scheme: dark) { .blog-page { --blog-accent: #fb923c; --blog-accent-soft: rgb(251 146 60 / 0.12); } }

.blog-hero { padding: 3rem 2rem 2rem; text-align: center; border-bottom: 1px solid var(--hairline); }
.blog-hero .blog-kicker { font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--blog-accent); margin: 0 0 0.5rem; }
.blog-hero .blog-title { font-family: Georgia, "Times New Roman", serif; font-size: clamp(2rem, 5vw, 3rem); font-weight: 700; margin: 0 0 0.5rem; color: var(--text); }
.blog-hero .blog-subtitle { font-size: 1rem; color: var(--muted); margin: 0; max-width: 36rem; margin-inline: auto; }

.blog-home-content { max-width: 44rem; margin: 2rem auto; padding: 0 1.5rem; }
.blog-home-content .blog-article { color: var(--text); line-height: 1.7; }
.blog-home-content .blog-article img { max-width: 100%; height: auto; border-radius: 6px; margin: 1rem 0; }

.blog-toc { max-width: 44rem; margin: 0 auto 3rem; padding: 0 1.5rem; }
.blog-section-group { margin-bottom: 2.5rem; }
.blog-section-heading { font-family: Georgia, "Times New Roman", serif; font-size: 1.4rem; font-weight: 700; color: var(--text); margin: 0 0 0.25rem; border-left: 3px solid var(--blog-accent); padding-left: 0.75rem; }
.blog-section-subtitle { font-size: 0.85rem; color: var(--muted); font-style: italic; margin: 0 0 1rem; padding-left: calc(0.75rem + 3px); }
.blog-post-list { list-style: none; padding: 0; margin: 0; }
.blog-post-list li { margin-bottom: 0.5rem; }
.blog-post-link { display: flex; align-items: baseline; gap: 0.5rem; padding: 0.6rem 0.75rem; border-radius: 6px; text-decoration: none; color: var(--text); transition: background 0.15s; }
.blog-post-link:hover { background: var(--blog-accent-soft); }
.blog-post-link .blog-post-chapter { font-family: var(--font-mono); font-size: 0.75rem; color: var(--blog-accent); min-width: 1.5rem; }
.blog-post-link .blog-post-title { font-size: 1rem; }

.blog-reading-panel { max-width: 44rem; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
.blog-reading-panel .blog-back { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.85rem; color: var(--muted); text-decoration: none; margin-bottom: 1.5rem; }
.blog-reading-panel .blog-back:hover { color: var(--blog-accent); }
.blog-reading-panel .blog-post-header { margin-bottom: 2rem; border-bottom: 1px solid var(--hairline); padding-bottom: 1.5rem; }
.blog-reading-panel .blog-post-header h1 { font-family: Georgia, "Times New Roman", serif; font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 700; margin: 0 0 0.3rem; }
.blog-reading-panel .blog-post-header .blog-post-section { font-size: 0.8rem; font-family: var(--font-mono); color: var(--blog-accent); }
.blog-reading-panel .blog-article { color: var(--text); line-height: 1.8; }
.blog-reading-panel .blog-article h1, .blog-reading-panel .blog-article h2, .blog-reading-panel .blog-article h3 { font-family: Georgia, "Times New Roman", serif; margin-top: 2rem; }
.blog-reading-panel .blog-article img { max-width: 100%; height: auto; border-radius: 6px; margin: 1.5rem 0; }
.blog-reading-panel .blog-article blockquote { border-left: 3px solid var(--blog-accent); margin: 1.5rem 0; padding: 0.5rem 1rem; color: var(--muted); font-style: italic; }
.blog-reading-panel .blog-article em { color: var(--muted); }
.blog-reading-panel .blog-article strong { color: var(--text); }
.blog-reading-panel .blog-article ul, .blog-reading-panel .blog-article ol { padding-left: 1.5rem; }

.blog-post-nav { display: flex; justify-content: space-between; margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--hairline); }
.blog-post-nav a { font-size: 0.85rem; color: var(--blog-accent); text-decoration: none; }
.blog-post-nav a:hover { text-decoration: underline; }
`;

module.exports = {
  SITE_CSS,
};
