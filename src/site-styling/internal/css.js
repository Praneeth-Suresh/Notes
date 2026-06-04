"use strict";

const SITE_CSS = `
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
    --inline-code-bg: rgb(241 241 237 / 0.09);
    --code-bg: #060b12;
  }
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
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
  margin: 0 auto;
  padding: 0.75rem 0.75rem 4.5rem;
}

.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 3rem;
  margin-bottom: 0.95rem;
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
.site-links a::before,
.topic-nav a::before,
.primary-action::before,
.secondary-action::before {
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
  margin: 0 0 3rem;
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
  max-width: 11ch;
  font-size: clamp(3rem, 11vw, 8.75rem);
  line-height: 0.84;
  color: var(--text);
}

.home-intro {
  max-width: 42rem;
  margin: 1.25rem 0 0;
  color: var(--muted);
  font-size: clamp(1.02rem, 1.7vw, 1.35rem);
  line-height: 1.35;
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
  padding: clamp(1rem, 3vw, 1.6rem);
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

.section-title {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  line-height: 0.9;
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

.topic-card {
  position: relative;
  display: block;
  min-height: 11rem;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: color-mix(in oklab, var(--surface) 88%, transparent);
  padding: 2.1rem 1rem 1rem;
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

.topic-parent {
  margin: 0.8rem 0 0;
  color: var(--muted);
  font-size: 0.76rem;
  font-weight: 700;
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
  font-size: clamp(3.3rem, 10vw, 8.2rem);
  font-weight: 720;
  line-height: 0.86;
  letter-spacing: 0;
}

.portfolio-intro {
  max-width: 48rem;
  margin: 1.2rem 0 0;
  color: var(--muted);
  font-size: clamp(1.02rem, 1.7vw, 1.35rem);
  line-height: 1.35;
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
  font-size: clamp(2.2rem, 5vw, 4rem);
}

.portfolio-philosophy-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  margin-top: 1rem;
  background: var(--border);
  border: 1px solid var(--border);
}

.portfolio-philosophy-grid p {
  margin: 0;
  background: var(--surface);
  color: var(--muted);
  padding: clamp(1rem, 2vw, 1.4rem);
  font-size: 1.02rem;
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

.notion-equation {
  margin: 1rem 0;
  overflow-x: auto;
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

.topic-nav a.active::before {
  color: color-mix(in oklab, var(--bg) 72%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
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

  .site-header,
  .topic-hub-header {
    align-items: start;
    flex-direction: column;
  }

  .site-links {
    justify-content: start;
  }

  .home-hero {
    grid-template-columns: 1fr;
    min-height: auto;
    margin-bottom: 1.5rem;
  }

  .stripe-field {
    min-height: 16rem;
  }

  .section-title {
    font-size: clamp(2.2rem, 15vw, 4rem);
  }

  .site-title {
    font-size: clamp(2.4rem, 15vw, 4.8rem);
  }

  .portfolio-hero,
  .portfolio-section-header,
  .portfolio-philosophy-grid,
  .repo-map {
    grid-template-columns: 1fr;
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
