import { type Locator, type Page } from '@playwright/test';

export class UserBackPage {
  private readonly loginFormLocator: Locator;
  private readonly welcomeHeaderLocator: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  /** Locates the login form fields, submit button, and welcome heading. */
  constructor(private readonly page: Page) {
    this.loginFormLocator = page.locator('form[class*="login-form"]');
    this.welcomeHeaderLocator = page.getByRole('heading', { level: 2 });
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  /** Navigates to the application's login page. */
  async open(): Promise<void> {
    await this.page.goto('/auth/login');
  }

  /** Enters the supplied credentials and submits the login form. */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.waitAfterAction();
    await this.passwordInput.fill(password);
    await this.waitAfterAction();
    await this.loginButton.click();
    await this.waitAfterAction();
  }

  /** Returns the login form locator for visibility assertions. */
  loginForm(): Locator {
    return this.loginFormLocator;
  }

  /** Returns the welcome heading locator for text assertions. */
  welcomeHeader(): Locator {
    return this.welcomeHeaderLocator;
  }

  /** Pauses briefly after a login form interaction. */
  private async waitAfterAction(): Promise<void> {
    await this.page.waitForTimeout(1000);
  }
}
