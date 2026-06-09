# Target Project Profile

## 1. Target application

| Item                | Value |
| ------------------- | ----- |
| Application name    | TBD   |
| Target repository   | TBD   |
| Target branch       | TBD   |
| Local project path  | TBD   |
| Primary environment | TBD   |
| Base URL            | TBD   |

## 2. Repository and setup

| Item                           | Value |
| ------------------------------ | ----- |
| Install command                | TBD   |
| Local start command            | TBD   |
| Required environment variables | TBD   |
| Setup notes                    | TBD   |

## 3. Browser and Playwright CLI access

| Item                           | Value                                                        |
| ------------------------------ | ------------------------------------------------------------ |
| Preferred browser/session      | TBD                                                          |
| Playwright CLI session name    | TBD                                                          |
| Existing browser attach method | TBD                                                          |
| Screenshot/snapshot policy     | Use both snapshot and screenshot for important visual states |
| Evidence output scope          | `artifacts/<feature>/runs/<run-id>/evidence/`                |

## 4. Authentication and roles

| Role | Account/source | Allowed usage | Notes |
| ---- | -------------- | ------------- | ----- |
| TBD  | TBD            | TBD           | TBD   |

Rules:

- Do not write passwords, tokens, cookies, refresh tokens, API keys, or session storage values in this file.
- Saved authentication state must stay outside Git.
- If required role access is unavailable, mark the affected browser-dependent work as `BLOCKED`.

## 5. Test execution

| Item                | Value |
| ------------------- | ----- |
| Full test command   | TBD   |
| Single spec command | TBD   |
| Debug command       | TBD   |
| Report output       | TBD   |
| CI command          | TBD   |

Rules:

- Use this target project's documented test command.
- Do not treat `playwright-cli` as the project test-suite runner.
- If no target-project test command is available, mark live test execution as `BLOCKED` and continue with static review or browser evidence review when possible.

## 6. Test data policy

| Data type | Allowed? | Setup method | Cleanup method | Notes |
| --------- | -------- | ------------ | -------------- | ----- |
| TBD       | TBD      | TBD          | TBD            | TBD   |

## 7. Safe and unsafe operations

### Safe operations

- TBD

### Requires explicit approval

- TBD

### Prohibited operations

- TBD

## 8. Generation policy

| Item                     | Value                      |
| ------------------------ | -------------------------- |
| Generated test path      | `tests/<feature>.spec.ts`  |
| Helper/POM policy        | TBD                        |
| Locator preference       | User-facing locators first |
| Assertion policy         | TBD                        |
| Cleanup/isolation policy | TBD                        |

## 9. Known constraints and blockers

| ID      | Constraint / blocker | Impact | Next action |
| ------- | -------------------- | ------ | ----------- |
| TPB-001 | TBD                  | TBD    | TBD         |

## 10. Change history

| Date | Updated by | Change          | Reason |
| ---- | ---------- | --------------- | ------ |
| TBD  | TBD        | Initial profile | TBD    |
