import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { UserActionsDB } from './database/userActionsDB';
import type { RegistrationUser } from './pages/loginPage';

const negativeUserPath = resolve(__dirname, 'data', 'NegUser.json');
let userActionsDB: UserActionsDB | undefined;

/** Loads the latest negative-user fixture, including its changed email. */
function readNegativeUser(): RegistrationUser {
  return JSON.parse(readFileSync(negativeUserPath, 'utf8')) as RegistrationUser;
}

// Opens a database connection for the updated-email validation.
test.beforeAll(() => {
  userActionsDB = new UserActionsDB();
});

// Closes the database connection after validation.
test.afterAll(async () => {
  await userActionsDB?.close();
});

// Confirms the email written by the account-update test exists in the database.
test('finds the updated user email in public.User', async () => {
  if (!userActionsDB) {
    throw new Error('Database connection was not initialized.');
  }

  const negativeUser = readNegativeUser();
  const persistedUser = await userActionsDB.findUserByEmail(negativeUser.email);

  expect(
    persistedUser,
    `No database user found for ${negativeUser.email}`,
  ).toBeDefined();
  expect(persistedUser?.email).toBe(negativeUser.email);
});
