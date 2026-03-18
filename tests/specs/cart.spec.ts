import { test, expect, type Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage, Product } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';

const loginAsStandardUser = async (page: Page): Promise<void> => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');
};

test.describe('Cart Review', () => {
  test.describe('Positive', () => {
    // R-01
    test('R-01: cart displays correct item names and prices for added products', async ({ page }) => {
      await loginAsStandardUser(page);
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.addToCart(Product.Backpack);
      await inventoryPage.addToCart(Product.BikeLight);
      await inventoryPage.navigateToCart();

      const cartPage = new CartPage(page);
      const names = await cartPage.itemNames.allTextContents();
      const prices = await cartPage.itemPrices.allTextContents();

      expect(names).toContain(Product.Backpack);
      expect(names).toContain(Product.BikeLight);
      expect(prices).toHaveLength(2);
      for (const price of prices) {
        expect(price).toMatch(/^\$\d+\.\d{2}$/);
      }
    });

    // R-02
    test('R-02: Continue Shopping returns to inventory with cart count intact', async ({ page }) => {
      await loginAsStandardUser(page);
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.addToCart(Product.Backpack);
      await inventoryPage.addToCart(Product.BikeLight);
      await inventoryPage.navigateToCart();

      const cartPage = new CartPage(page);
      await cartPage.continueShopping();

      await expect(page).toHaveURL('/inventory.html');
      await expect(inventoryPage.cartBadge).toHaveText('2');
    });

    // R-03
    test('R-03: removing an item from the cart page decrements badge and removes the item', async ({ page }) => {
      await loginAsStandardUser(page);
      const inventoryPage = new InventoryPage(page);
      await inventoryPage.addToCart(Product.Backpack);
      await inventoryPage.addToCart(Product.BikeLight);
      await inventoryPage.navigateToCart();

      const cartPage = new CartPage(page);
      await cartPage.removeButtonFor(Product.Backpack).click();

      await expect(cartPage.cartBadge).toHaveText('1');
      const names = await cartPage.itemNames.allTextContents();
      expect(names).not.toContain(Product.Backpack);
      expect(names).toContain(Product.BikeLight);
    });
  });

  test.describe('Negative', () => {
    // R-04
    test('R-04: checking out with an empty cart proceeds to the checkout form (documented behavior)', async ({ page }) => {
      await loginAsStandardUser(page);
      const cartPage = new CartPage(page);
      await cartPage.goto();

      await expect(cartPage.cartItems).toHaveCount(0);

      await cartPage.checkout();
      await expect(page).toHaveURL('/checkout-step-one.html');
    });
  });
});
