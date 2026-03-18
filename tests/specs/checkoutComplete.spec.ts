import { test, expect, type Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage, Product } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutStepOnePage } from '../pages/CheckoutStepOnePage';
import { CheckoutStepTwoPage } from '../pages/CheckoutStepTwoPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';

// Logs in, adds two items, drives through step one and step two, then clicks Finish.
const completePurchase = async (page: Page): Promise<void> => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');

  const inventoryPage = new InventoryPage(page);
  await inventoryPage.addToCart(Product.Backpack);
  await inventoryPage.addToCart(Product.BikeLight);

  const cartPage = new CartPage(page);
  await cartPage.goto();
  await cartPage.checkout();

  const stepOnePage = new CheckoutStepOnePage(page);
  await stepOnePage.fillAndContinue({ firstName: 'Jane', lastName: 'Doe', postalCode: '12345' });

  const stepTwoPage = new CheckoutStepTwoPage(page);
  await stepTwoPage.finish();
};

test.describe('Order Confirmation', () => {
  test.describe('Positive', () => {
    let completePage: CheckoutCompletePage;

    test.beforeEach(async ({ page }) => {
      await completePurchase(page);
      completePage = new CheckoutCompletePage(page);
    });

    // CF-01
    test('CF-01: Finish button navigates to checkout-complete.html with confirmation', async ({ page }) => {
      await expect(page).toHaveURL('/checkout-complete.html');
      await expect(completePage.completeHeader).toBeVisible();
    });

    // CF-02
    test('CF-02: confirmation header reads "Thank you for your order!"', async () => {
      await expect(completePage.completeHeader).toHaveText('Thank you for your order!');
    });

    // CF-03
    test('CF-03: cart badge is absent after purchase', async () => {
      await expect(completePage.cartBadge).toHaveCount(0);
    });

    // CF-04
    test('CF-04: Back Home button returns to inventory', async ({ page }) => {
      await completePage.backHome();
      await expect(page).toHaveURL('/inventory.html');
    });
  });
});
