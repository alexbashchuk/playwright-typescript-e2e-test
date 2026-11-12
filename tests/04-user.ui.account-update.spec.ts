import { expect, test } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { UserDashboard } from './pages/userDashboard';
import { UserBackPage } from './pages/userBackPage';
import { UserProfile } from './pages/userProfile';
import type { RegistrationUser } from './pages/loginPage';

const negativeUserPath = resolve(__dirname, 'data', 'NegUser.json');
const positiveUsersPath = resolve(__dirname, 'data', 'PosUsers.json');
const updatedEmail = 'bostchuk9@gmail.com';
const updatedPassword = 'icfTest9';

/** Loads the current negative-user credentials from their JSON fixture. */
function readNegativeUser(): RegistrationUser {
  return JSON.parse(readFileSync(negativeUserPath, 'utf8')) as RegistrationUser;
}

/** Saves updated credentials to NegUser and the matching PosUsers entry. */
function saveUpdatedUser(user: RegistrationUser): void {
  const positiveUsers = JSON.parse(
    readFileSync(positiveUsersPath, 'utf8'),
  ) as RegistrationUser[];
  // Map fixtures to their indexes, then retain the one matching this user's name.
  const matchingUsers = positiveUsers
    .map((positiveUser, index) => ({ positiveUser, index }))
    .filter(({ positiveUser }) => positiveUser.name === user.name);

  if (matchingUsers.length !== 1) {
    throw new Error(
      `Expected one PosUsers entry named "${user.name}", found ${matchingUsers.length}.`,
    );
  }

  const { index, positiveUser } = matchingUsers[0];
  positiveUsers[index] = {
    ...positiveUser,
    email: user.email,
    password: user.password,
  };
  writeFileSync(
    positiveUsersPath,
    `${JSON.stringify(positiveUsers, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(negativeUserPath, `${JSON.stringify(user, null, 2)}\n`, 'utf8');
}

// Exercises profile updates, re-authentication, and sign-out in the UI.
test('updates the account email and password, then signs out', async ({
  page,
}) => {
  test.setTimeout(60_000);

  const user = readNegativeUser();
  const loginPage = new UserBackPage(page);
  const dashboard = new UserDashboard(page);
  const profile = new UserProfile(page);

  await loginPage.open();
  await expect(loginPage.loginForm()).toBeVisible();
  await expect.soft(loginPage.welcomeHeader()).toHaveText('Welcome back!');

  await loginPage.login(user.email, user.password);
  await expect(page).toHaveURL(/\/dashboard$/);

  await dashboard.openUserMenu();
  await expect(dashboard.profileMenuItemLocator()).toBeVisible();
  await expect.soft(dashboard.profileMenuItemLocator()).toHaveText(
    'Your profile',
  );
  await dashboard.openProfile();
  await expect(page).toHaveURL(/\/profile$/);

  await profile.updateEmail(updatedEmail);
  await expect(profile.successMessageLocator()).toHaveText(
    'Successfully updated user!',
  );
  saveUpdatedUser({ ...user, email: updatedEmail });

  await profile.openPasswordDialog();
  await expect(profile.passwordDialogLocator()).toBeVisible();
  await expect(
    profile.passwordDialogLocator().getByRole('heading', {
      name: 'Update password',
    }),
  ).toBeVisible();
  await expect(profile.passwordInstruction()).toHaveText(
    'If password update successful then you will be prompted to log in page.',
  );

  await profile.updatePassword(user.password, updatedPassword);
  await expect(page).toHaveURL(/\/auth\/login$/);
  saveUpdatedUser({ ...user, email: updatedEmail, password: updatedPassword });

  await loginPage.open();
  await expect(loginPage.loginForm()).toBeVisible();
  await expect.soft(loginPage.welcomeHeader()).toHaveText('Welcome back!');
  await loginPage.login(updatedEmail, updatedPassword);
  await expect(page).toHaveURL(/\/dashboard$/);

  await dashboard.openUserMenu();
  await dashboard.signOut();
  await expect(page).toHaveURL(/\/auth\/login$/);
});
