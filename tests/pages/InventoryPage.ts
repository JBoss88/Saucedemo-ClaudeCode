import { type Page, type Locator } from '@playwright/test';

export enum Product {
  Backpack        = 'Sauce Labs Backpack',
  BikeLight       = 'Sauce Labs Bike Light',
  BoltTShirt      = 'Sauce Labs Bolt T-Shirt',
  FleeceJacket    = 'Sauce Labs Fleece Jacket',
  Onesie          = 'Sauce Labs Onesie',
  AllTheThingsTee = 'Test.allTheThings() T-Shirt (Red)',
}

export class InventoryPage {
  readonly url = '/inventory.html';
  readonly cartBadge: Locator;

  constructor(private readonly page: Page) {
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  // Scopes to the inventory card that contains the given product name,
  // then returns the target button within it.
  addToCartButton(product: Product): Locator {
    return this.page
      .locator('.inventory_item')
      .filter({ hasText: product })
      .getByRole('button', { name: 'Add to cart' });
  }

  removeButton(product: Product): Locator {
    return this.page
      .locator('.inventory_item')
      .filter({ hasText: product })
      .getByRole('button', { name: 'Remove' });
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  async addToCart(product: Product): Promise<void> {
    await this.addToCartButton(product).click();
  }

  async removeFromCart(product: Product): Promise<void> {
    await this.removeButton(product).click();
  }

  async navigateToCart(): Promise<void> {
    await this.page.getByTestId('shopping-cart-link').click();
  }

  async navigateToProduct(product: Product): Promise<void> {
    // Two links share the same name (image + text); first() targets the image link.
    await this.page.getByRole('link', { name: product }).first().click();
  }
}
