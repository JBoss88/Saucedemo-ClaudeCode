# Test Plan: SauceDemo Checkout Flow

**Version:** 1.0
**Date:** 2026-03-17
**Scope:** End-to-end checkout flow for [SauceDemo](https://www.saucedemo.com)
**Tool:** Playwright + TypeScript (`@playwright/test`)

---

## 1. Scope

This plan covers the primary purchase flow for the `standard_user` account, including login, product selection, cart management, checkout form validation, and order confirmation.

---

## 2. Test Environment

| Item           | Value                                      |
| -------------- | ------------------------------------------ |
| URL            | https://www.saucedemo.com                  |
| Browsers       | Chromium, Firefox, WebKit                  |
| User (primary) | `standard_user` / `secret_sauce`           |
| User (locked)  | `locked_out_user` / `secret_sauce`         |
| User (glitchy) | `performance_glitch_user` / `secret_sauce` |

---

## 3. Test Cases

### 3.1 Login

#### Positive

| ID   | Title                    | Steps                                                                | Expected                                      |
| ---- | ------------------------ | -------------------------------------------------------------------- | --------------------------------------------- |
| L-01 | Standard user login      | Navigate to `/`, enter `standard_user` / `secret_sauce`, click Login | Redirected to `/inventory.html`               |
| L-02 | Login persists on reload | Log in, reload page                                                  | Inventory page remains loaded, session intact |

#### Negative

| ID   | Title             | Steps                                    | Expected                                      |
| ---- | ----------------- | ---------------------------------------- | --------------------------------------------- |
| L-03 | Wrong password    | Enter `standard_user` / `wrong_password` | Error: "Username and password do not match"   |
| L-04 | Wrong username    | Enter `bad_user` / `secret_sauce`        | Error: "Username and password do not match"   |
| L-05 | Locked-out user   | Enter `locked_out_user` / `secret_sauce` | Error: "Sorry, this user has been locked out" |
| L-06 | Empty username    | Submit with blank username               | Error: "Username is required"                 |
| L-07 | Empty password    | Enter username, leave password blank     | Error: "Password is required"                 |
| L-08 | Both fields empty | Submit with both fields blank            | Error: "Username is required"                 |

#### Boundary

| ID   | Title                                 | Steps                               | Expected                                 |
| ---- | ------------------------------------- | ----------------------------------- | ---------------------------------------- |
| L-09 | Username with leading/trailing spaces | Enter `standard_user` (with spaces) | Login fails; spaces not silently trimmed |
| L-10 | SQL injection in username             | Enter `' OR '1'='1`                 | Login fails, no server error             |

---

### 3.2 Product Catalog & Cart Addition

#### Positive

| ID   | Title                           | Steps                                         | Expected                                          |
| ---- | ------------------------------- | --------------------------------------------- | ------------------------------------------------- |
| C-01 | Add one item to cart            | Click "Add to cart" on any product            | Badge shows `1`; button changes to "Remove"       |
| C-02 | Add two items to cart           | Add two distinct products                     | Cart badge shows `2`                              |
| C-03 | Remove an item from cart        | Add item, click "Remove"                      | Badge decrements; button reverts to "Add to cart" |
| C-04 | Cart persists across navigation | Add items, navigate to product detail, return | Cart count unchanged                              |

#### Negative

| ID   | Title                          | Steps                                  | Expected                 |
| ---- | ------------------------------ | -------------------------------------- | ------------------------ |
| C-05 | Access inventory without login | Navigate directly to `/inventory.html` | Redirected to login page |
| C-06 | Access cart without login      | Navigate directly to `/cart.html`      | Redirected to login page |

#### Boundary

| ID   | Title                   | Steps                                                                 | Expected                                |
| ---- | ----------------------- | --------------------------------------------------------------------- | --------------------------------------- |
| C-07 | Add all 6 items to cart | Click "Add to cart" on all products                                   | Cart badge shows `6`                    |
| C-08 | Add same item twice     | Click "Add to cart" (button becomes "Remove"); no second add possible | Only one instance in cart; no duplicate |

---

### 3.3 Cart Review

#### Positive

| ID   | Title                                  | Steps                                | Expected                                          |
| ---- | -------------------------------------- | ------------------------------------ | ------------------------------------------------- |
| R-01 | Cart displays correct items            | Add two items, open cart             | Both items listed with correct name and price     |
| R-02 | Continue shopping returns to inventory | From cart, click "Continue Shopping" | Returns to `/inventory.html`, items still in cart |
| R-03 | Remove item from cart page             | Open cart, click "Remove" on an item | Item removed; badge decrements                    |

#### Negative

| ID   | Title                    | Steps                                                     | Expected                                                              |
| ---- | ------------------------ | --------------------------------------------------------- | --------------------------------------------------------------------- |
| R-04 | Checkout with empty cart | Navigate to `/cart.html` and click Checkout with no items | Proceeds to checkout form (SauceDemo allows this — document behavior) |

---

### 3.4 Checkout: Shipping Information (Step One)

#### Positive

| ID   | Title                      | Steps                                                        | Expected                              |
| ---- | -------------------------- | ------------------------------------------------------------ | ------------------------------------- |
| S-01 | Complete checkout step one | Enter First Name, Last Name, Zip/Postal Code; click Continue | Advances to `/checkout-step-two.html` |

#### Negative

| ID   | Title            | Steps                                                     | Expected                                 |
| ---- | ---------------- | --------------------------------------------------------- | ---------------------------------------- |
| S-02 | Blank first name | Leave first name empty, fill other fields, click Continue | Error: "First Name is required"          |
| S-03 | Blank last name  | Fill first name and zip, leave last name empty            | Error: "Last Name is required"           |
| S-04 | Blank zip code   | Fill first and last name, leave zip empty                 | Error: "Postal Code is required"         |
| S-05 | All fields blank | Click Continue with no input                              | Error: "First Name is required"          |
| S-06 | Cancel checkout  | Click Cancel on step one                                  | Returns to `/cart.html` with cart intact |

#### Boundary

| ID   | Title                          | Steps                                          | Expected                                            |
| ---- | ------------------------------ | ---------------------------------------------- | --------------------------------------------------- |
| S-07 | Single character in each field | Enter `A`, `B`, `1` and continue               | Advances to step two (min length accepted)          |
| S-08 | Very long input (255 chars)    | Paste 255-character string in first name field | Field accepts input and continues without crash     |
| S-09 | Special characters in name     | Enter `O'Brien-López` as first name            | Field accepts and continues without error           |
| S-10 | Numeric zip with leading zeros | Enter `01234` as zip                           | Accepted and continues                              |
| S-11 | Non-numeric zip                | Enter `ABCDE` as zip                           | Behavior documented (SauceDemo may accept — verify) |

---

### 3.5 Checkout: Order Overview (Step Two)

#### Positive

| ID   | Title                             | Steps                                    | Expected                                        |
| ---- | --------------------------------- | ---------------------------------------- | ----------------------------------------------- |
| O-01 | Order summary shows correct items | Complete step one with two items in cart | Both items listed with correct names and prices |
| O-02 | Item total is sum of item prices  | Two items with known prices              | Item total = sum of individual prices           |
| O-03 | Tax is applied                    | View order summary                       | Tax line is non-zero                            |
| O-04 | Grand total = item total + tax    | View order summary                       | Total = item total + tax (verify arithmetic)    |
| O-05 | Cancel from step two              | Click Cancel                             | Returns to `/inventory.html`                    |

#### Negative

| ID   | Title                                 | Steps                                                             | Expected                        |
| ---- | ------------------------------------- | ----------------------------------------------------------------- | ------------------------------- |
| O-06 | Access step two directly without cart | Navigate to `/checkout-step-two.html` without completing step one | Redirected or shows empty order |

---

### 3.6 Order Confirmation

#### Positive

| ID    | Title                            | Steps                                  | Expected                                                               |
| ----- | -------------------------------- | -------------------------------------- | ---------------------------------------------------------------------- |
| CF-01 | Finish button completes purchase | Click Finish on step two               | Navigated to `/checkout-complete.html`; confirmation message displayed |
| CF-02 | Confirmation message text        | View complete page                     | Header: "Thank you for your order!" visible                            |
| CF-03 | Cart is cleared after purchase   | Complete purchase, check cart badge    | Badge absent or shows `0`                                              |
| CF-04 | Back Home button works           | Click "Back Home" on confirmation page | Returns to `/inventory.html`                                           |

---

### 3.7 Full End-to-End Flow (Happy Path)

| ID     | Title                         | Steps                                                                                                                                                                                                                    | Expected                              |
| ------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| E2E-01 | Complete purchase — two items | 1. Login as `standard_user` 2. Add "Sauce Labs Backpack" and "Sauce Labs Bike Light" to cart 3. Open cart 4. Click Checkout 5. Fill First Name, Last Name, Zip 6. Click Continue 7. Verify order summary 8. Click Finish | Confirmation page shown; cart cleared |

---

## 4. Out of Scope

- Visual regression testing
- Performance/load testing
- `performance_glitch_user` timing assertions
- API-level testing
- Mobile viewports (covered implicitly by WebKit but not explicitly tested)

---

## 5. Pass/Fail Criteria

- **Pass:** Assertion succeeds within the configured Playwright timeout; no unhandled exceptions.
- **Fail:** Assertion fails, unexpected redirect occurs, or an unhandled console error is detected.
- Flaky tests must be investigated before being marked expected-flaky.
