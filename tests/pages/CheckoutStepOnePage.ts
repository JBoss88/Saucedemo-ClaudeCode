import { type Page, type Locator } from '@playwright/test';

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutStepOnePage {
  readonly url = '/checkout-step-one.html';
  readonly errorMessage: Locator;

  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;
  private readonly cancelButton: Locator;

  constructor(private readonly page: Page) {
    this.firstNameInput  = page.getByPlaceholder('First Name');
    this.lastNameInput   = page.getByPlaceholder('Last Name');
    this.postalCodeInput = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton  = page.getByRole('button', { name: 'Continue' });
    this.cancelButton    = page.getByTestId('cancel');
    this.errorMessage    = page.getByTestId('error');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  // Fills only the fields that are provided — omit a key to leave that field blank.
  async fillForm(info: Partial<CheckoutInfo>): Promise<void> {
    if (info.firstName  !== undefined) await this.firstNameInput.fill(info.firstName);
    if (info.lastName   !== undefined) await this.lastNameInput.fill(info.lastName);
    if (info.postalCode !== undefined) await this.postalCodeInput.fill(info.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async fillAndContinue(info: CheckoutInfo): Promise<void> {
    await this.fillForm(info);
    await this.continue();
  }
}
