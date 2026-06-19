# Release QA Cockpit 実装対象ディレクトリ方針

実装先は `demo-apps/release-qa-cockpit/` とする。

`examples/release-qa-cockpit/` は古い配置案であり、実装先、生成テストパス、Target Project Profile のいずれにも使用しない。

## 最小構成

```text
demo-apps/release-qa-cockpit/
  README.md
  package.json
  index.html
  vite.config.ts
  tsconfig.json
  src/
  tests/
  docs/
```

## Target Project Profile

```text
Application name: Release QA Cockpit
Target path: demo-apps/release-qa-cockpit
Base URL: http://localhost:5173
Generated test path: demo-apps/release-qa-cockpit/tests/
```
