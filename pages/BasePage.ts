import { Locator, Page } from '@playwright/test';

/**
 * Common base for all page objects. Holds the Page reference and any
 * helpers shared across pages.
 */
export abstract class BasePage {
  /** Header elements present on every logged-in page (not on the login page). */
  readonly shoppingCartLink: Locator;
  readonly shoppingCartBadge: Locator;

  constructor(protected readonly page: Page) {
    this.shoppingCartLink = page.getByTestId('shopping-cart-link');
    this.shoppingCartBadge = page.getByTestId('shopping-cart-badge');
  }

  /** Path relative to baseURL (set in playwright.config.ts). */
  protected abstract readonly path: string;

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }
}
