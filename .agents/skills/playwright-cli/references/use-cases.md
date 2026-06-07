# Playwright CLI Use Cases Map

This file is the map for Playwright CLI use-case references.

The repository does **not** maintain a complete static command catalog. Use current help for exact command syntax:

```bash
playwright-cli --help
playwright-cli <command> --help
```

Use the linked use-case page that matches the current task. Each use case intentionally documents only commands that start with `playwright-cli` or an environment assignment followed by `playwright-cli`.

## Use-case map

| No. | Use case                                                | Reference                                                                                     | Typical command examples                                                                                                                                                                                                      |
| --: | ------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  01 | Command discovery and freshness                         | `references/use-cases/use-case-01-command-discovery-and-freshness.md`                         | `playwright-cli --help`<br>`playwright-cli <command> --help`                                                                                                                                                                  |
|  02 | Environment readiness                                   | `references/use-cases/use-case-02-environment-readiness.md`                                   | `playwright-cli --help`                                                                                                                                                                                                       |
|  03 | Browser launch, navigation, and reload                  | `references/use-cases/use-case-03-browser-launch-navigation-and-reload.md`                    | `playwright-cli open <url>`<br>`playwright-cli goto <url>`<br>`playwright-cli reload`<br>`playwright-cli go-back`                                                                                                             |
|  04 | Snapshot and ref-driven exploration                     | `references/use-cases/use-case-04-snapshot-and-ref-driven-exploration.md`                     | `playwright-cli snapshot`<br>`playwright-cli snapshot --filename=<path>`<br>`playwright-cli snapshot <ref>`                                                                                                                   |
|  05 | Visual evidence with screenshots                        | `references/use-cases/use-case-05-visual-evidence-with-screenshots.md`                        | `playwright-cli screenshot --filename=<path>`<br>`playwright-cli screenshot <ref> --filename=<path>`                                                                                                                          |
|  06 | Form and UI interaction patterns                        | `references/use-cases/use-case-06-form-and-ui-interaction-patterns.md`                        | `playwright-cli click <ref>`<br>`playwright-cli dblclick <ref>`<br>`playwright-cli fill <ref> <value>`<br>`playwright-cli type <value>`                                                                                       |
|  07 | Authentication and session persistence                  | `references/use-cases/use-case-07-authentication-and-session-persistence.md`                  | `PLAYWRIGHT_CLI_SESSION=<scope-or-feature> playwright-cli open <url>`<br>`playwright-cli state-save artifacts/<scope-or-feature>/auth/state.json`<br>`playwright-cli state-load artifacts/<scope-or-feature>/auth/state.json` |
|  08 | Service-wide mapping workflow                           | `references/use-cases/use-case-08-service-wide-mapping-workflow.md`                           | `playwright-cli open <url>`<br>`playwright-cli snapshot`<br>`playwright-cli screenshot --filename=<path>`<br>`playwright-cli click <ref>`                                                                                     |
|  09 | Feature-level planning workflow                         | `references/use-cases/use-case-09-feature-level-planning-workflow.md`                         | `playwright-cli goto <url>`<br>`playwright-cli snapshot`<br>`playwright-cli screenshot --filename=<path>`<br>`playwright-cli fill <ref> <value>`                                                                              |
|  10 | Tracing important flows                                 | `references/use-cases/use-case-10-tracing-important-flows.md`                                 | `playwright-cli tracing-start`<br>`playwright-cli tracing-stop`                                                                                                                                                               |
|  11 | Console and network diagnostics                         | `references/use-cases/use-case-11-console-and-network-diagnostics.md`                         | `playwright-cli console error`<br>`playwright-cli console warning`<br>`playwright-cli network`<br>`playwright-cli network --filter=<pattern>`                                                                                 |
|  12 | Test failure investigation with Playwright CLI evidence | `references/use-cases/use-case-12-test-failure-investigation-with-playwright-cli-evidence.md` | `playwright-cli attach <session-name>`<br>`playwright-cli snapshot`<br>`playwright-cli screenshot --filename=<path>`<br>`playwright-cli console error`                                                                        |
|  13 | Dialogs, alerts, and blocking UI                        | `references/use-cases/use-case-13-dialogs-alerts-and-blocking-ui.md`                          | `playwright-cli dialog-accept`<br>`playwright-cli dialog-dismiss`                                                                                                                                                             |
|  14 | Vision mode and coordinate interactions                 | `references/use-cases/use-case-14-vision-mode-and-coordinate-interactions.md`                 | `playwright-cli screenshot --filename=<path>`<br>`playwright-cli mousemove <x> <y>`<br>`playwright-cli mousedown`<br>`playwright-cli mouseup`                                                                                 |
|  15 | Existing browser attach                                 | `references/use-cases/use-case-15-existing-browser-attach.md`                                 | `playwright-cli attach --cdp=<endpoint>`<br>`playwright-cli attach --cdp=chrome`<br>`playwright-cli attach --cdp=msedge`<br>`playwright-cli attach --extension`                                                               |
|  16 | Mocking, eval, and run-code as advanced tools           | `references/use-cases/use-case-16-mocking-eval-and-run-code-as-advanced-tools.md`             | `playwright-cli route <pattern>`<br>`playwright-cli eval <expression>`<br>`playwright-cli eval <expression> <ref>`<br>`playwright-cli run-code <code>`                                                                        |
|  17 | Safety rules and anti-patterns                          | `references/use-cases/use-case-17-safety-rules-and-anti-patterns.md`                          | See use case                                                                                                                                                                                                                  |

## Selection rule

- For service-wide exploration, start with use cases 01-08.
- For feature planning, use cases 03-11 are usually relevant.
- For visual evidence, use cases 04-05 and 14 are most relevant.
- For login-required work, use case 07.
- For failure investigation, use cases 10-12.
- For unusual UI, use cases 13-16.

## Boundary

`playwright-cli` may be used for browser-driven exploration, ad hoc verification, and evidence gathering. It is not documented here as a project test-suite runner. Generated or existing Playwright Test suites should be executed only through the target project's documented test command, outside this Playwright CLI command reference.
