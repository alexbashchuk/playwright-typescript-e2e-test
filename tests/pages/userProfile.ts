import { type Locator, type Page } from '@playwright/test';

export class UserProfile {
  private readonly profileForm: Locator;
  private readonly editButton: Locator;
  private readonly emailInput: Locator;
  private readonly updateProfileButton: Locator;
  private readonly successMessage: Locator;
  private readonly editPasswordButton: Locator;
  private readonly passwordDialog: Locator;
  private readonly passwordDialogPanel: Locator;
  private readonly oldPasswordInput: Locator;
  private readonly newPasswordInput: Locator;
  private readonly updatePasswordButton: Locator;

  /** Locates profile editing controls and the password-update dialog. */
  constructor(private readonly page: Page) {
    this.profileForm = page.locator('form[name="register-form"]').first();
    this.editButton = this.profileForm.getByRole('button', { name: 'Edit' });
    this.emailInput = this.profileForm.locator('#email');
    this.updateProfileButton = this.profileForm.locator(
      'button[name="update-button btn"]',
    );
    this.successMessage = page.getByTestId('success-message');
    this.editPasswordButton = page.getByRole('button', {
      name: 'Edit password',
    });
    this.passwordDialog = page.getByRole('dialog', {
      name: 'Update password',
    });
    this.passwordDialogPanel = this.passwordDialog.locator('div.fixed > div');
    this.oldPasswordInput = this.passwordDialog.locator('#old-password');
    this.newPasswordInput = this.passwordDialog.locator('#new-password');
    this.updatePasswordButton = this.passwordDialog.locator(
      'button[name="password-update-button btn"]',
    );
  }

  /** Edits the profile email and submits the profile form. */
  async updateEmail(email: string): Promise<void> {
    await this.editButton.click();
    await this.waitAfterAction();
    await this.emailInput.fill(email);
    await this.waitAfterAction();
    await this.updateProfileButton.click();
    await this.waitAfterAction();
  }

  /** Opens the password-update dialog and waits for its panel to appear. */
  async openPasswordDialog(): Promise<void> {
    await this.editPasswordButton.click();
    await this.passwordDialogPanel.waitFor({ state: 'visible' });
    await this.waitAfterAction();
  }

  /** Submits the current and replacement passwords in the dialog. */
  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.oldPasswordInput.fill(oldPassword);
    await this.waitAfterAction();
    await this.newPasswordInput.fill(newPassword);
    await this.waitAfterAction();
    await this.updatePasswordButton.click();
    await this.waitAfterAction();
  }

  /** Returns the profile-update success notification. */
  successMessageLocator(): Locator {
    return this.successMessage;
  }

  /** Returns the visible panel inside the password-update dialog. */
  passwordDialogLocator(): Locator {
    return this.passwordDialogPanel;
  }

  /** Returns the instructional text shown in the password dialog. */
  passwordInstruction(): Locator {
    return this.passwordDialog.locator('p');
  }

  /** Pauses briefly after a profile or password form interaction. */
  private async waitAfterAction(): Promise<void> {
    await this.page.waitForTimeout(1000);
  }
}
