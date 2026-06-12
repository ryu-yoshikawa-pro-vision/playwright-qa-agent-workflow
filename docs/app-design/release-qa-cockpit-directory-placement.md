# Release QA Cockpit 実装対象ディレクトリ方針

## 1. 目的

本ドキュメントは、`Release QA Cockpit` の実装対象ディレクトリを最終確定するための補足である。

既存の設計書・補足設計書・最終実装ルールに `examples/release-qa-cockpit/` という記述が残っている場合でも、実装時の配置方針は本ドキュメントを優先する。

## 2. 最終配置方針

`Release QA Cockpit` は、リポジトリ直下に `demo-apps` ディレクトリを作成し、その配下に実装する。

```text
demo-apps/
  release-qa-cockpit/
    README.md
    package.json
    index.html
    vite.config.ts
    tsconfig.json
    src/
      main.tsx
      App.tsx
      routes/
      pages/
      components/
      features/
      db/
      fixtures/
      testids/
      styles/
    tests/
      smoke.spec.ts
    docs/
      target-project-profile.md
      app-spec.md
      seed-data.md
```

## 3. examples 配下に置かない理由

`examples/` は、既存の読み物サンプルや軽量なワークフロー例と混在しやすい。

今回の `Release QA Cockpit` は、AI エージェントに実際に触らせるための実行可能なデモアプリであり、単なるサンプルコードではない。

そのため、実装対象アプリ群として `demo-apps/` を新設し、以下を明確に分離する。

- ワークフロー説明・サンプル: `examples/`
- 実行可能なデモアプリ: `demo-apps/`
- 設計・レビュー資料: `docs/app-design/`

## 4. target-project-profile の更新方針

`target-project-profile.md` を作成する際は、以下の値を使用する。

```text
Application name: Release QA Cockpit
Target path: demo-apps/release-qa-cockpit
Base URL: http://localhost:5173
Install command: npm install
Start command: npm run dev
Test command: npm run test:e2e
Data storage: IndexedDB only
External services: None
Reset method: Settings > Data > Reset seed data
Demo scenarios: Settings > Demo Mode
Primary test target: Release Decision, Test Run Board, Defect Triage
Generated test path: demo-apps/release-qa-cockpit/tests/
```

## 5. 実装時の優先順位

配置パスに関して、ドキュメント間で記述が競合する場合は、以下の順に優先する。

```text
1. docs/app-design/release-qa-cockpit-directory-placement.md
2. docs/app-design/release-qa-cockpit-final-implementation-rules.md
3. docs/app-design/release-qa-cockpit-design-refinements.md
4. docs/app-design/release-qa-cockpit.md
```

## 6. 実装時の注意

- `demo-apps/` はリポジトリ直下に新規作成する。
- `demo-apps/release-qa-cockpit/` は独立した Vite + React アプリとして扱う。
- ルートの `package.json` に不要な依存を混ぜない。
- デモアプリ固有の依存関係は `demo-apps/release-qa-cockpit/package.json` に閉じ込める。
- Playwright の smoke spec も、まずは `demo-apps/release-qa-cockpit/tests/` に配置する。

## 7. 最終判断

以降の実装では、`Release QA Cockpit` の実装対象ディレクトリを `demo-apps/release-qa-cockpit/` とする。
