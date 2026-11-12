import { expect, test } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { UserActionsAPI } from './apicontracts/userActionsAPI';
import { UserActionsDB } from './database/userActionsDB';
import type { RegistrationUser } from './pages/loginPage';

const positiveUsersPath = resolve(__dirname, 'data', 'PosUsers.json');
const negativeUserPath = resolve(__dirname, 'data', 'NegUser.json');
const alexName = 'Alex Boschuk';
const originalAlexCredentials = {
  email: 'bostchuk@gmail.com',
  password: 'icfTest',
};
const userCases = JSON.parse(
  readFileSync(positiveUsersPath, 'utf8'),
) as RegistrationUser[];
let userActionsDB: UserActionsDB | undefined;

/** Reads the current fixture for a user identified by name. */
function readCurrentUser(name: string): RegistrationUser {
  const users = JSON.parse(
    readFileSync(positiveUsersPath, 'utf8'),
  ) as RegistrationUser[];
  // Keep entries with the requested name so the caller can verify uniqueness.
  const matchingUsers = users.filter((user) => user.name === name);

  if (matchingUsers.length !== 1) {
    throw new Error(
      `Expected one PosUsers entry named "${name}", found ${matchingUsers.length}.`,
    );
  }

  return matchingUsers[0];
}

/** Restores Alex's original credentials in both test-data files. */
function resetAlexCredentials(): void {
  const positiveUsers = JSON.parse(
    readFileSync(positiveUsersPath, 'utf8'),
  ) as RegistrationUser[];
  // Map fixtures to their indexes, then find Alex's entry for the credential reset.
  const matchingUsers = positiveUsers
    .map((user, index) => ({ user, index }))
    .filter(({ user }) => user.name === alexName);

  if (matchingUsers.length !== 1) {
    throw new Error(
      `Expected one PosUsers entry named "${alexName}", found ${matchingUsers.length}.`,
    );
  }

  const negativeUser = JSON.parse(
    readFileSync(negativeUserPath, 'utf8'),
  ) as RegistrationUser;
  if (negativeUser.name !== alexName) {
    throw new Error(`Expected NegUser to be named "${alexName}".`);
  }

  const { user, index } = matchingUsers[0];
  positiveUsers[index] = { ...user, ...originalAlexCredentials };
  writeFileSync(
    positiveUsersPath,
    `${JSON.stringify(positiveUsers, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    negativeUserPath,
    `${JSON.stringify(
      { ...negativeUser, ...originalAlexCredentials },
      null,
      2,
    )}\n`,
    'utf8',
  );
}

// Opens the database connection used to find and verify deleted users.
test.beforeAll(() => {
  userActionsDB = new UserActionsDB();
});

// Releases the database connection after all cleanup cases finish.
test.afterAll(async () => {
  await userActionsDB?.close();
});

for (const userCase of userCases) {
  // Deletes one fixture user through the API and verifies the database row is gone.
  test(`deletes ${userCase.name} through the API and verifies removal`, async ({
    request,
  }) => {
    if (!userActionsDB) {
      throw new Error('Database connection was not initialized.');
    }

    const user = readCurrentUser(userCase.name);
    const userActionsAPI = new UserActionsAPI(request);
    const persistedUser = await userActionsDB.findUserByEmail(user.email);
    if (!persistedUser) {
      throw new Error(`No database user found for ${user.email} before deletion.`);
    }

    const loginResponse = await userActionsAPI.login(user.email, user.password);
    expect(loginResponse.status()).toBe(200);

    const deleteResponse = await userActionsAPI.deleteUser(persistedUser.id);
    expect([200, 201]).toContain(deleteResponse.status());
    expect(await userActionsDB.findUserByEmail(user.email)).toBeUndefined();

    if (user.name === alexName) {
      resetAlexCredentials();
    }
  });
}
