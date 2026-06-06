# Developer Guide — Copy Multi URLs

## Architecture

```
Copy-multi-URLs/
├── manifest.json          # MV3 manifest, permissions, icons
├── background.js          # Event page: context menus, clipboard, commands
├── content.js             # Content script: URL extraction from page DOM
├── icons/                 # PNG icons (48, 96, 128 px)
├── docs/
│   ├── USER.md            # End-user documentation
│   └── DEV.md             # This file
├── .github/
│   ├── workflows/ci.yml   # CI/CD pipeline
│   └── PULL_REQUEST_TEMPLATE.md
├── LICENSE                # MIT
├── README.md
└── .gitignore
```

## How it works

```
User selects text + right-clicks
          │
          ▼
┌─────────────────────┐
│  background.js       │
│  contextMenus.onClick│
└─────────┬───────────┘
          │ tabs.sendMessage({action: "getSelectedURLs"})
          ▼
┌─────────────────────┐
│  content.js          │
│  1. Regex scan text  │
│  2. TreeWalker <a>   │
│  3. Deduplicate Set  │
└─────────┬───────────┘
          │ sendResponse({urls, count})
          ▼
┌─────────────────────┐
│  background.js       │
│  scripting.execute   │
│  → clipboard API     │
│  → notification      │
└─────────────────────┘
```

## Key design decisions

### Event page (non-persistent background)
Firefox MV3 uses event pages instead of persistent background scripts. The
background script is suspended when idle and restarted on events. Because of this:

- **Context menus are created at the top level** (not just in `onInstalled`)
  so they re-register on every wake-up. The `menus.create` callback silently
  ignores "already exists" errors.
- **All event listeners are registered at the top level** — this is required
  for event pages to receive events after a restart.

### URL extraction
The content script uses two strategies:
1. **Regex** — `/https?:\/\/[^\s<>\"'`{}\[\]|\\^]+/gi` matches URLs in plain text
2. **TreeWalker** — walks `<a>` elements within the selection range using
   `range.intersectsNode()`, extracting `href` attributes

Results are collected in a `Set` for automatic deduplication.

### Clipboard
Uses `navigator.clipboard.writeText()` with a `document.execCommand('copy')`
fallback via an injected script (`scripting.executeScript`). This runs in the
page context where clipboard APIs are available.

## Local development

### Prerequisites
- Node.js ≥ 22
- Firefox ≥ 140
- [web-ext](https://github.com/mozilla/web-ext): `npm install -g web-ext`

### Commands

```bash
# Lint
web-ext lint

# Run in temporary Firefox profile
web-ext run --url https://example.com

# Run with console logging visible
web-ext run --firefox=firefox --verbose

# Sign for self-distribution (requires AMO API keys)
web-ext sign --api-key=$AMO_KEY --api-secret=$AMO_SECRET
```

### Debugging
1. Open `about:debugging#/runtime/this-firefox`
2. Find "Copy Multi URLs" → click **Inspect** on the background page
3. Check the console for log messages
4. Reload tabs after extension changes (content scripts only inject on load)

## CI/CD

GitHub Actions runs on push/PR:

| Job | Trigger | What |
|-----|---------|------|
| `lint` | Every push/PR to `main` | `web-ext lint`, JSON validation, file checks |
| `release` | Tag `v*` push | Builds `.zip`, creates GitHub Release |

### Creating a release
```bash
git tag v1.0.0
git push origin v1.0.0
```
The CI pipeline will build and publish the release automatically.

## Mozilla Add-ons (AMO) submission

1. Sign up at [addons.mozilla.org](https://addons.mozilla.org/)
2. Generate API keys at [addons.mozilla.org/developers/addon/api/key](https://addons.mozilla.org/developers/addon/api/key/)
3. Run `web-ext sign --api-key=... --api-secret=... --channel=listed`
4. The signed `.xpi` is ready for self-distribution
5. For AMO listing, submit via the [Developer Hub](https://addons.mozilla.org/developers/)

### AMO requirements checklist
- [x] Manifest V3
- [x] `browser_specific_settings.gecko.id` set
- [x] `data_collection_permissions` declared (`none`)
- [x] Icons: 48, 96, 128 px
- [x] No remote code execution
- [x] No `browser_style` (deprecated in MV3)
- [ ] Privacy policy URL (add to manifest for AMO submission)
- [ ] Screenshots for listing
