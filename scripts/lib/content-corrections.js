"use strict";

// pages-build: apply checked-in content corrections to normalized topic documents.
//
// Corrections are keyed by Notion blockId and guarded by the exact original text
// ("match"). They are applied to an in-memory copy at build time, so the normalized
// ingestion output is never rewritten and a fresh Notion pull cannot silently undo a
// correction. If the source text changes (for example because the fix was made in
// Notion), the guard fails the build so the maintainer can retire the override.

const { normalizeWhitespace, plainTextOf, segmentsToRichText } = require("./rich-text");

// "Wording" entries fix typos or broken sentences that do not change a claim. Following the
// correction policy they are applied silently: not listed on /errata/.
const ENTRY_KINDS = new Set(["Correction", "Clarification", "Removal", "Wording"]);
const EDIT_ACTIONS = new Set(["replace", "remove", "retitle"]);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;
const ID_PATTERN = /^[a-z0-9-]+$/u;

function assertString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

function validateCorrections(data) {
  if (!data || typeof data !== "object" || !Array.isArray(data.entries)) {
    throw new Error("Corrections sidecar must be an object with an entries array.");
  }

  const seenEntryIds = new Set();
  const seenBlockIds = new Set();

  return data.entries.map((entry, index) => {
    const label = `corrections.entries[${index}]`;
    const id = assertString(entry?.id, `${label}.id`);
    if (!ID_PATTERN.test(id)) {
      throw new Error(`${label}.id "${id}" must use lowercase letters, digits, and hyphens.`);
    }
    if (seenEntryIds.has(id)) {
      throw new Error(`Duplicate correction id "${id}".`);
    }
    seenEntryIds.add(id);

    const date = assertString(entry.date, `${label}.date`);
    if (!DATE_PATTERN.test(date)) {
      throw new Error(`${label}.date must use YYYY-MM-DD.`);
    }
    const kind = assertString(entry.kind, `${label}.kind`);
    if (!ENTRY_KINDS.has(kind)) {
      throw new Error(`${label}.kind must be one of ${[...ENTRY_KINDS].join(", ")}.`);
    }
    if (!Array.isArray(entry.edits) || entry.edits.length === 0) {
      throw new Error(`${label}.edits must be a non-empty array.`);
    }

    const edits = entry.edits.map((edit, editIndex) => {
      const editLabel = `${label}.edits[${editIndex}]`;
      const blockId = assertString(edit?.blockId, `${editLabel}.blockId`).toLowerCase();
      if (seenBlockIds.has(blockId)) {
        throw new Error(`Block ${blockId} is corrected more than once.`);
      }
      seenBlockIds.add(blockId);
      const action = assertString(edit.action, `${editLabel}.action`);
      if (!EDIT_ACTIONS.has(action)) {
        throw new Error(`${editLabel}.action must be replace, remove, or retitle.`);
      }
      if (typeof edit.match !== "string") {
        throw new Error(`${editLabel}.match must be the block's current text (empty string for blocks without text).`);
      }
      if (action !== "remove" && edit.match.trim() === "") {
        throw new Error(`${editLabel}.match must be non-empty for ${action} edits.`);
      }
      if (action === "retitle" && (typeof edit.title !== "string" || edit.title.trim() === "")) {
        throw new Error(`${editLabel}.title is required for retitle edits.`);
      }
      return {
        blockId,
        action,
        match: normalizeWhitespace(edit.match),
        richText: action === "replace" ? segmentsToRichText(edit.richText, `${editLabel}.richText`) : null,
        title: action === "retitle" ? edit.title.trim() : null,
      };
    });

    return {
      id,
      date,
      kind,
      topic: assertString(entry.topic, `${label}.topic`),
      noteId: assertString(entry.noteId, `${label}.noteId`),
      summary: assertString(entry.summary, `${label}.summary`),
      original: typeof entry.original === "string" ? entry.original.trim() : "",
      corrected: typeof entry.corrected === "string" ? entry.corrected.trim() : "",
      edits,
    };
  });
}

function cloneBlocks(blocks) {
  return JSON.parse(JSON.stringify(blocks));
}

/**
 * Returns a corrected deep copy of topicDocument. Throws when any edit for this topic
 * cannot find its block or its guarded original text.
 */
function applyCorrectionsToTopic({ topicSlug, topicDocument, corrections }) {
  const edits = corrections
    .filter((entry) => entry.topic === topicSlug)
    .flatMap((entry) => entry.edits.map((edit) => ({ ...edit, entryId: entry.id })));

  if (edits.length === 0) {
    return topicDocument;
  }

  const blocks = cloneBlocks(topicDocument.blocks);
  const pending = new Map(edits.map((edit) => [edit.blockId, edit]));

  function walk(list) {
    for (let index = 0; index < list.length; index += 1) {
      const block = list[index];
      const key = typeof block?.blockId === "string" ? block.blockId.toLowerCase() : null;
      const edit = key ? pending.get(key) : null;

      if (edit) {
        const current = normalizeWhitespace(
          edit.action === "retitle" ? block.title ?? "" : plainTextOf(block.richText),
        );
        if (current !== edit.match) {
          throw new Error(
            `Correction "${edit.entryId}" expected block ${edit.blockId} in topic "${topicSlug}" to read "${edit.match}" but found "${current}". Update or retire the correction.`,
          );
        }
        pending.delete(key);
        if (edit.action === "remove") {
          list.splice(index, 1);
          index -= 1;
          continue;
        }
        if (edit.action === "retitle") {
          if (block.type !== "child_page") {
            throw new Error(`Correction "${edit.entryId}" retitles block ${edit.blockId}, which is not a child page.`);
          }
          block.title = edit.title;
        } else {
          block.richText = edit.richText;
        }
      }

      if (Array.isArray(block?.children)) {
        walk(block.children);
      }
    }
  }

  walk(blocks);

  if (pending.size > 0) {
    const missing = [...pending.values()].map((edit) => `${edit.entryId}:${edit.blockId}`);
    throw new Error(`Corrections target blocks missing from topic "${topicSlug}": ${missing.join(", ")}.`);
  }

  return { ...topicDocument, blocks };
}

module.exports = {
  applyCorrectionsToTopic,
  validateCorrections,
};
