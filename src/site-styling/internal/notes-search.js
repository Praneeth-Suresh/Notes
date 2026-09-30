"use strict";

// site-styling: client-side ranking and snippets for the Notes search.
//
// These functions run in the browser (their source is embedded in /notes/) and in
// Node tests. They must stay self-contained: no references to outer scope.

function rankSearchEntries(entries, query, limit) {
  const normalizedQuery = String(query || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9+#]+/g, " ").trim();
  if (!normalizedQuery) {
    return [];
  }
  const terms = normalizedQuery.split(" ").filter(Boolean);
  const norm = (value) => String(value || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9+#]+/g, " ").trim();
  const aliasesOf = (title) => {
    const raw = String(title || "");
    const list = (raw.match(/\(([^)]+)\)/g) || []).map(norm);
    list.push(norm(raw.replace(/\([^)]*\)/g, "")));
    return list.filter(Boolean);
  };
  const countOccurrences = (haystack, needle) => {
    let count = 0;
    let index = haystack.indexOf(needle);
    while (index !== -1 && count < 50) {
      count += 1;
      index = haystack.indexOf(needle, index + needle.length);
    }
    return count;
  };

  const scored = [];
  for (const entry of entries) {
    const title = norm(entry.title);
    const titleWords = title.split(" ");
    const aliases = aliasesOf(entry.title);
    const context = norm(`${entry.parentTitle || ""} ${entry.topicTitle || ""}`);
    const body = norm(entry.searchableText);
    let score = 0;

    if (title === normalizedQuery || aliases.includes(normalizedQuery)) {
      score += 1000;
    } else if (title.startsWith(normalizedQuery) || aliases.some((alias) => alias.startsWith(normalizedQuery))) {
      score += 600;
    }

    let allTermsFound = true;
    let titleTermHits = 0;
    for (const term of terms) {
      const inTitle = titleWords.some((word) => word.startsWith(term)) || aliases.some((alias) => alias.split(" ").some((word) => word.startsWith(term)));
      const inContext = context.includes(term);
      const bodyCount = countOccurrences(body, term);
      if (!inTitle && !inContext && bodyCount === 0) {
        allTermsFound = false;
        break;
      }
      if (inTitle) {
        titleTermHits += 1;
      }
      if (inContext) {
        score += 30;
      }
      score += Math.min(40, 8 * Math.log2(1 + bodyCount));
    }
    if (!allTermsFound) {
      continue;
    }
    if (titleTermHits === terms.length) {
      score += 300;
    } else {
      score += 80 * titleTermHits;
    }
    if (terms.length > 1 && body.includes(normalizedQuery)) {
      score += 30;
    }
    if (!entry.parentTitle) {
      score += 5;
    }
    scored.push({ entry, score });
  }

  scored.sort((a, b) =>
    b.score - a.score ||
    String(a.entry.title).length - String(b.entry.title).length ||
    String(a.entry.title).localeCompare(String(b.entry.title)),
  );
  return scored.slice(0, limit || 50).map((item) => item.entry);
}

function buildSearchSnippet(entry, query, radius) {
  const text = String(entry.searchableText || "");
  const width = radius || 90;
  const terms = String(query || "").toLowerCase().split(/[^a-z0-9+#]+/).filter((term) => term.length > 1);
  const lower = text.toLowerCase();
  // Skip the title/description prefix that search entries start with.
  let skip = 0;
  for (const prefix of [String(entry.title || ""), String(entry.description || "")]) {
    const candidate = lower.slice(skip).trimStart();
    if (prefix && candidate.startsWith(prefix.toLowerCase())) {
      skip = lower.length - candidate.length + prefix.length;
    }
  }
  let index = -1;
  const phrase = String(query || "").toLowerCase().trim();
  if (phrase) {
    index = lower.indexOf(phrase, skip);
  }
  for (const term of terms) {
    if (index !== -1) {
      break;
    }
    index = lower.indexOf(term, skip);
  }
  if (index === -1) {
    const fallback = String(entry.description || text.slice(skip, skip + width * 2)).trim();
    return { text: fallback.length > width * 2 ? `${fallback.slice(0, width * 2)}…` : fallback, terms };
  }
  let start = Math.max(skip, index - Math.floor(width * 0.6));
  let end = Math.min(text.length, index + width * 1.4);
  if (start > skip) {
    const space = text.indexOf(" ", start);
    start = space !== -1 && space < index ? space + 1 : start;
  }
  if (end < text.length) {
    const space = text.lastIndexOf(" ", end);
    end = space > index ? space : end;
  }
  return {
    text: `${start > skip ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`,
    terms,
  };
}

module.exports = {
  buildSearchSnippet,
  rankSearchEntries,
};
