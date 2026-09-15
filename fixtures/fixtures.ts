import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutStepOnePage } from '../pages/CheckoutStepOnePage';
import { CheckoutStepTwoPage } from '../pages/CheckoutStepTwoPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import { users } from '../test-data/users';

type PageFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutStepOnePage: CheckoutStepOnePage;
  checkoutStepTwoPage: CheckoutStepTwoPage;
  checkoutCompletePage: CheckoutCompletePage;
  /** Starts the test already logged in as standard_user, on the inventory page. */
  loggedInPage: InventoryPage;
};

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutStepOnePage: async ({ page }, use) => {
    await use(new CheckoutStepOnePage(page));
  },

  checkoutStepTwoPage: async ({ page }, use) => {
    await use(new CheckoutStepTwoPage(page));
  },

  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },

  loggedInPage: async ({ loginPage, inventoryPage }, use) => {
    await loginPage.goto();
    await loginPage.loginAs(users.standard);
    await use(inventoryPage);
  },
});

export { expect } from '@playwright/test';
