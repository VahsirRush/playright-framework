import { test, expect } from '../fixtures/fixtures';
import { users, invalidUsers, loginErrors } from '../test-data/users';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user can log in', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.loginAs(users.standard);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('locked out user sees an error', async ({ loginPage }) => {
    await loginPage.loginAs(users.lockedOut);

    await expect(loginPage.errorMessage).toHaveText(loginErrors.lockedOut);
  });

  const invalidCases = [
    { name: 'wrong password', user: invalidUsers.wrongPassword, error: loginErrors.invalidCredentials },
    { name: 'unknown user', user: invalidUsers.unknownUser, error: loginErrors.invalidCredentials },
    { name: 'empty username', user: invalidUsers.emptyUsername, error: loginErrors.usernameRequired },
    { name: 'empty password', user: invalidUsers.emptyPassword, error: loginErrors.passwordRequired },
  ];

  for (const { name, user, error } of invalidCases) {
    test(`shows an error for ${name}`, async ({ loginPage }) => {
      await loginPage.loginAs(user);

      await expect(loginPage.errorMessage).toHaveText(error);
    });
  }
});

test.describe('Inventory', () => {
  test('logged-in user sees the product list', async ({ loggedInPage }) => {
    await expect(loggedInPage.title).toHaveText('Products');
    await expect(loggedInPage.inventoryItems).not.toHaveCount(0);
  });
});
