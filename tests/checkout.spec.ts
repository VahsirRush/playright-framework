import { test, expect } from '../fixtures/fixtures';
import { products, formatPrice, Product } from '../test-data/products';
import {
  customer,
  checkoutErrors,
  TAX_RATE,
  orderSummary,
  orderConfirmation,
} from '../test-data/checkout';

/** Expected overview labels, computed in cents to avoid floating-point drift. */
function expectedTotals(items: Product[]) {
  const subtotalCents = items.reduce((sum, p) => sum + Math.round(p.price * 100), 0);
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  return {
    subtotal: `Item total: ${formatPrice(subtotalCents / 100)}`,
    tax: `Tax: ${formatPrice(taxCents / 100)}`,
    total: `Total: ${formatPrice((subtotalCents + taxCents) / 100)}`,
  };
}

test.beforeEach(async ({ loggedInPage }) => {
  await expect(loggedInPage.title).toHaveText('Products');
});

test.describe('Checkout happy path', () => {
  test('completes an order end to end', async ({ page, inventoryPage }) => {
    const items = [products.bikeLight, products.backpack];
    for (const product of items) {
      await inventoryPage.addToCart(product.name);
    }
    await expect(inventoryPage.shoppingCartBadge).toHaveText('2');

    const cart = await inventoryPage.openCart();
    await expect(cart.itemNames).toHaveText(items.map((p) => p.name));

    const stepOne = await cart.checkout();
    await expect(stepOne.title).toHaveText('Checkout: Your Information');
    await stepOne.fillInformation(customer.firstName, customer.lastName, customer.postalCode);

    const stepTwo = await stepOne.continue();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(stepTwo.title).toHaveText('Checkout: Overview');
    await expect(stepTwo.itemNames).toHaveText(items.map((p) => p.name));
    await expect(stepTwo.paymentInfo).toHaveText(orderSummary.paymentInfo);
    await expect(stepTwo.shippingInfo).toHaveText(orderSummary.shippingInfo);

    const totals = expectedTotals(items);
    await expect(stepTwo.subtotalLabel).toHaveText(totals.subtotal);
    await expect(stepTwo.taxLabel).toHaveText(totals.tax);
    await expect(stepTwo.totalLabel).toHaveText(totals.total);

    const complete = await stepTwo.finish();
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(complete.title).toHaveText('Checkout: Complete!');
    await expect(complete.completeHeader).toHaveText(orderConfirmation.header);
    await expect(complete.completeText).toHaveText(orderConfirmation.text);
    await expect(complete.shoppingCartBadge).toHaveCount(0);

    const inventory = await complete.backHome();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventory.title).toHaveText('Products');
  });
});

test.describe('Checkout information validation', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    const cart = await inventoryPage.openCart();
    await cart.checkout();
  });

  const cases = [
    { field: 'first name', info: { ...customer, firstName: '' }, error: checkoutErrors.firstNameRequired },
    { field: 'last name', info: { ...customer, lastName: '' }, error: checkoutErrors.lastNameRequired },
    { field: 'postal code', info: { ...customer, postalCode: '' }, error: checkoutErrors.postalCodeRequired },
  ];

  for (const { field, info, error } of cases) {
    test(`shows an error when ${field} is missing`, async ({ page, checkoutStepOnePage }) => {
      await checkoutStepOnePage.fillInformation(info.firstName, info.lastName, info.postalCode);
      await checkoutStepOnePage.continue();

      await expect(checkoutStepOnePage.errorMessage).toHaveText(error);
      await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    });
  }
});

test.describe('Cancelling checkout', () => {
  const items = [products.bikeLight, products.boltTShirt];

  test.beforeEach(async ({ inventoryPage }) => {
    for (const product of items) {
      await inventoryPage.addToCart(product.name);
    }
  });

  test('cancel at step one returns to the cart with its contents preserved', async ({ page, inventoryPage }) => {
    const cart = await inventoryPage.openCart();
    const stepOne = await cart.checkout();

    const cartAgain = await stepOne.cancel();

    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(cartAgain.itemNames).toHaveText(items.map((p) => p.name));
    await expect(cartAgain.shoppingCartBadge).toHaveText('2');
  });

  test('cancel at step two returns to inventory with the cart preserved', async ({ page, inventoryPage }) => {
    const cart = await inventoryPage.openCart();
    const stepOne = await cart.checkout();
    await stepOne.fillInformation(customer.firstName, customer.lastName, customer.postalCode);
    const stepTwo = await stepOne.continue();

    const inventory = await stepTwo.cancel();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventory.shoppingCartBadge).toHaveText('2');
    const cartAgain = await inventory.openCart();
    await expect(cartAgain.itemNames).toHaveText(items.map((p) => p.name));
  });
});

test.describe('Edge cases', () => {
  test('checkout with an empty cart is not blocked (saucedemo allows ordering nothing)', async ({
    page,
    inventoryPage,
  }) => {
    const cart = await inventoryPage.openCart();
    await expect(cart.cartItems).toHaveCount(0);
    await expect(cart.shoppingCartBadge).toHaveCount(0);

    // Saucedemo has no empty-cart guard: this documents current behaviour rather than
    // an ideal requirement. If the app ever starts blocking this, this test will fail.
    const stepOne = await cart.checkout();
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    await stepOne.fillInformation(customer.firstName, customer.lastName, customer.postalCode);

    const stepTwo = await stepOne.continue();
    await expect(stepTwo.cartItems).toHaveCount(0);
    await expect(stepTwo.totalLabel).toHaveText('Total: $0.00');
  });

  test('adding from inventory then the detail page does not duplicate the item', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await expect(inventoryPage.shoppingCartBadge).toHaveText('1');

    const detail = await inventoryPage.openProduct(products.backpack.name);
    // Already in the cart, so the detail page offers Remove rather than a second Add.
    await expect(detail.removeButton).toBeVisible();
    await expect(detail.addToCartButton).toHaveCount(0);
    await expect(detail.shoppingCartBadge).toHaveText('1');

    const cart = await detail.openCart();
    await expect(cart.itemNames).toHaveText([products.backpack.name]);
    await expect(cart.itemQuantities).toHaveText(['1']);
  });

  test('adding from the detail page then inventory does not duplicate the item', async ({ inventoryPage }) => {
    const detail = await inventoryPage.openProduct(products.backpack.name);
    await detail.addToCart();
    await expect(detail.shoppingCartBadge).toHaveText('1');

    const inventory = await detail.backToProducts();
    // Already in the cart, so the inventory card offers Remove rather than a second Add.
    await expect(inventory.removeButtonFor(products.backpack.name)).toBeVisible();
    await expect(inventory.addToCartButtonFor(products.backpack.name)).toHaveCount(0);
    await expect(inventory.shoppingCartBadge).toHaveText('1');

    const cart = await inventory.openCart();
    await expect(cart.itemNames).toHaveText([products.backpack.name]);
    await expect(cart.itemQuantities).toHaveText(['1']);
  });
});
