import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage, Product } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutStepOnePage } from '../pages/CheckoutStepOnePage';
import { CheckoutStepTwoPage } from '../pages/CheckoutStepTwoPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';

test.describe('Full End-to-End Flow (Happy Path)', () => {
  // E2E-01
  test('E2E-01: complete purchase with two items — confirmation shown and cart cleared', async ({ page }) => {
    // Step 1: Login as standard_user
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL('/inventory.html');

    // Step 2: Add Sauce Labs Backpack and Sauce Labs Bike Light to cart
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart(Product.Backpack);
    await inventoryPage.addToCart(Product.BikeLight);
    await expect(inventoryPage.cartBadge).toHaveText('2');

    // Step 3: Open cart
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await expect(page).toHaveURL('/cart.html');
    const cartItemNames = await cartPage.itemNames.allTextContents();
    expect(cartItemNames).toContain(Product.Backpack);
    expect(cartItemNames).toContain(Product.BikeLight);

    // Step 4: Click Checkout
    await cartPage.checkout();
    await expect(page).toHaveURL('/checkout-step-one.html');

    // Step 5 & 6: Fill shipping info and continue
    const stepOnePage = new CheckoutStepOnePage(page);
    await stepOnePage.fillAndContinue({ firstName: 'Jane', lastName: 'Doe', postalCode: '12345' });
    await expect(page).toHaveURL('/checkout-step-two.html');

    // Step 7: Verify order summary lists both items
    const stepTwoPage = new CheckoutStepTwoPage(page);
    const summaryNames = await stepTwoPage.itemNames.allTextContents();
    expect(summaryNames).toContain(Product.Backpack);
    expect(summaryNames).toContain(Product.BikeLight);
    await expect(stepTwoPage.subtotalLabel).toBeVisible();
    await expect(stepTwoPage.taxLabel).toBeVisible();
    await expect(stepTwoPage.totalLabel).toBeVisible();

    // Step 8: Click Finish
    await stepTwoPage.finish();

    // Expected: confirmation page shown and cart cleared
    const completePage = new CheckoutCompletePage(page);
    await expect(page).toHaveURL('/checkout-complete.html');
    await expect(completePage.completeHeader).toHaveText('Thank you for your order!');
    await expect(completePage.cartBadge).toHaveCount(0);
  });
});
