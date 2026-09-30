"use strict";

// pages-build: choose a reasoned "next reading" link for every note route.
//
// Order of preference:
//   1. an explicit curated `next` in the publication sidecar (href + reason);
//   2. the following step of the topic's curated reading path (topic-manifest pillar);
//   3. for a topic root, the first step of its reading path or its first child note;
//   4. the next sibling under the same parent, else a link back to the parent.
// It never jumps across unrelated parts of the archive.

function flattenReadingPath(pillar) {
  if (!pillar || !Array.isArray(pillar.readingPath)) {
    return [];
  }
  const steps = [];
  for (const section of pillar.readingPath) {
    for (const link of section.links || []) {
      steps.push({ href: link.href, title: link.title, label: section.label });
    }
  }
  return steps;
}

function computeNextReadings({ topic, records, recordsByUrl }) {
  const steps = flattenReadingPath(topic.pillar);
  const childrenByParent = new Map();
  for (const record of records) {
    if (!record.parentUrlPath) {
      continue;
    }
    if (!childrenByParent.has(record.parentUrlPath)) {
      childrenByParent.set(record.parentUrlPath, []);
    }
    childrenByParent.get(record.parentUrlPath).push(record);
  }

  const resolve = (href) => {
    const target = recordsByUrl.get(href.split("#")[0]);
    return target ? { title: target.title, urlPath: href, publication: target.publication } : null;
  };

  const result = new Map();
  for (const record of records) {
    let next = null;

    const curated = record.publication?.next;
    if (curated && typeof curated.href === "string") {
      const target = resolve(curated.href);
      if (!target) {
        throw new Error(`Curated next link ${curated.href} for ${record.urlPath} does not resolve to a note.`);
      }
      next = { ...target, reason: curated.reason };
    }

    if (!next) {
      const index = steps.findIndex((step) => step.href === record.urlPath);
      if (index !== -1 && index + 1 < steps.length) {
        const step = steps[index + 1];
        const target = resolve(step.href);
        next = target
          ? { ...target, reason: `Next step in the ${topic.title} reading path (${step.label}).` }
          : step.href.startsWith("/")
            ? { title: step.title, urlPath: step.href, publication: null, reason: `Next step in the ${topic.title} reading path (${step.label}).` }
            : null;
      }
    }

    if (!next && !record.parentUrlPath) {
      const firstStep = steps.map((step) => resolve(step.href)).find(Boolean);
      const firstChild = (childrenByParent.get(record.urlPath) || [])[0];
      if (firstStep) {
        next = { ...firstStep, reason: `First step in the ${topic.title} reading path.` };
      } else if (firstChild) {
        next = { ...resolve(firstChild.urlPath), reason: `First note in ${topic.title}.` };
      }
    }

    if (!next && record.parentUrlPath) {
      const siblings = childrenByParent.get(record.parentUrlPath) || [];
      const position = siblings.indexOf(record);
      const sibling = siblings[position + 1];
      next = sibling
        ? { ...resolve(sibling.urlPath), reason: `Next note in ${record.parentTitle}.` }
        : { ...resolve(record.parentUrlPath), reason: `Last note in this section; return to ${record.parentTitle} for the full list.` };
    }

    result.set(record.urlPath, next);
  }

  return result;
}

module.exports = {
  computeNextReadings,
  flattenReadingPath,
};
