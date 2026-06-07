# Playwright CLI Commands

Use `playwright-cli` for browser exploration and evidence capture.

```bash
playwright-cli open <url>
playwright-cli snapshot
playwright-cli screenshot --filename=<path>
playwright-cli click <ref>
playwright-cli fill <ref> <value>
```

Use Playwright Test for executing generated tests.

```bash
npx playwright test
npx playwright test <test-file> --trace=retain-on-failure
npx playwright show-report
```

Record command outputs in the relevant phase artifact when the output materially affects the result.

Store visual evidence under the paths defined in `docs/artifact-conventions.md`.
