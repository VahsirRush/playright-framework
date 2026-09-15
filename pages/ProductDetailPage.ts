import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { InventoryPage } from './InventoryPage';
import { CartPage } from './CartPage';

export class ProductDetailPage extends BasePage {
  protected readonly path = '/inventory-item.html';

  readonly itemName: Locator;
  readonly itemDescription: Locator;
  readonly itemPrice: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backToProductsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.itemName = page.getByTestId('inventory-item-name');
    this.itemDescription = page.getByTestId('inventory-item-desc');
    this.itemPrice = page.getByTestId('inventory-item-price');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.removeButton = page.getByTestId('remove');
    this.backToProductsButton = page.getByTestId('back-to-products');
  }

  /** Opens the detail page for a product by its saucedemo item id (e.g. 4 = Sauce Labs Backpack). */
  async gotoItem(id: number): Promise<void> {
    await this.page.goto(`${this.path}?id=${id}`);
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
  }

  async backToProducts(): Promise<InventoryPage> {
    await this.backToProductsButton.click();
    return new InventoryPage(this.page);
  }

  async openCart(): Promise<CartPage> {
    await this.shoppingCartLink.click();
    return new CartPage(this.page);
  }
}
