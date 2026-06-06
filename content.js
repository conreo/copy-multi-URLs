// Content script for Copy Multi URLs
// Handles messages from the background script to extract selected URLs

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== 'getSelectedURLs') return;

  const result = window.CopyMultiURLs.getAllURLsFromSelection();
  sendResponse(result);
});
