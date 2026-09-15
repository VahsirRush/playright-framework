import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartPage } from './CartPage';
import { CheckoutStepTwoPage } from './CheckoutStepTwoPage';

export class CheckoutStepOnePage extends BasePage {
  protected readonly path = '/checkout-step-one.html';

  readonly title: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.errorMessage = page.getByTestId('error');
  }

  async fillInformation(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  /** Submits the form. If validation fails the page stays here — assert on errorMessage instead. */
  async continue(): Promise<CheckoutStepTwoPage> {
    await this.continueButton.click();
    return new CheckoutStepTwoPage(this.page);
  }

  async cancel(): Promise<CartPage> {
    await this.cancelButton.click();
    return new CartPage(this.page);
  }
}
