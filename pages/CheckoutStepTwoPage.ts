import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { InventoryPage } from './InventoryPage';
import { CheckoutCompletePage } from './CheckoutCompletePage';

export class CheckoutStepTwoPage extends BasePage {
  protected readonly path = '/checkout-step-two.html';

  readonly title: Locator;
  readonly cartItems: Locator;
  readonly itemNames: Locator;
  readonly paymentInfo: Locator;
  readonly shippingInfo: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.cartItems = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.paymentInfo = page.getByTestId('payment-info-value');
    this.shippingInfo = page.getByTestId('shipping-info-value');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.cancelButton = page.getByTestId('cancel');
  }

  async finish(): Promise<CheckoutCompletePage> {
    await this.finishButton.click();
    return new CheckoutCompletePage(this.page);
  }

  async cancel(): Promise<InventoryPage> {
    await this.cancelButton.click();
    return new InventoryPage(this.page);
  }
}
