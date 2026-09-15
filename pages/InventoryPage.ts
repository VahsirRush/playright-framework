import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartPage } from './CartPage';
import { ProductDetailPage } from './ProductDetailPage';

/** Option values of saucedemo's product sort <select>. */
export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  protected readonly path = '/inventory.html';

  readonly title: Locator;
  readonly inventoryItems: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.inventoryItems = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortDropdown = page.getByTestId('product-sort-container');
  }

  /** The product card whose name matches, e.g. 'Sauce Labs Backpack'. */
  private item(productName: string): Locator {
    return this.inventoryItems.filter({ hasText: productName });
  }

  addToCartButtonFor(productName: string): Locator {
    return this.item(productName).getByTestId(/^add-to-cart-/);
  }

  removeButtonFor(productName: string): Locator {
    return this.item(productName).getByTestId(/^remove-/);
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async addToCart(productName: string): Promise<void> {
    await this.addToCartButtonFor(productName).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.removeButtonFor(productName).click();
  }

  async openProduct(productName: string): Promise<ProductDetailPage> {
    await this.item(productName).getByTestId(/^item-\d+-title-link$/).click();
    const detail = new ProductDetailPage(this.page);
    // The URL changes before the SPA re-renders, and the detail page reuses the inventory
    // card test ids (e.g. inventory-item-name). Wait for a detail-only element so callers
    // never hit the old inventory cards.
    await detail.backToProductsButton.waitFor();
    return detail;
  }

  async openCart(): Promise<CartPage> {
    await this.shoppingCartLink.click();
    return new CartPage(this.page);
  }
}
