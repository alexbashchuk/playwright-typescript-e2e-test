import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import positiveUsersData from './data/PosUsers.json';
import { LoginPage, type RegistrationUser } from './pages/loginPage';

const positiveUsers = positiveUsersData as RegistrationUser[];
const negativeUserPath = resolve(__dirname, 'data', 'NegUser.json');

/** Reads the negative registration fixture for the duplicate-email case. */
function readNegativeUser(): RegistrationUser {
  return JSON.parse(readFileSync(negativeUserPath, 'utf8')) as RegistrationUser;
}

// Groups registration cases so the duplicate-email check follows user creation.
test.describe.serial('User registration', () => {
  for (const user of positiveUsers) {
    // Verifies that a fixture user can register successfully through the UI.
    test(`registers ${user.email}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.register(user);

      await expect(loginPage.successMessage()).toHaveText(
        'Successfully registered new user!',
      );
    });
  }

  // Verifies that registering an existing email displays the expected error.
  test('rejects a registration for an existing email', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.register(readNegativeUser());

    await expect(loginPage.errorMessage()).toHaveText('Email already in use!');
  });
});
