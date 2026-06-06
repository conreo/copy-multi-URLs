# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Copy Multi URLs, please report it
privately via GitHub Security Advisories:

1. Go to **Security** → **Advisories** → **New draft security advisory**
2. Describe the vulnerability with steps to reproduce
3. We'll respond within 48 hours

**Do not open a public issue** for security vulnerabilities.

## Scope

This extension:
- Runs entirely in the user's browser
- Does **not** collect, transmit, or share any data
- Copies URLs only to the local clipboard
- Has no network requests (beyond what Firefox itself makes for extension updates)

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | ✅ Active support  |

## Dependencies

| Tool | Purpose | Update via |
|------|---------|------------|
| web-ext | Lint & package | Dependabot |
| vitest | Unit tests | Dependabot |
| jsdom | DOM test env | Dependabot |
