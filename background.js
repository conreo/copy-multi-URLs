// Background script for Copy Multi URLs
// Context menu, toolbar button, keyboard shortcut, and clipboard operations

console.log('Copy Multi URLs: background script starting...');

// ── Context menu ──────────────────────────────────────────────

function setupContextMenu() {
  // Selection context: appears when text is selected
  browser.menus.create(
    {
      id: 'copy-multi-urls-selection',
      title: 'Copy selected URLs',
      contexts: ['selection']
    },
    () => {
      if (browser.runtime.lastError) {
        console.warn('Copy Multi URLs: menu (selection) -', browser.runtime.lastError.message);
      } else {
        console.log('Copy Multi URLs: context menu (selection) registered');
      }
    }
  );

  // Link context: appears when right-clicking a link
  browser.menus.create(
    {
      id: 'copy-multi-urls-link',
      title: 'Copy link URL',
      contexts: ['link']
    },
    () => {
      if (browser.runtime.lastError) {
        console.warn('Copy Multi URLs: menu (link) -', browser.runtime.lastError.message);
      } else {
        console.log('Copy Multi URLs: context menu (link) registered');
      }
    }
  );
}

// Create at startup (catches event page wake-ups)
setupContextMenu();

// Also create on install/update (catches first install)
browser.runtime.onInstalled.addListener(() => {
  console.log('Copy Multi URLs: onInstalled fired');
  setupContextMenu();
});

// ── Core logic ────────────────────────────────────────────────

async function getURLsFromSelection(tabId) {
  try {
    const response = await browser.tabs.sendMessage(tabId, { action: 'getSelectedURLs' });
    console.log('Copy Multi URLs: content script response:', response);
    return response || { urls: [], count: 0 };
  } catch (err) {
    console.error('Copy Multi URLs: error communicating with content script:', err);
    return { urls: [], count: 0 };
  }
}

async function showNotification(title, message) {
  try {
    await browser.notifications.create({
      type: 'basic',
      iconUrl: browser.runtime.getURL('icons/icon-48.png'),
      title,
      message
    });
  } catch (err) {
    console.error('Copy Multi URLs: notification error:', err);
  }
}

async function copyToClipboard(tab, text, count) {
  try {
    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: (clipboardText) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          return navigator.clipboard.writeText(clipboardText);
        }
        return new Promise((resolve, reject) => {
          const textarea = document.createElement('textarea');
          textarea.value = clipboardText;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand('copy');
            document.body.removeChild(textarea);
            resolve();
          } catch (e) {
            document.body.removeChild(textarea);
            reject(e);
          }
        });
      },
      args: [text]
    });

    console.log('Copy Multi URLs: copied', count, 'URL(s)');
    showNotification('Copy Multi URLs', `${count} URL${count > 1 ? 's' : ''} copied to clipboard.`);
  } catch (err) {
    console.error('Copy Multi URLs: clipboard error:', err);
    showNotification('Copy Multi URLs', 'Failed to copy URLs. Please try again.');
  }
}

async function handleSelectionCopy(tab) {
  const { urls, count } = await getURLsFromSelection(tab.id);

  if (count === 0) {
    showNotification('Copy Multi URLs', 'No URLs found in the selection.');
    return;
  }

  await copyToClipboard(tab, urls.join('\n'), count);
}

function handleLinkCopy(tab, url) {
  copyToClipboard(tab, url, 1);
}

// ── Event listeners (must be top-level for MV3 event pages) ──

browser.menus.onClicked.addListener((info, tab) => {
  console.log('Copy Multi URLs: menu clicked:', info.menuItemId);
  if (info.menuItemId === 'copy-multi-urls-selection') {
    handleSelectionCopy(tab);
  } else if (info.menuItemId === 'copy-multi-urls-link') {
    handleLinkCopy(tab, info.linkUrl);
  }
});

browser.action.onClicked.addListener((tab) => {
  console.log('Copy Multi URLs: toolbar button clicked');
  handleSelectionCopy(tab);
});

browser.commands.onCommand.addListener((command) => {
  console.log('Copy Multi URLs: command received:', command);
  if (command === 'copy-selected-urls') {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0]) {
        handleSelectionCopy(tabs[0]);
      }
    });
  }
});

console.log('Copy Multi URLs: background script ready');
