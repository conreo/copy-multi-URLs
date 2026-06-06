// @ts-check
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

describe('manifest.json', () => {
  let manifest;

  beforeAll(() => {
    const raw = fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf-8');
    manifest = JSON.parse(raw);
  });

  it('is valid JSON', () => {
    expect(manifest).toBeDefined();
  });

  it('has manifest_version 3', () => {
    expect(manifest.manifest_version).toBe(3);
  });

  it('has a name', () => {
    expect(manifest.name).toBeTruthy();
  });

  it('has a valid version string', () => {
    expect(manifest.version).toMatch(/^\d+(\.\d+){1,3}$/);
  });

  it('has browser_specific_settings with gecko.id', () => {
    expect(manifest.browser_specific_settings?.gecko?.id).toBeTruthy();
  });

  it('has data_collection_permissions', () => {
    expect(manifest.browser_specific_settings?.gecko?.data_collection_permissions).toBeDefined();
  });

  it('declares menus permission', () => {
    expect(manifest.permissions).toContain('menus');
  });

  it('declares clipboardWrite permission', () => {
    expect(manifest.permissions).toContain('clipboardWrite');
  });

  it('has host_permissions (not in permissions)', () => {
    // MV3: host permissions must be in host_permissions, not permissions
    expect(manifest.host_permissions).toBeDefined();
    // Ensure no URLs lingering in permissions
    const nonHostPerms = manifest.permissions.filter(p => p.includes('://') || p.includes('*://'));
    expect(nonHostPerms).toHaveLength(0);
  });

  it('has required icons', () => {
    const sizes = [32, 48, 64, 96, 128];
    for (const size of sizes) {
      const iconPath = manifest.icons[size];
      expect(iconPath, `missing ${size}px icon`).toBeTruthy();
      const fullPath = path.join(ROOT, iconPath);
      expect(fs.existsSync(fullPath), `icon file missing: ${iconPath}`).toBe(true);
    }
  });

  it('has content scripts loading url-extractor then content.js', () => {
    const cs = manifest.content_scripts?.[0];
    expect(cs).toBeDefined();
    expect(cs.js).toContain('src/url-extractor.js');
    expect(cs.js).toContain('content.js');
    // url-extractor must load before content.js
    const extractIdx = cs.js.indexOf('src/url-extractor.js');
    const contentIdx = cs.js.indexOf('content.js');
    expect(extractIdx).toBeLessThan(contentIdx);
  });

  it('has no browser_style (deprecated in MV3)', () => {
    const keys = ['action', 'options_ui', 'sidebar_action', 'page_action'];
    for (const key of keys) {
      if (manifest[key]) {
        expect(manifest[key].browser_style).toBeUndefined();
      }
    }
  });
});

describe('required files', () => {
  const required = [
    'manifest.json',
    'background.js',
    'content.js',
    'src/url-extractor.js',
    'LICENSE',
    'README.md',
  ];

  for (const file of required) {
    it(`exists: ${file}`, () => {
      const fullPath = path.join(ROOT, file);
      expect(fs.existsSync(fullPath), `${file} missing`).toBe(true);
    });
  }
});

describe('icons are valid PNGs', () => {
  const sizes = [32, 48, 64, 96, 128];

  for (const size of sizes) {
    it(`icon-${size}.png is valid PNG`, () => {
      const iconPath = path.join(ROOT, 'icons', `icon-${size}.png`);
      const buf = fs.readFileSync(iconPath);
      // PNG magic bytes
      expect(buf[0]).toBe(0x89);
      expect(buf[1]).toBe(0x50);
      expect(buf[2]).toBe(0x4E);
      expect(buf[3]).toBe(0x47);
    });
  }
});
