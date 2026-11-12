import { type Locator, type Page } from '@playwright/test';

export class UserDashboard {
  private readonly avatarButton: Locator;
  private readonly profileMenuItem: Locator;
  private readonly signOutMenuItem: Locator;

  /** Locates the avatar control and the profile/sign-out menu items. */
  constructor(private readonly page: Page) {
    this.avatarButton = page
      .getByTestId('avatar-button')
      .or(page.locator('#user-menu-button'))
      .first();
    this.profileMenuItem = page.getByTestId('menu-item-You-profile');
    this.signOutMenuItem = page.getByRole('menuitem', { name: 'Sign out' });
  }

  /** Opens the account menu from the dashboard avatar. */
  async openUserMenu(): Promise<void> {
    await this.avatarButton.click();
    await this.waitAfterAction();
  }

  /** Opens the profile page from the account menu. */
  async openProfile(): Promise<void> {
    await this.profileMenuItem.click();
    await this.waitAfterAction();
  }

  /** Signs the current user out from the account menu. */
  async signOut(): Promise<void> {
    await this.signOutMenuItem.click();
    await this.waitAfterAction();
  }

  /** Returns the profile item in the account menu. */
  profileMenuItemLocator(): Locator {
    return this.profileMenuItem;
  }

  /** Pauses briefly after a dashboard menu interaction. */
  private async waitAfterAction(): Promise<void> {
    await this.page.waitForTimeout(1000);
  }
}
