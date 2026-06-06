// @ts-check
import { describe, it, expect } from 'vitest';
import {
  extractURLsFromText,
  getAllURLsFromSelection
} from '../src/url-extractor.js';

describe('extractURLsFromText', () => {
  it('returns empty array for empty input', () => {
    expect(extractURLsFromText('')).toEqual([]);
  });

  it('returns empty array for null/undefined', () => {
    expect(extractURLsFromText(null)).toEqual([]);
    expect(extractURLsFromText(undefined)).toEqual([]);
  });

  it('returns empty array for text with no URLs', () => {
    expect(extractURLsFromText('just plain text with no links')).toEqual([]);
  });

  it('extracts a single http URL', () => {
    const text = 'Visit http://example.com for info';
    expect(extractURLsFromText(text)).toEqual(['http://example.com']);
  });

  it('extracts a single https URL', () => {
    const text = 'Check https://github.com/mozilla';
    expect(extractURLsFromText(text)).toEqual(['https://github.com/mozilla']);
  });

  it('extracts multiple URLs', () => {
    const text = `
      First: https://example.com/page
      Second: https://github.com/user/repo
      Third: http://old-site.org/legacy
    `;
    const result = extractURLsFromText(text);
    expect(result).toHaveLength(3);
    expect(result).toContain('https://example.com/page');
    expect(result).toContain('https://github.com/user/repo');
    expect(result).toContain('http://old-site.org/legacy');
  });

  it('deduplicates identical URLs', () => {
    const text = `
      https://example.com
      https://example.com
      https://example.com
    `;
    expect(extractURLsFromText(text)).toEqual(['https://example.com']);
  });

  it('strips trailing punctuation', () => {
    const cases = [
      ['Check https://example.com.', 'https://example.com'],
      ['See https://example.com, now!', 'https://example.com'],
      ['URL: https://example.com; more text', 'https://example.com'],
      ['Visit https://example.com:8080/path?q=1.', 'https://example.com:8080/path?q=1'],
      ['(https://example.com)', 'https://example.com'],
      ['"https://example.com"', 'https://example.com'],
      ["'https://example.com'", 'https://example.com'],
      ['[https://example.com]', 'https://example.com'],
    ];

    for (const [input, expected] of cases) {
      expect(extractURLsFromText(input)).toEqual([expected]);
    }
  });

  it('preserves valid URL characters (slashes, query, hash)', () => {
    const cases = [
      ['https://example.com/path/', 'https://example.com/path/'],
      ['https://example.com?a=1&b=2', 'https://example.com?a=1&b=2'],
      ['https://example.com/page#section', 'https://example.com/page#section'],
    ];

    for (const [input, expected] of cases) {
      expect(extractURLsFromText(input)).toEqual([expected]);
    }
  });

  it('handles URLs with parentheses (known limitation)', () => {
    // A trailing ) in a URL like wikipedia.org/wiki/C_(language)
    // is indistinguishable from sentence punctuation.
    // The regex conservatively strips it.
    expect(extractURLsFromText('https://en.wikipedia.org/wiki/C_(x)'))
      .toEqual(['https://en.wikipedia.org/wiki/C_(x']);
    // But internal parens work fine:
    expect(extractURLsFromText('https://en.wikipedia.org/wiki/C_(x)/path'))
      .toEqual(['https://en.wikipedia.org/wiki/C_(x)/path']);
  });

  it('handles URLs with ports', () => {
    const text = 'Server at https://localhost:3000/dashboard';
    expect(extractURLsFromText(text)).toEqual(['https://localhost:3000/dashboard']);
  });

  it('handles URLs with IP addresses', () => {
    const text = 'API at https://192.168.1.1/api/v1';
    expect(extractURLsFromText(text)).toEqual(['https://192.168.1.1/api/v1']);
  });

  it('handles URLs with long paths and query strings', () => {
    const url = 'https://example.com/very/long/path/to/resource?param1=value1&param2=value2&param3=value3';
    const text = `Link: ${url}`;
    expect(extractURLsFromText(text)).toEqual([url]);
  });

  it('does not match non-URLs', () => {
    const text = 'ftp://files.example.com mailto:user@example.com file:///local/path';
    expect(extractURLsFromText(text)).toEqual([]);
  });

  it('extracts URLs from realistic user selection', () => {
    const text = `
      Here are some useful links:
      https://github.com/mozilla/web-ext - the official linter tool
      https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions
      https://example.com/docs/getting-started#intro

      Deprecated: http://old-docs.example.com/v1 (use the new one)

      See also: https://github.com/conreo/copy-multi-URLs.
    `;

    const result = extractURLsFromText(text);
    expect(result).toHaveLength(5);
    expect(result).toContain('https://github.com/mozilla/web-ext');
    expect(result).toContain('https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions');
    expect(result).toContain('https://example.com/docs/getting-started#intro');
    expect(result).toContain('http://old-docs.example.com/v1');
    expect(result).toContain('https://github.com/conreo/copy-multi-URLs');
  });

  it('handles whitespace-only strings', () => {
    expect(extractURLsFromText('   \n\t  ')).toEqual([]);
  });

  it('handles very long input without crashing', () => {
    const url = 'https://example.com/page';
    const longText = url + (' filler text '.repeat(1000));
    expect(extractURLsFromText(longText)).toEqual([url]);
  });
});

