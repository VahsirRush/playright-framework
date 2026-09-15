import { test, expect } from '../fixtures/fixtures';
import { products, allProducts, formatPrice } from '../test-data/products';

test.beforeEach(async ({ loggedInPage }) => {
  await expect(loggedInPage.title).toHaveText('Products');
});

test.describe('Inventory sorting', () => {
  const namesAToZ = allProducts.map((p) => p.name).sort((a, b) => a.localeCompare(b));
  const pricesLowToHigh = allProducts.map((p) => p.price).sort((a, b) => a - b).map(formatPrice);

  test('sorts by name A to Z', async ({ inventoryPage }) => {
    // A to Z is the default order, so sort the other way first to prove the sort actually applies.
    await inventoryPage.sortBy('za');
    await expect(inventoryPage.itemNames).toHaveText([...namesAToZ].reverse());

    await inventoryPage.sortBy('az');

    await expect(inventoryPage.sortDropdown).toHaveValue('az');
    await expect(inventoryPage.itemNames).toHaveText(namesAToZ);
  });

  test('sorts by name Z to A', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');

    await expect(inventoryPage.sortDropdown).toHaveValue('za');
    await expect(inventoryPage.itemNames).toHaveText([...namesAToZ].reverse());
  });

  test('sorts by price low to high', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');

    await expect(inventoryPage.sortDropdown).toHaveValue('lohi');
    await expect(inventoryPage.itemPrices).toHaveText(pricesLowToHigh);
  });

  test('sorts by price high to low', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');

    await expect(inventoryPage.sortDropdown).toHaveValue('hilo');
    await expect(inventoryPage.itemPrices).toHaveText([...pricesLowToHigh].reverse());
  });
});

test.describe('Cart badge from the inventory page', () => {
  test('badge count follows each add and remove', async ({ inventoryPage }) => {
    const badge = inventoryPage.shoppingCartBadge;
    await expect(badge).toHaveCount(0);

    await inventoryPage.addToCart(products.backpack.name);
    await expect(badge).toHaveText('1');
    await expect(inventoryPage.removeButtonFor(products.backpack.name)).toBeVisible();

    await inventoryPage.addToCart(products.bikeLight.name);
    await expect(badge).toHaveText('2');

    await inventoryPage.addToCart(products.onesie.name);
    await expect(badge).toHaveText('3');

    await inventoryPage.removeFromCart(products.bikeLight.name);
    await expect(badge).toHaveText('2');
    await expect(inventoryPage.addToCartButtonFor(products.bikeLight.name)).toBeVisible();

    await inventoryPage.removeFromCart(products.backpack.name);
    await expect(badge).toHaveText('1');

    await inventoryPage.removeFromCart(products.onesie.name);
    await expect(badge).toHaveCount(0);
  });
});

test.describe('Product detail page', () => {
  test('adds and removes an item from the detail page', async ({ inventoryPage }) => {
    const detail = await inventoryPage.openProduct(products.backpack.name);
    await expect(detail.itemName).toHaveText(products.backpack.name);
    await expect(detail.itemPrice).toHaveText(formatPrice(products.backpack.price));
    await expect(detail.shoppingCartBadge).toHaveCount(0);

    await detail.addToCart();
    await expect(detail.shoppingCartBadge).toHaveText('1');
    await expect(detail.removeButton).toBeVisible();
    await expect(detail.addToCartButton).toHaveCount(0);

    await detail.removeFromCart();
    await expect(detail.shoppingCartBadge).toHaveCount(0);
    await expect(detail.addToCartButton).toBeVisible();
    await expect(detail.removeButton).toHaveCount(0);
  });
});

test.describe('Cart page', () => {
  test('shows added items with the correct name, price and quantity', async ({ inventoryPage }) => {
    const added = [products.backpack, products.fleeceJacket];
    for (const product of added) {
      await inventoryPage.addToCart(product.name);
    }

    const cart = await inventoryPage.openCart();

    await expect(cart.title).toHaveText('Your Cart');
    await expect(cart.itemNames).toHaveText(added.map((p) => p.name));
    await expect(cart.itemPrices).toHaveText(added.map((p) => formatPrice(p.price)));
    await expect(cart.itemQuantities).toHaveText(['1', '1']);
  });

  test('removing an item from the cart updates the list and badge', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.bikeLight.name);
    await inventoryPage.addToCart(products.backpack.name);
    const cart = await inventoryPage.openCart();
    await expect(cart.shoppingCartBadge).toHaveText('2');

    await cart.removeItem(products.backpack.name);
    await expect(cart.itemNames).toHaveText([products.bikeLight.name]);
    await expect(cart.shoppingCartBadge).toHaveText('1');

    await cart.removeItem(products.bikeLight.name);
    await expect(cart.cartItems).toHaveCount(0);
    await expect(cart.shoppingCartBadge).toHaveCount(0);
  });

  test('continue shopping returns to the inventory page', async ({ page, inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    const cart = await inventoryPage.openCart();

    const inventory = await cart.continueShopping();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventory.title).toHaveText('Products');
    await expect(inventory.shoppingCartBadge).toHaveText('1');
  });
});
