# Playwright CLI Commands

This reference is intentionally limited to commands that start with `playwright-cli`.

Do not add generic Playwright Test runner commands here. Project test-suite execution is a separate concern handled by generator/healer using the target project's documented test command.

## Command freshness rule

Do not maintain a full static command list in this repository.

Before using an unfamiliar command or option, check current help:

```bash
playwright-cli --help
playwright-cli <command> --help
```

## Core exploration commands

```bash
playwright-cli open <url>
playwright-cli goto <url>
playwright-cli reload
playwright-cli go-back
playwright-cli go-forward
```

## Snapshot and visual evidence

```bash
playwright-cli snapshot
playwright-cli snapshot --filename=<path>
playwright-cli snapshot <ref>
playwright-cli screenshot --filename=<path>
playwright-cli screenshot <ref> --filename=<path>
```

## Common interactions

```bash
playwright-cli click <ref>
playwright-cli dblclick <ref>
playwright-cli fill <ref> <value>
playwright-cli type <value>
playwright-cli select <ref> <value>
playwright-cli check <ref>
playwright-cli uncheck <ref>
playwright-cli hover <ref>
playwright-cli press <key>
```

## Sessions and authentication state

```bash
PLAYWRIGHT_CLI_SESSION=<scope-or-feature> playwright-cli open <url>
playwright-cli state-save artifacts/<scope-or-feature>/auth/state.json
playwright-cli state-load artifacts/<scope-or-feature>/auth/state.json
```

## Diagnostics and advanced evidence

```bash
playwright-cli tracing-start
playwright-cli tracing-stop
playwright-cli console error
playwright-cli console warning
playwright-cli network
playwright-cli network --filter=<pattern>
playwright-cli attach <session-name>
```

## Use-case map

Use `references/use-cases.md` as the map and open the relevant `references/use-cases/use-case-*.md` file instead of reading the full reference every time.

| Need                          | Reference                                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| Command help/current syntax   | `references/use-cases/use-case-01-command-discovery-and-freshness.md`                         |
| Start exploration or navigate | `references/use-cases/use-case-03-browser-launch-navigation-and-reload.md`                    |
| Snapshot/ref workflow         | `references/use-cases/use-case-04-snapshot-and-ref-driven-exploration.md`                     |
| Screenshot evidence           | `references/use-cases/use-case-05-visual-evidence-with-screenshots.md`                        |
| Forms/UI operations           | `references/use-cases/use-case-06-form-and-ui-interaction-patterns.md`                        |
| Login/session state           | `references/use-cases/use-case-07-authentication-and-session-persistence.md`                  |
| Service-wide exploration      | `references/use-cases/use-case-08-service-wide-mapping-workflow.md`                           |
| Feature planning              | `references/use-cases/use-case-09-feature-level-planning-workflow.md`                         |
| Tracing/debugging             | `references/use-cases/use-case-10-tracing-important-flows.md`                                 |
| Console/network               | `references/use-cases/use-case-11-console-and-network-diagnostics.md`                         |
| Failure investigation         | `references/use-cases/use-case-12-test-failure-investigation-with-playwright-cli-evidence.md` |
| Dialogs                       | `references/use-cases/use-case-13-dialogs-alerts-and-blocking-ui.md`                          |
| Vision/coordinates            | `references/use-cases/use-case-14-vision-mode-and-coordinate-interactions.md`                 |
| Existing browser attach       | `references/use-cases/use-case-15-existing-browser-attach.md`                                 |
| Advanced commands             | `references/use-cases/use-case-16-mocking-eval-and-run-code-as-advanced-tools.md`             |
| Safety and anti-patterns      | `references/use-cases/use-case-17-safety-rules-and-anti-patterns.md`                          |
