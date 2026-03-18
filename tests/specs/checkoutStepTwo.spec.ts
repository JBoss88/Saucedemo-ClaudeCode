import { test, expect, type Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage, Product } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutStepOnePage } from '../pages/CheckoutStepOnePage';
import { CheckoutStepTwoPage } from '../pages/CheckoutStepTwoPage';

// Extracts the dollar amount from a summary label, e.g. "Item total: $39.98" → 39.98
function parseCurrency(text: string): number {
  const match = text.match(/\$(\d+\.\d{2})/);
  return match ? parseFloat(match[1]) : 0;
}

// Logs in, adds the given products to the cart, and drives through step one
// to land on checkout step two.
const goToCheckoutStepTwo = async (page: Page, products: Product[]): Promise<void> => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');

  const inventoryPage = new InventoryPage(page);
  for (const product of products) {
    await inventoryPage.addToCart(product);
  }

  const cartPage = new CartPage(page);
  await cartPage.goto();
  await cartPage.checkout();

  const stepOnePage = new CheckoutStepOnePage(page);
  await stepOnePage.fillAndContinue({ firstName: 'Jane', lastName: 'Doe', postalCode: '12345' });
};

test.describe('Checkout: Order Overview (Step Two)', () => {
  test.describe('Positive', () => {
    let stepTwoPage: CheckoutStepTwoPage;

    test.beforeEach(async ({ page }) => {
      await goToCheckoutStepTwo(page, [Product.Backpack, Product.BikeLight]);
      stepTwoPage = new CheckoutStepTwoPage(page);
    });

    // O-01
    test('O-01: order summary lists both items with correct names and prices', async () => {
      const names  = await stepTwoPage.itemNames.allTextContents();
      const prices = await stepTwoPage.itemPrices.allTextContents();

      expect(names).toContain(Product.Backpack);
      expect(names).toContain(Product.BikeLight);
      expect(prices).toHaveLength(2);
      for (const price of prices) {
        expect(price).toMatch(/^\$\d+\.\d{2}$/);
      }
    });

    // O-02
    test('O-02: item total equals the sum of individual item prices', async () => {
      const priceTexts = await stepTwoPage.itemPrices.allTextContents();
      const itemSum    = priceTexts.reduce((sum, t) => sum + parseCurrency(t), 0);

      const subtotalText = await stepTwoPage.subtotalLabel.textContent() ?? '';
      expect(parseCurrency(subtotalText)).toBeCloseTo(itemSum, 2);
    });

    // O-03
    test('O-03: tax line is present and non-zero', async () => {
      const taxText = await stepTwoPage.taxLabel.textContent() ?? '';
      expect(parseCurrency(taxText)).toBeGreaterThan(0);
    });

    // O-04
    test('O-04: grand total equals item total plus tax', async () => {
      const subtotalText = await stepTwoPage.subtotalLabel.textContent() ?? '';
      const taxText      = await stepTwoPage.taxLabel.textContent() ?? '';
      const totalText    = await stepTwoPage.totalLabel.textContent() ?? '';

      const expected = parseCurrency(subtotalText) + parseCurrency(taxText);
      expect(parseCurrency(totalText)).toBeCloseTo(expected, 2);
    });

    // O-05
    test('O-05: Cancel from step two returns to inventory', async ({ page }) => {
      await stepTwoPage.cancel();
      await expect(page).toHaveURL('/inventory.html');
    });
  });

  test.describe('Negative', () => {
    // O-06
    // SauceDemo does not redirect — it loads step two with an empty order.
    test('O-06: accessing step two directly without completing step one shows empty order', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('standard_user', 'secret_sauce');

      await page.goto('/checkout-step-two.html');

      const stepTwoPage = new CheckoutStepTwoPage(page);
      await expect(page).toHaveURL('/checkout-step-two.html');
      await expect(stepTwoPage.cartItems).toHaveCount(0);
    });
  });
});
