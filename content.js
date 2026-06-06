// Content script for Copy Multi URLs
// Extracts URLs from page selections when requested by the background script

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== 'getSelectedURLs') return;

  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    sendResponse({ urls: [], count: 0 });
    return;
  }

  const urls = new Set();
  const selectedText = selection.toString();

  // 1. Extract plain-text URLs from selected text
  const textUrlRegex = /https?:\/\/[^\s<>"'`{}\[\]|\\^]+/gi;
  const textMatches = selectedText.match(textUrlRegex) || [];
  for (const url of textMatches) {
    urls.add(url.replace(/[.,;:!?)\]}'"]+$/, ''));
  }

  // 2. Extract hrefs from <a> elements within the selection range
  const range = selection.getRangeAt(0);
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

  while (walker.nextNode()) {
    const href = walker.currentNode.href;
    if (href && /^https?:\/\//i.test(href)) {
      urls.add(href);
    }
  }

  const urlArray = Array.from(urls);
  sendResponse({ urls: urlArray, count: urlArray.length });
});
