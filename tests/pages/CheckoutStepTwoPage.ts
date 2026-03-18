import { type Page, type Locator } from '@playwright/test';

export class CheckoutStepTwoPage {
  readonly url = '/checkout-step-two.html';
  readonly cartItems: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;

  private readonly finishButton: Locator;
  private readonly cancelButton: Locator;

  constructor(private readonly page: Page) {
    this.cartItems     = page.locator('.cart_item');
    this.itemNames     = page.getByTestId('inventory-item-name');
    this.itemPrices    = page.getByTestId('inventory-item-price');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel      = page.getByTestId('tax-label');
    this.totalLabel    = page.getByTestId('total-label');
    this.finishButton  = page.getByTestId('finish');
    this.cancelButton  = page.getByTestId('cancel');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
