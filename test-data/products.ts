/**
 * Saucedemo's product catalog. `id` is the value used in
 * /inventory-item.html?id=<id>.
 */
export interface Product {
  id: number;
  name: string;
  price: number;
}

export const products = {
  bikeLight: { id: 0, name: 'Sauce Labs Bike Light', price: 9.99 },
  boltTShirt: { id: 1, name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
  onesie: { id: 2, name: 'Sauce Labs Onesie', price: 7.99 },
  redTShirt: { id: 3, name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99 },
  backpack: { id: 4, name: 'Sauce Labs Backpack', price: 29.99 },
  fleeceJacket: { id: 5, name: 'Sauce Labs Fleece Jacket', price: 49.99 },
} satisfies Record<string, Product>;

export const allProducts: Product[] = Object.values(products);

/** Formats a price the way saucedemo displays it, e.g. 9.99 -> '$9.99'. */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
