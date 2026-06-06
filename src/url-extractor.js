// URL extraction utilities for Copy Multi URLs
// Works in content scripts (classic script, no ES module imports)

const URL_REGEX = /https?:\/\/[^\s<>"'`{}\[\]|\\^]+/gi;
const URL_CLEANUP = /[.,;:!?)\]}'"]+$/;

/**
 * Extract URLs from a plain text string.
 * @param {string} text
 * @returns {string[]} deduplicated URLs
 */
function extractURLsFromText(text) {
  if (!text || typeof text !== 'string') return [];

  const matches = text.match(URL_REGEX) || [];

  // Clean trailing punctuation that isn't part of the URL & deduplicate
  const seen = new Set();
  const result = [];
  for (const url of matches) {
    const cleaned = url.replace(URL_CLEANUP, '');
    if (!seen.has(cleaned)) {
      seen.add(cleaned);
      result.push(cleaned);
    }
  }
  return result;
}

/**
 * Extract href attributes from <a> elements within a DOM Selection range.
 * @param {Selection} selection - window.getSelection() result
 * @returns {string[]} deduplicated absolute URLs
 */
function extractURLsFromAnchors(selection) {
  if (!selection || selection.isCollapsed) return [];

  const range = selection.getRangeAt(0);
  if (!range) return [];

  const urls = [];

  try {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (node.nodeName !== 'A') return NodeFilter.FILTER_SKIP;
          return range.intersectsNode(node)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP;
        }
      }
    );

    const seen = new Set();
    while (walker.nextNode()) {
      const href = walker.currentNode.href;
      if (href && /^https?:\/\//i.test(href) && !seen.has(href)) {
        seen.add(href);
        urls.push(href);
      }
    }
  } catch (_err) {
    // Selection range may be invalid (e.g., across shadow DOM boundaries)
  }

  return urls;
}

/**
 * Extract all URLs from the current page selection (text + anchors).
 * @returns {{ urls: string[], count: number }}
 */
function getAllURLsFromSelection() {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    return { urls: [], count: 0 };
  }

  const seen = new Set();
  const urls = [];

  // Plain-text URLs
  for (const url of extractURLsFromText(selection.toString())) {
    if (!seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }

  // Anchor hrefs within selection
  for (const url of extractURLsFromAnchors(selection)) {
    if (!seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }

  return { urls, count: urls.length };
}

// Expose for content script usage (classic script global)
if (typeof window !== 'undefined') {
  window.CopyMultiURLs = {
    extractURLsFromText,
    extractURLsFromAnchors,
    getAllURLsFromSelection
  };
}

// Also export for Node.js test runners
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    extractURLsFromText,
    extractURLsFromAnchors,
    getAllURLsFromSelection
  };
}
