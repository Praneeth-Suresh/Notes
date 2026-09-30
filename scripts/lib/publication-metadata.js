"use strict";

// pages-build: publication metadata sidecar.
//
// Every public note route (topic root or nested child page) must have exactly one entry
// keyed by its stable Notion id: the root page id for topic roots, or the child page
// blockId for nested notes. Ids are compared case-insensitively without dashes.
// Nothing here ever promotes a note: "Reviewed note" must be written by hand together
// with a reviewedAt date.

const STATUSES = Object.freeze({
  "Working note": {
    slug: "working",
    summary: "Open notebook entry: incomplete or not yet checked. Known factual errors are still corrected.",
  },
  "Reviewed note": {
    slug: "reviewed",
    summary: "Praneeth checked the claims, examples, links, and layout on the review date. This is not peer review.",
  },
  Archived: {
    slug: "archived",
    summary: "Kept for reference but no longer maintained.",
  },
});

const CONTENT_TYPES = new Set([
  "Topic overview",
  "Explainer",
  "Worked guide",
  "Reference list",
  "Study plan",
  "Reading bookmark",
  "Stub",
]);

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;

function normalizeNoteId(value) {
  if (typeof value !== "string") {
    return null;
  }
  const compact = value.trim().toLowerCase().replaceAll("-", "");
  return /^[a-f0-9]{32}$/u.test(compact) ? compact : null;
}

function validateDate(value, label) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    throw new Error(`${label} must use YYYY-MM-DD.`);
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(`${label} must be a valid calendar date.`);
  }
  return value;
}

function validateStringList(value, label) {
  if (value == null) {
    return [];
  }
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new Error(`${label} must be an array of non-empty strings.`);
  }
  return value.map((item) => item.trim());
}

function validateRelated(value, label) {
  if (value == null) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }
  return value.map((link, index) => {
    const href = typeof link?.href === "string" ? link.href.trim() : "";
    const reason = typeof link?.reason === "string" ? link.reason.trim() : "";
    if (!href.startsWith("/topics/")) {
      throw new Error(`${label}[${index}].href must be a /topics/... note route.`);
    }
    if (reason === "") {
      throw new Error(`${label}[${index}].reason is required: say why the link is worth following.`);
    }
    return { href, reason };
  });
}

function validatePublicationSidecar(data) {
  if (!data || typeof data !== "object" || !Array.isArray(data.notes)) {
    throw new Error("Publication sidecar must be an object with a notes array.");
  }

  const byId = new Map();
  data.notes.forEach((raw, index) => {
    const label = `publication.notes[${index}]`;
    const id = normalizeNoteId(raw?.id);
    if (!id) {
      throw new Error(`${label}.id must be a Notion page or block id.`);
    }
    if (byId.has(id)) {
      throw new Error(`Duplicate publication entry for note id ${raw.id} (${label} and ${byId.get(id).label}).`);
    }

    const status = raw.status;
    if (!Object.hasOwn(STATUSES, status)) {
      throw new Error(`${label}.status must be one of: ${Object.keys(STATUSES).join(", ")}.`);
    }
    const contentType = raw.contentType;
    if (!CONTENT_TYPES.has(contentType)) {
      throw new Error(`${label}.contentType must be one of: ${[...CONTENT_TYPES].join(", ")}.`);
    }

    let reviewedAt = null;
    if (raw.reviewedAt != null) {
      reviewedAt = validateDate(raw.reviewedAt, `${label}.reviewedAt`);
    }
    if (status === "Reviewed note" && !reviewedAt) {
      throw new Error(`${label} is a Reviewed note and needs reviewedAt.`);
    }
    if (status === "Working note" && reviewedAt) {
      throw new Error(`${label} is a Working note and must not carry reviewedAt.`);
    }

    const archiveReason = typeof raw.archiveReason === "string" ? raw.archiveReason.trim() : "";
    if (status === "Archived" && archiveReason === "") {
      throw new Error(`${label} is Archived and needs archiveReason.`);
    }
    if (status !== "Archived" && archiveReason !== "") {
      throw new Error(`${label} has archiveReason but is not Archived.`);
    }

    if (typeof raw.route !== "string" || !raw.route.startsWith("/topics/")) {
      throw new Error(`${label}.route must be the note's /topics/... path.`);
    }

    byId.set(id, {
      label,
      id,
      route: raw.route,
      status,
      statusSlug: STATUSES[status].slug,
      statusSummary: STATUSES[status].summary,
      contentType,
      reviewedAt,
      knownGaps: validateStringList(raw.knownGaps, `${label}.knownGaps`),
      related: validateRelated(raw.related, `${label}.related`),
      next: raw.next == null ? null : validateRelated([raw.next], `${label}.next`)[0],
      archiveReason: archiveReason || null,
    });
  });

  return byId;
}

/**
 * Attach publication metadata to page records. Fails when any route lacks an entry,
 * when an entry does not match any route, or when an entry's route disagrees with the
 * generated route for its id.
 */
function joinPublication({ pageRecords, sidecar }) {
  const missing = [];
  const mismatched = [];
  const used = new Set();
  const routeSet = new Set(pageRecords.map((record) => record.urlPath));

  const joined = pageRecords.map((record) => {
    const id = normalizeNoteId(record.noteId);
    const entry = id ? sidecar.get(id) : null;
    if (!entry) {
      missing.push(`${record.urlPath} (${record.noteId ?? "no id"})`);
      return record;
    }
    used.add(id);
    if (entry.route !== record.urlPath) {
      mismatched.push(`${entry.route} -> generated ${record.urlPath}`);
    }
    return { ...record, publication: entry };
  });

  const unknown = [...sidecar.keys()].filter((id) => !used.has(id));
  const problems = [];
  if (missing.length > 0) {
    problems.push(`missing publication entries for: ${missing.join("; ")}`);
  }
  if (unknown.length > 0) {
    problems.push(`publication entries with no matching note: ${unknown.join(", ")}`);
  }
  if (mismatched.length > 0) {
    problems.push(`publication routes out of date: ${mismatched.join("; ")}`);
  }
  if (problems.length > 0) {
    throw new Error(`Publication sidecar is inconsistent: ${problems.join(" | ")}`);
  }

  for (const entry of sidecar.values()) {
    for (const link of [...entry.related, ...(entry.next ? [entry.next] : [])]) {
      if (!routeSet.has(link.href.split("#")[0])) {
        throw new Error(`${entry.label} related link ${link.href} does not resolve to a note route.`);
      }
    }
  }

  return joined;
}

module.exports = {
  CONTENT_TYPES,
  STATUSES,
  joinPublication,
  normalizeNoteId,
  validatePublicationSidecar,
};
