## Notes to Reviewer

### Extension purpose
Copies URLs from selected text to the clipboard. No data is collected, transmitted,
or shared — URLs stay on the user's local clipboard.

### Permissions justification
| Permission | Reason |
|---|---|
| `menus` | Add "Copy selected URLs" and "Copy link URL" to right-click context menu |
| `clipboardWrite` | Write extracted URLs to the clipboard |
| `activeTab` | Access the current tab's selected text |
| `scripting` | Inject clipboard write script into the page |
| `notifications` | Show "N URLs copied" confirmation |
| `<all_urls>` | Content script runs on all pages to extract URLs from selections |

### Architecture
- `background.js` — Event page: context menus, clipboard, toolbar button, keyboard shortcut
- `content.js` — Content script: receives messages, extracts URLs from DOM selection
- `src/url-extractor.js` — Pure URL extraction functions (regex + TreeWalker for `<a>` tags)

### Data collection
Declared as `data_collection_permissions: { required: ["none"] }` in manifest.
No data is ever collected, transmitted, or shared.

### Build instructions
No build step required. The `.xpi` is a zip of the source files:
```
zip -r copy-multi-urls.xpi manifest.json background.js content.js src/ icons/ LICENSE README.md
```

### Source
https://github.com/conreo/copy-multi-URLs

### Test checklist
1. Visit any page with URLs (e.g., https://httpbin.org/links/10)
2. Select text containing URLs
3. Right-click → "Copy selected URLs"
4. Paste — all URLs should appear, one per line
5. Right-click a link → "Copy link URL" — the link URL should be copied
6. Click the toolbar icon — should copy selected URLs
7. Press Ctrl+Shift+U — should copy selected URLs
8. A notification confirms the number of URLs copied
