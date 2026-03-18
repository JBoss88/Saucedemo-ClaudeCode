# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Playwright E2E test suite, likely targeting the [SauceDemo](https://www.saucedemo.com) web app. It uses TypeScript with `@playwright/test`.

## Commands

```bash
# Run all tests (headless, all browsers)
npx playwright test

# Run a single test file
npx playwright test tests/example.spec.ts

# Run a specific test by name
npx playwright test --grep "test name"

# Run in headed mode (visible browser)
npx playwright test --headed

# Run only in one browser
npx playwright test --project=chromium

# Show HTML report after run
npx playwright show-report

# Install browsers (first-time setup)
npx playwright install
```

## Architecture

- **`tests/`** — All test specs live here (`.spec.ts` files)
- **`playwright.config.ts`** — Configures browsers (Chromium, Firefox, WebKit), retries, parallelism, and reporters
- **`.github/workflows/playwright.yml`** — CI runs tests on push/PR to main/master with 2 retries and uploads HTML report as artifact

### Config Behavior
- **Local:** parallel workers, no retries, allows `.only`
- **CI:** 1 worker (sequential), 2 retries, forbids `.only`
- Traces are collected on first retry for debugging failures
