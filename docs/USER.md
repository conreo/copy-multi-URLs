# User Guide — Copy Multi URLs

## What it does

Copy Multi URLs lets you select text on any webpage and copy every URL found
in that selection — all at once. No more copying links one by one.

## How to use

### Method 1: Right-click menu
1. **Select** text that contains URLs (highlight it with your mouse)
2. **Right-click** on the selection
3. Choose **"Copy selected URLs"**
4. All URLs are now in your clipboard — paste anywhere with `Ctrl+V`

### Method 2: Right-click a single link
1. **Right-click** any link on a page
2. Choose **"Copy link URL"**
3. The link's address is copied

### Method 3: Toolbar button
1. Select text containing URLs
2. Click the **extension icon** in the Firefox toolbar
3. URLs are copied instantly

### Method 4: Keyboard shortcut
1. Select text containing URLs
2. Press **`Ctrl+Shift+U`** (macOS: `MacCtrl+Shift+U`)
3. URLs are copied instantly

## What gets copied

- Any `https://` or `http://` URL found in the selected text
- The `href` attribute of any `<a>` tag within the selection
- Duplicate URLs are removed automatically
- Each URL appears on its own line

## Example

If you select:

> Check out https://example.com and also
> visit https://github.com for more info.
> [Documentation](https://docs.example.com)

Your clipboard will contain:

```
https://example.com
https://github.com
https://docs.example.com
```

## Privacy

**This extension does not collect, transmit, or share any data.** URLs are
copied locally to your clipboard — nothing leaves your browser or computer.

## Requirements

- Firefox 140 or later (desktop)
- Firefox 142 or later (Android)

## Troubleshooting

**The context menu doesn't appear?**  
Make sure you've selected text first. The menu only shows when text is highlighted.
After installing or updating the extension, reload any open tabs.

**No URLs found?**  
The extension looks for full URLs starting with `http://` or `https://`. Make sure
your selection includes complete URLs. URLs broken across lines may not be detected.

**Still having issues?**  
Open an issue on [GitHub](https://github.com/YOUR_USER/Copy-multi-URLs/issues).
