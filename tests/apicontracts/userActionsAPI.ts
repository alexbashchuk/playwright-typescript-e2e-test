import { type APIRequestContext, type APIResponse } from '@playwright/test';

const apiBaseUrl =
  process.env.API_BASE_URL ?? process.env.BASE_URL ?? 'http://localhost:3000';

export class UserActionsAPI {
  /** Stores the Playwright request context used for API calls. */
  constructor(private readonly request: APIRequestContext) {}

  /** Requests a bearer token for the supplied user's credentials. */
  async createBearerToken(
    email: string,
    password: string,
  ): Promise<APIResponse> {
    return this.request.post(
      new URL('/api/auth/token', apiBaseUrl).toString(),
      { data: { email, password } },
    );
  }

  /** Authenticates a user through the application's login endpoint. */
  async login(email: string, password: string): Promise<APIResponse> {
    return this.request.post(new URL('/api/auth/login', apiBaseUrl).toString(), {
      data: { email, password },
    });
  }

  /** Fetches the authenticated user's record by email. */
  async getUserByEmail(
    email: string,
    accessToken: string,
  ): Promise<APIResponse> {
    return this.request.get(new URL('/api/user', apiBaseUrl).toString(), {
      params: { email },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  /** Deletes a user record by its database identifier. */
  async deleteUser(id: number): Promise<APIResponse> {
    return this.request.delete(new URL('/api/user', apiBaseUrl).toString(), {
      data: { id },
    });
  }
}
