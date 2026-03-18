import { type Page, type Locator } from '@playwright/test';

export class CheckoutCompletePage {
  readonly url = '/checkout-complete.html';
  readonly completeHeader: Locator;
  readonly cartBadge: Locator;

  private readonly backHomeButton: Locator;

  constructor(private readonly page: Page) {
    this.completeHeader = page.getByTestId('complete-header');
    this.cartBadge      = page.getByTestId('shopping-cart-badge');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}
