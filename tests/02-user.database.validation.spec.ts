import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { UserActionsDB } from './database/userActionsDB';
import type { RegistrationUser } from './pages/loginPage';

const positiveUsersPath = resolve(__dirname, 'data', 'PosUsers.json');
let userActionsDB: UserActionsDB | undefined;

/** Loads all positive-user fixtures for database persistence checks. */
function readPositiveUsers(): RegistrationUser[] {
  return JSON.parse(readFileSync(positiveUsersPath, 'utf8')) as RegistrationUser[];
}

// Opens one database connection for the spec's persistence assertions.
test.beforeAll(() => {
  userActionsDB = new UserActionsDB();
});

// Releases the database connection after the spec completes.
test.afterAll(async () => {
  await userActionsDB?.close();
});

// Verifies every positive fixture was saved with the expected user data.
test('persists PosUsers entries in public.User', async () => {
  for (const user of readPositiveUsers()) {
    if (!userActionsDB) {
      throw new Error('Database connection was not initialized.');
    }

    const persistedUser = await userActionsDB.findUserByEmail(user.email);

    expect(
      persistedUser,
      `No database user found for ${user.email}`,
    ).toBeDefined();
    expect(persistedUser).toMatchObject({
      name: user.name,
      email: user.email,
      role: 'USER',
    });
    expect(persistedUser?.id).toBeGreaterThan(0);
  }
});
