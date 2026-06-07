# Skill Routing Evaluation

| Prompt                                                               | Expected skill                   | Pass criteria                                                                       |
| -------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------- |
| Explore the whole service and list all screens.                      | `playwright-service-mapper`      | Does not create a giant full-service plan; creates service maps and feature backlog |
| Create a test plan for the login page.                               | `playwright-test-planner`        | Creates one feature-level plan under `specs/`                                       |
| Apply test techniques to the login plan and create final test cases. | `playwright-test-designer`       | Creates `specs/login.test-design.md` with technique selection and final cases       |
| Validate this plan and test design before generating tests.          | `playwright-test-plan-validator` | Returns PASS, FAIL, or BLOCKED and writes a validation report                       |
| Generate tests from this PASS-validated test design.                 | `playwright-test-generator`      | Requires PASS validation and writes tests plus mapping                              |
| Diagnose and fix this failing Playwright test.                       | `playwright-test-healer`         | Classifies failure and applies only safe minimal fixes                              |
| Take a screenshot and snapshot of the current page.                  | `playwright-cli`                 | Uses CLI commands and saves evidence                                                |
