# Copy Multi URLs

Firefox extension to copy all URLs from selected text in one click.

Select text containing URLs on any webpage, right-click, and choose **"Copy selected URLs"** — all URLs are extracted, deduplicated, and copied to your clipboard, one per line.

## Features

- **Right-click context menu** — "Copy selected URLs" appears when text is selected
- **Right-click on links** — "Copy link URL" to copy a single link
- **Toolbar button** — click the extension icon to copy selected URLs
- **Keyboard shortcut** — `Ctrl+Shift+U` (`MacCtrl+Shift+U` on Mac)
- Deduplicates URLs automatically
- Extracts URLs from both plain text and anchor (`<a>`) elements

## Installation

### Temporary (development)
1. Open Firefox and go to `about:debugging#/runtime/this-firefox`
2. Click **"Load Temporary Add-on…"**
3. Select `manifest.json` from this directory

### Permanent (signed)
Submit to [Mozilla Add-ons](https://addons.mozilla.org/) for signing, or use
[web-ext sign](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-sign).

## Usage

1. Select text containing URLs on any webpage
2. Right-click → **Copy selected URLs**
3. All URLs are now in your clipboard, one per line

## Permissions

| Permission | Why |
|---|---|
| `menus` | Add items to the right-click context menu |
| `clipboardWrite` | Copy URLs to the clipboard |
| `activeTab` | Access the current tab's selection |
| `scripting` | Inject clipboard script |
| `notifications` | Show copy confirmation |
| `<all_urls>` | Content script runs on all pages |

**This extension collects zero data.** URLs are copied locally to your clipboard — nothing leaves your browser.

## Development

```bash
# Lint the extension
web-ext lint

# Run in a temporary Firefox profile
web-ext run --url https://example.com
```

Requires [web-ext](https://github.com/mozilla/web-ext) (`npm install -g web-ext`).

## License

MIT — see [LICENSE](LICENSE)
