import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { InventoryPage } from './InventoryPage';

export class CheckoutCompletePage extends BasePage {
  protected readonly path = '/checkout-complete.html';

  readonly title: Locator;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.completeHeader = page.getByTestId('complete-header');
    this.completeText = page.getByTestId('complete-text');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async backHome(): Promise<InventoryPage> {
    await this.backHomeButton.click();
    return new InventoryPage(this.page);
  }
}
