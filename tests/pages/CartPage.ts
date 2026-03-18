import { type Page, type Locator } from '@playwright/test';

export class CartPage {
  readonly url = '/cart.html';
  readonly cartBadge: Locator;
  readonly cartItems: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;

  private readonly continueShoppingButton: Locator;
  private readonly checkoutButton: Locator;

  constructor(private readonly page: Page) {
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.cartItems = page.locator('.cart_item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.checkoutButton = page.getByTestId('checkout');
  }

  removeButtonFor(itemName: string): Locator {
    return this.page
      .locator('.cart_item')
      .filter({ hasText: itemName })
      .getByRole('button', { name: 'Remove' });
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
