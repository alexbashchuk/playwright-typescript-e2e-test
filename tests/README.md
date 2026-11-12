# Registration tests

Run the serial Chromium suite with `npm test`. The specs run in this order:

1. `01-user.ui.registration.spec.ts`
2. `02-user.database.validation.spec.ts`
3. `03-user.api.validation.spec.ts`
4. `04-user.ui.account-update.spec.ts`
5. `05-user.database.update-validation.spec.ts`
6. `06-user.api.database-cleanup.spec.ts`

Numeric filename prefixes, `fullyParallel: false`, and one worker preserve this
order. This is ordered execution, not project dependency gating: Playwright
dependencies stop after any failed test, including assertion failures. The
account-update spec intentionally has soft assertions for known UI text
defects, so dependency gating would prevent later validation and cleanup specs
from running. With the ordered approach, later specs continue even if an
earlier validation fails.

The registration spec creates the positive users, then checks the duplicate
negative user. The API lookup runs before the account-update spec changes the
negative user's credentials. The account-update spec persists the changed
email/password to `data/NegUser.json` and the matching `data/PosUsers.json`
entry. The final cleanup spec deletes positive users through the API, verifies
their database rows are gone, and restores Alex Boschuk's original credentials
in both JSON files.

UI interactions are in `pages/`; API requests are in `apicontracts/`; database
queries are in `database/`. Playwright loads database connection settings from
the local `.env.test` file automatically. That file is git-ignored because it
contains credentials. Database checks target `public."User"`, not census
records in `public."Record"`.

The API host defaults to `http://localhost:3000`; override it with
`API_BASE_URL` if needed. The UI host can be overridden with `BASE_URL`.
Playwright writes an HTML report to `playwright-report/` and a JUnit report to
`test-results/junit.xml`; open the HTML report with `npm run report`.
