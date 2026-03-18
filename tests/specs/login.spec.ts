import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

interface Credentials {
  username: string;
  password: string;
}

const Users = {
  standard:  { username: 'standard_user',      password: 'secret_sauce' },
  lockedOut: { username: 'locked_out_user',     password: 'secret_sauce' },
} satisfies Record<string, Credentials>;

enum ErrorMessage {
  InvalidCredentials = 'Username and password do not match any user in this service',
  LockedOut          = 'Sorry, this user has been locked out.',
  UsernameRequired   = 'Username is required',
  PasswordRequired   = 'Password is required',
}

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test.describe('Positive', () => {
    // L-01
    test('L-01: standard_user is redirected to inventory after login', async ({ page }) => {
      await loginPage.login(Users.standard.username, Users.standard.password);
      await expect(page).toHaveURL('/inventory.html');
    });

    // L-02
    test('L-02: session persists after page reload', async ({ page }) => {
      await loginPage.login(Users.standard.username, Users.standard.password);
      await expect(page).toHaveURL('/inventory.html');
      await page.reload();
      await expect(page).toHaveURL('/inventory.html');
    });
  });

  test.describe('Negative', () => {
    // L-03
    test('L-03: wrong password shows invalid credentials error', async () => {
      await loginPage.login(Users.standard.username, 'wrong_password');
      await expect(loginPage.errorMessage).toContainText(ErrorMessage.InvalidCredentials);
    });

    // L-04
    test('L-04: wrong username shows invalid credentials error', async () => {
      await loginPage.login('bad_user', Users.standard.password);
      await expect(loginPage.errorMessage).toContainText(ErrorMessage.InvalidCredentials);
    });

    // L-05
    test('L-05: locked_out_user sees locked-out error', async () => {
      await loginPage.login(Users.lockedOut.username, Users.lockedOut.password);
      await expect(loginPage.errorMessage).toContainText(ErrorMessage.LockedOut);
    });

    // L-06
    test('L-06: empty username shows username-required error', async () => {
      await loginPage.login('', Users.standard.password);
      await expect(loginPage.errorMessage).toContainText(ErrorMessage.UsernameRequired);
    });

    // L-07
    test('L-07: empty password shows password-required error', async () => {
      await loginPage.login(Users.standard.username, '');
      await expect(loginPage.errorMessage).toContainText(ErrorMessage.PasswordRequired);
    });

    // L-08
    test('L-08: both fields empty shows username-required error', async () => {
      await loginPage.login('', '');
      await expect(loginPage.errorMessage).toContainText(ErrorMessage.UsernameRequired);
    });
  });

  test.describe('Boundary', () => {
    // L-09
    test('L-09: username with leading/trailing spaces is rejected', async () => {
      await loginPage.login(' standard_user ', Users.standard.password);
      await expect(loginPage.errorMessage).toBeVisible();
    });

    // L-10
    test('L-10: SQL injection in username is rejected without server error', async ({ page }) => {
      await loginPage.login("' OR '1'='1", Users.standard.password);
      await expect(loginPage.errorMessage).toBeVisible();
      await expect(page).toHaveURL('/');
    });
  });
});
