import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { UserActionsAPI } from './apicontracts/userActionsAPI';
import type { RegistrationUser } from './pages/loginPage';

const negativeUserPath = resolve(__dirname, 'data', 'NegUser.json');

/** Loads the negative-user fixture used by the authenticated API lookup. */
function readNegativeUser(): RegistrationUser {
  return JSON.parse(readFileSync(negativeUserPath, 'utf8')) as RegistrationUser;
}

// Validates that the API returns the expected user for the fixture credentials.
test('finds the negative-case user through the API', async ({ request }) => {
  const mainUser = readNegativeUser();
  const userActionsAPI = new UserActionsAPI(request);
  const tokenResponse = await userActionsAPI.createBearerToken(
    mainUser.email,
    mainUser.password,
  );
  expect(tokenResponse.status()).toBe(200);

  const tokenPayload: unknown = await tokenResponse.json();
  if (
    typeof tokenPayload !== 'object' ||
    tokenPayload === null ||
    !('accessToken' in tokenPayload) ||
    typeof tokenPayload.accessToken !== 'string'
  ) {
    throw new Error('Token response did not contain an accessToken.');
  }

  const userResponse = await userActionsAPI.getUserByEmail(
    mainUser.email,
    tokenPayload.accessToken,
  );
  expect(userResponse.status()).toBe(200);

  const userPayload: unknown = await userResponse.json();
  expect(userPayload).toMatchObject({
    success: 'User found.',
    user: {
      email: mainUser.email,
      name: mainUser.name,
    },
  });
});
