# Saucedemo Playwright Test Suite

End-to-end test automation for [SauceDemo](https://www.saucedemo.com) built with [Playwright](https://playwright.dev) and TypeScript.

## What's Covered

| Spec | Description |
|------|-------------|
| `login.spec.ts` | Login page — valid/invalid credentials |
| `inventory.spec.ts` | Product listing page |
| `cart.spec.ts` | Shopping cart |
| `checkoutStepOne.spec.ts` | Checkout — customer info form |
| `checkoutStepTwo.spec.ts` | Checkout — order summary |
| `checkoutComplete.spec.ts` | Order confirmation |
| `e2e.spec.ts` | Full purchase flow end-to-end |

## Project Structure

```
tests/
  pages/      # Page Object Models
  specs/      # Test specs
playwright.config.ts
.github/workflows/playwright.yml
```

## Setup

```bash
npm install
npx playwright install
```

## Running Tests

```bash
# All tests (headless, all browsers)
npx playwright test

# Single spec file
npx playwright test tests/specs/login.spec.ts

# By test name
npx playwright test --grep "test name"

# Headed mode
npx playwright test --headed

# Single browser
npx playwright test --project=chromium

# View HTML report
npx playwright show-report
```

## Browsers

Tests run against **Chromium**, **Firefox**, and **WebKit** (Safari).

## CI

GitHub Actions runs the full suite on every push to `main` using the official [Playwright Docker image](https://mcr.microsoft.com/playwright). The HTML report is uploaded as an artifact and retained for 14 days.

- Parallel locally, sequential on CI
- 2 retries on CI with trace collection on first retry
