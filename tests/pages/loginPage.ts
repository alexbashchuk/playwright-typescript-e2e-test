import { type Locator, type Page } from '@playwright/test';

export type RegistrationUser = {
  name: string;
  email: string;
  password: string;
};

export class LoginPage {
  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;

  /** Locates the registration form controls used by this page object. */
  constructor(private readonly page: Page) {
    this.nameInput = page.locator('#name');
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.getByRole('button', { name: 'Sign up' });
  }

  /** Registers a user and waits after each input or click. */
  async register(user: RegistrationUser): Promise<void> {
    await this.page.goto('/auth/register');
    await this.nameInput.fill(user.name);
    await this.waitAfterAction();
    await this.emailInput.fill(user.email);
    await this.waitAfterAction();
    await this.passwordInput.fill(user.password);
    await this.waitAfterAction();
    await this.submitButton.click();
    await this.waitAfterAction();
  }

  /** Pauses briefly after a registration interaction. */
  private async waitAfterAction(): Promise<void> {
    await this.page.waitForTimeout(1000);
  }

  /** Returns the registration success notification. */
  successMessage(): Locator {
    return this.page.getByTestId('success-message');
  }

  /** Returns the registration error notification. */
  errorMessage(): Locator {
    return this.page.getByTestId('error-message');
  }
}
