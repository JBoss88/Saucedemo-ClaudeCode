import { test, expect, type Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage, Product } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutStepOnePage } from '../pages/CheckoutStepOnePage';

enum ErrorMessage {
  FirstNameRequired  = 'First Name is required',
  LastNameRequired   = 'Last Name is required',
  PostalCodeRequired = 'Postal Code is required',
}

// Logs in, then navigates through the cart to reach checkout step one.
// Pass addToCart=true to put one item in the cart before proceeding.
const goToCheckoutStepOne = async (page: Page, addToCart = false): Promise<void> => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');

  if (addToCart) {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart(Product.Backpack);
  }

  const cartPage = new CartPage(page);
  await cartPage.goto();
  await cartPage.checkout();
};

test.describe('Checkout: Shipping Information (Step One)', () => {
  test.describe('Positive', () => {
    // S-01
    test('S-01: valid form submission advances to checkout step two', async ({ page }) => {
      await goToCheckoutStepOne(page);
      const checkoutPage = new CheckoutStepOnePage(page);
      await checkoutPage.fillAndContinue({ firstName: 'Jane', lastName: 'Doe', postalCode: '12345' });
      await expect(page).toHaveURL('/checkout-step-two.html');
    });
  });

  test.describe('Negative', () => {
    let checkoutPage: CheckoutStepOnePage;

    test.beforeEach(async ({ page }) => {
      await goToCheckoutStepOne(page);
      checkoutPage = new CheckoutStepOnePage(page);
    });

    // S-02
    test('S-02: blank first name shows first-name-required error', async () => {
      await checkoutPage.fillForm({ lastName: 'Doe', postalCode: '12345' });
      await checkoutPage.continue();
      await expect(checkoutPage.errorMessage).toContainText(ErrorMessage.FirstNameRequired);
    });

    // S-03
    test('S-03: blank last name shows last-name-required error', async () => {
      await checkoutPage.fillForm({ firstName: 'Jane', postalCode: '12345' });
      await checkoutPage.continue();
      await expect(checkoutPage.errorMessage).toContainText(ErrorMessage.LastNameRequired);
    });

    // S-04
    test('S-04: blank postal code shows postal-code-required error', async () => {
      await checkoutPage.fillForm({ firstName: 'Jane', lastName: 'Doe' });
      await checkoutPage.continue();
      await expect(checkoutPage.errorMessage).toContainText(ErrorMessage.PostalCodeRequired);
    });

    // S-05
    test('S-05: all fields blank shows first-name-required error', async () => {
      await checkoutPage.continue();
      await expect(checkoutPage.errorMessage).toContainText(ErrorMessage.FirstNameRequired);
    });

  });

  // S-06 — standalone: needs a cart with items, incompatible with the Negative beforeEach
  test('S-06: Cancel returns to /cart.html with cart intact', async ({ page }) => {
    await goToCheckoutStepOne(page, true);
    const checkoutPage = new CheckoutStepOnePage(page);
    await checkoutPage.cancel();

    await expect(page).toHaveURL('/cart.html');
    const cartPage = new CartPage(page);
    await expect(cartPage.itemNames).toContainText(Product.Backpack);
  });

  test.describe('Boundary', () => {
    let checkoutPage: CheckoutStepOnePage;

    test.beforeEach(async ({ page }) => {
      await goToCheckoutStepOne(page);
      checkoutPage = new CheckoutStepOnePage(page);
    });

    // S-07
    test('S-07: single character in each field is accepted and advances to step two', async ({ page }) => {
      await checkoutPage.fillAndContinue({ firstName: 'A', lastName: 'B', postalCode: '1' });
      await expect(page).toHaveURL('/checkout-step-two.html');
    });

    // S-08
    test('S-08: 255-character first name is accepted without crash', async ({ page }) => {
      const longName = 'A'.repeat(255);
      await checkoutPage.fillAndContinue({ firstName: longName, lastName: 'Doe', postalCode: '12345' });
      await expect(page).toHaveURL('/checkout-step-two.html');
    });

    // S-09
    test("S-09: special characters in first name (O'Brien-López) are accepted", async ({ page }) => {
      await checkoutPage.fillAndContinue({ firstName: "O'Brien-López", lastName: 'Doe', postalCode: '12345' });
      await expect(page).toHaveURL('/checkout-step-two.html');
    });

    // S-10
    test('S-10: numeric zip with leading zeros is accepted', async ({ page }) => {
      await checkoutPage.fillAndContinue({ firstName: 'Jane', lastName: 'Doe', postalCode: '01234' });
      await expect(page).toHaveURL('/checkout-step-two.html');
    });

    // S-11
    // SauceDemo does not validate zip format — non-numeric values are accepted.
    test('S-11: non-numeric zip is accepted (SauceDemo skips format validation)', async ({ page }) => {
      await checkoutPage.fillAndContinue({ firstName: 'Jane', lastName: 'Doe', postalCode: 'ABCDE' });
      await expect(page).toHaveURL('/checkout-step-two.html');
    });
  });
});