// ── DOM-based tests ──────────────────────────────────────────

describe('getAllURLsFromSelection (DOM)', () => {
  function setDocumentHTML(html) {
    document.body.innerHTML = html;
  }

  function selectTextIn(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    return sel;
  }

  it('returns empty when no selection', () => {
    setDocumentHTML('<p>https://example.com</p>');
    window.getSelection().removeAllRanges();
    const result = getAllURLsFromSelection();
    expect(result).toEqual({ urls: [], count: 0 });
  });

  it('extracts text URLs from selection', () => {
    setDocumentHTML('<p id="test">Visit https://example.com and https://github.com today!</p>');
    const el = document.getElementById('test');
    selectTextIn(el);
    const result = getAllURLsFromSelection();
    expect(result.count).toBe(2);
    expect(result.urls).toContain('https://example.com');
    expect(result.urls).toContain('https://github.com');
  });

  it('extracts anchor hrefs within selection', () => {
    setDocumentHTML(`
      <div id="test">
        <a href="https://example.com/page">Example</a>
        <a href="https://github.com/user">GitHub</a>
        <a href="https://mozilla.org/about">Mozilla</a>
      </div>
    `);
    const el = document.getElementById('test');
    selectTextIn(el);
    const result = getAllURLsFromSelection();
    expect(result.count).toBe(3);
    expect(result.urls).toContain('https://example.com/page');
    expect(result.urls).toContain('https://github.com/user');
    expect(result.urls).toContain('https://mozilla.org/about');
  });

  it('deduplicates between text URLs and anchor hrefs', () => {
    setDocumentHTML(`
      <div id="test">
        <a href="https://example.com/page">https://example.com/page</a>
      </div>
    `);
    const el = document.getElementById('test');
    selectTextIn(el);
    const result = getAllURLsFromSelection();
    expect(result.count).toBe(1);
    expect(result.urls).toEqual(['https://example.com/page']);
  });

  it('skips non-http anchor hrefs', () => {
    setDocumentHTML(`
      <div id="test">
        <a href="mailto:user@example.com">Email</a>
        <a href="ftp://files.example.com">FTP</a>
        <a href="https://valid.example.com/path">Valid</a>
      </div>
    `);
    const el = document.getElementById('test');
    selectTextIn(el);
    const result = getAllURLsFromSelection();
    expect(result.count).toBe(1);
    expect(result.urls).toContain('https://valid.example.com/path');
  });

  it('handles empty selection gracefully', () => {
    setDocumentHTML('<p>Some text</p>');
    window.getSelection().removeAllRanges();
    // Create a collapsed selection
    const range = document.createRange();
    range.setStart(document.body, 0);
    window.getSelection().addRange(range);
    // It's collapsed, should return empty
    const result = getAllURLsFromSelection();
    expect(result.count).toBe(0);
  });
});
