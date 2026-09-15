import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { InventoryPage } from './InventoryPage';
import { CheckoutStepOnePage } from './CheckoutStepOnePage';

export class CartPage extends BasePage {
  protected readonly path = '/cart.html';

  readonly title: Locator;
  readonly cartItems: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly itemQuantities: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.cartItems = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.itemQuantities = page.getByTestId('item-quantity');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.checkoutButton = page.getByTestId('checkout');
  }

  /** Removes the cart line whose product name matches, e.g. 'Sauce Labs Backpack'. */
  async removeItem(productName: string): Promise<void> {
    await this.cartItems.filter({ hasText: productName }).getByTestId(/^remove-/).click();
  }

  async continueShopping(): Promise<InventoryPage> {
    await this.continueShoppingButton.click();
    return new InventoryPage(this.page);
  }

  async checkout(): Promise<CheckoutStepOnePage> {
    await this.checkoutButton.click();
    return new CheckoutStepOnePage(this.page);
  }
}
