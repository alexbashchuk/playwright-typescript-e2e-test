import { Pool } from 'pg';

export type PersistedUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  householdId: number | null;
};

/** Validates the database settings and creates the PostgreSQL connection pool. */
function createPool(): Pool {
  const requiredVariables = [
    'PGHOST',
    'PGPORT',
    'PGDATABASE',
    'PGUSER',
    'PGPASSWORD',
  ] as const;
  // Collect unset settings so the error identifies every missing variable.
  const missingVariables = requiredVariables.filter(
    (name) => !process.env[name],
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing database environment variables: ${missingVariables.join(', ')}`,
    );
  }

  const port = Number(process.env.PGPORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PGPORT must be a valid TCP port number.');
  }

  return new Pool({
    host: process.env.PGHOST,
    port,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
  });
}

export class UserActionsDB {
  private readonly pool = createPool();

  /** Finds a persisted application user by their unique email address. */
  async findUserByEmail(email: string): Promise<PersistedUser | undefined> {
    const result = await this.pool.query<PersistedUser>(
      `SELECT id, name, email, role, "householdId"
       FROM public."User"
       WHERE email = $1`,
      [email],
    );

    return result.rows[0];
  }

  /** Closes the PostgreSQL connection pool after database checks finish. */
  async close(): Promise<void> {
    await this.pool.end();
  }
}
