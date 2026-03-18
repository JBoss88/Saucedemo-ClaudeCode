import { test, expect, type Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage, Product } from '../pages/InventoryPage';

const loginAsStandardUser = async (page: Page): Promise<void> => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');
};

test.describe('Inventory - Product Catalog & Cart', () => {
  let inventoryPage: InventoryPage;

  test.describe('Positive', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsStandardUser(page);
      inventoryPage = new InventoryPage(page);
    });

    // C-01
    test('C-01: adding one item shows badge count of 1 and reveals Remove button', async () => {
      await inventoryPage.addToCart(Product.Backpack);
      await expect(inventoryPage.cartBadge).toHaveText('1');
      await expect(inventoryPage.removeButton(Product.Backpack)).toBeVisible();
    });

    // C-02
    test('C-02: adding two items shows badge count of 2', async () => {
      await inventoryPage.addToCart(Product.Backpack);
      await inventoryPage.addToCart(Product.BikeLight);
      await expect(inventoryPage.cartBadge).toHaveText('2');
    });

    // C-03
    test('C-03: removing an item decrements the badge and restores Add to cart', async () => {
      await inventoryPage.addToCart(Product.Backpack);
      await inventoryPage.addToCart(Product.BikeLight);
      await inventoryPage.removeFromCart(Product.Backpack);
      await expect(inventoryPage.cartBadge).toHaveText('1');
      await expect(inventoryPage.addToCartButton(Product.Backpack)).toBeVisible();
    });

    // C-04
    test('C-04: cart count persists after navigating to a product detail page and back', async ({ page }) => {
      await inventoryPage.addToCart(Product.Backpack);
      await inventoryPage.addToCart(Product.BikeLight);
      await inventoryPage.navigateToProduct(Product.Backpack);
      await page.goBack();
      await expect(inventoryPage.cartBadge).toHaveText('2');
    });
  });

  test.describe('Negative', () => {
    // C-05
    test('C-05: unauthenticated access to /inventory.html redirects to login', async ({ page }) => {
      await page.goto('/inventory.html');
      await expect(page).toHaveURL('/');
    });

    // C-06
    test('C-06: unauthenticated access to /cart.html redirects to login', async ({ page }) => {
      await page.goto('/cart.html');
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Boundary', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsStandardUser(page);
      inventoryPage = new InventoryPage(page);
    });

    // C-07
    test('C-07: adding all 6 products shows badge count of 6', async () => {
      for (const product of Object.values(Product)) {
        await inventoryPage.addToCart(product);
      }
      await expect(inventoryPage.cartBadge).toHaveText('6');
    });

    // C-08
    test('C-08: an item can only be added once — Add to cart is replaced by Remove', async () => {
      await inventoryPage.addToCart(Product.Backpack);
      await expect(inventoryPage.cartBadge).toHaveText('1');
      // "Add to cart" is gone — only "Remove" is available for this product.
      await expect(inventoryPage.addToCartButton(Product.Backpack)).not.toBeVisible();
      await expect(inventoryPage.removeButton(Product.Backpack)).toBeVisible();
    });
  });
});
