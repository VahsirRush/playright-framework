export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const customer: CustomerInfo = {
  firstName: 'Test',
  lastName: 'User',
  postalCode: '12345',
};

export const checkoutErrors = {
  firstNameRequired: 'Error: First Name is required',
  lastNameRequired: 'Error: Last Name is required',
  postalCodeRequired: 'Error: Postal Code is required',
};

/** Saucedemo charges a flat 8% tax on the item total. */
export const TAX_RATE = 0.08;

export const orderSummary = {
  paymentInfo: 'SauceCard #31337',
  shippingInfo: 'Free Pony Express Delivery!',
};

export const orderConfirmation = {
  header: 'Thank you for your order!',
  text: 'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
};
