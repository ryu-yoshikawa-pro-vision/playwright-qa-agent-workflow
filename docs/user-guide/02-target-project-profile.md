# Target Project Profile の作り方

Target Project Profile は、AI エージェントが対象アプリを安全に操作するための前提情報です。

対象アプリの URL、認証、使用するロール、テスト実行コマンド、データ操作ルール、生成方針などをまとめます。

ここが曖昧だと、AI エージェントは次のような失敗をしやすくなります。

- どの URL を開けばよいか分からない
- どのアカウントやロールで確認すればよいか分からない
- 作成、更新、削除をしてよいか分からない
- 生成した Playwright Test をどこに置けばよいか分からない
- テスト実行コマンドが分からず、生成後の確認ができない
- 本番環境や共有データを誤って操作する

## 作成する場所

サービス全体探索から始める場合は、次の場所に作成します。

```text
artifacts/service-exploration/TARGET_PROJECT_PROFILE.md
```

1機能に絞って作業する場合は、次の場所に作成します。

```text
artifacts/<feature>/TARGET_PROJECT_PROFILE.md
```

対象プロジェクト側に QA 用ドキュメント置き場がある場合は、対象プロジェクト側に置いても構いません。

```text
docs/qa/target-project-profile.md
```

両方に存在する場合は、対象プロジェクト側の profile を正本として扱い、このリポジトリ側には参照用の要約を置きます。

## テンプレート

まず、次のテンプレートをコピーして使います。

```text
artifacts/_templates/target-project-profile.md
```

テンプレートに `TBD` が残っていても、すべてが即問題になるわけではありません。

ただし、今回の作業に必要な項目が `TBD` のままなら、その作業は `BLOCKED` として扱います。

たとえば、ブラウザ探索をするのに URL が `TBD` なら探索できません。

Playwright Test を実行するのにテスト実行コマンドが `TBD` なら、生成後のテスト実行はできません。

## 必ず書く項目

### 1. 対象アプリ情報

```markdown
## Target application

- Application name: AILEAD
- Target repository: `owner/app-repo`
- Branch: `develop`
- Local path: `../app-repo`
- Environment: staging
- Base URL: `https://stg.example.com`
```

`Local path` は、AI エージェントが対象プロジェクトを読める場所です。

GitHub URL だけで作業するのか、ローカルに clone されたディレクトリを読むのかを曖昧にしないでください。

### 2. セットアップと起動方法

```markdown
## Setup and startup

- Install command: `npm install`
- Local start command: `npm run dev`
- Local URL: `http://localhost:3000`
- Required environment variables: target project `.env.example` を参照
```

対象アプリをローカルで起動しない場合は、次のように書きます。

```markdown
- Local start command: Not used
- Base URL: `https://stg.example.com` を使用する
```

### 3. 認証とロール

```markdown
## Authentication and roles

- Authentication method: email and password
- Available roles:
  - general user
  - admin
- Login state policy: Playwright CLI session may be used
- Secret policy: passwords, tokens, cookies, and storage state must not be committed
```

ここには、パスワードそのものを書いてはいけません。

必要な場合は、次のように「どこから取得するか」だけを書きます。

```markdown
- Credentials source: password manager or environment variables
- Do not write credential values in artifacts
```

### 4. Playwright CLI の使い方

```markdown
## Playwright CLI policy

- Session name: `ailead-stg-general-user`
- Browser state file: `artifacts/service-exploration/auth/state.json`
- Browser state git policy: do not commit
- Attach policy: existing browser session may be used when the user approves
```

保存済みブラウザ状態は便利ですが、認証情報を含む可能性があります。

`artifacts/**/auth/` や `storage-state*.json` は Git 管理しないでください。

### 5. テスト実行コマンド

```markdown
## Test commands

- Full E2E command: `npm run test:e2e`
- Single spec command: `npm run test:e2e -- tests/<feature>.spec.ts`
- Debug command: `npm run test:e2e -- --debug`
- Report command: `npx playwright show-report`
```

分からない場合は、対象プロジェクトの次の場所から確認します。

- README
- `package.json` の scripts
- CI 設定
- 既存の Playwright 設定
- 既存のテスト実行手順書

このリポジトリ側で勝手に `npx playwright test` と決めないでください。

### 6. データ操作ルール

```markdown
## Data policy

- Safe operations:
  - Read existing test data
  - Create data with `AI_TEST_` prefix
- Approval-required operations:
  - Delete created data
  - Send email or Slack notification
- Prohibited operations:
  - Delete shared data
  - Modify production data
  - Invite external users
  - Trigger payment or billing flows
- Cleanup policy:
  - Created test data should be deleted when the target project allows it
```

ここは省略しないでください。

AI エージェントに画面操作を任せる場合、データ操作ルールが安全性の境界になります。

### 7. 生成方針

```markdown
## Test generation policy

- Generated test path: `tests/<feature>.spec.ts`
- Helper policy: reuse existing helpers when available
- POM policy: do not create POM unless the target project already uses it or user requests it
- Locator policy: prefer role, label, text, and test id locators
- Assertion policy: do not weaken assertions to make tests pass
- Credential policy: use environment variables or approved helpers
```

生成方針がない場合、AI エージェントは対象プロジェクトの既存スタイルと違うテストを作る可能性があります。

既存のテストがある場合は、必ずその書き方を優先します。

対象プロジェクト側で `tests/e2e/` など別の配置を使っている場合は、その既存構成に合わせて Target Project Profile に明記してください。

## 悪い書き方

次のような profile は、実作業には不十分です。

```markdown
- URL: TBD
- Account: いつものアカウント
- Role: 管理者かもしれない
- Test command: たぶん npm test
- Data policy: 適当にテストデータを作る
- Generated test path: tests に置く
```

問題点は次です。

- URL が不明なので探索できない
- アカウントやロールが曖昧なので権限差分を確認できない
- テスト実行コマンドが曖昧なので生成後に確認できない
- データ操作ルールが曖昧なので危険な操作を止められない
- 生成先が曖昧なので対象プロジェクトの構成とずれる

## 良い書き方

次のように、AI エージェントが判断に使える粒度で書きます。

```markdown
# Target Project Profile

## Target application

- Application name: Sample SaaS
- Target repository: `owner/sample-saas`
- Branch: `develop`
- Local path: `../sample-saas`
- Environment: staging
- Base URL: `https://stg.example.com`

## Setup and startup

- Install command: `npm install`
- Local start command: Not used for this work
- Required environment variables: target project `.env.example` を参照

## Authentication and roles

- Authentication method: email and password
- Available roles:
  - general user
- Credentials source: password manager
- Secret policy: do not write passwords, tokens, cookies, or storage state in artifacts

## Playwright CLI policy

- Session name: `sample-saas-stg-general-user`
- Saved state path: `artifacts/service-exploration/auth/state.json`
- Saved state git policy: do not commit

## Test commands

- Full E2E command: `npm run test:e2e`
- Single spec command: `npm run test:e2e -- tests/<feature>.spec.ts`
- Debug command: `npm run test:e2e -- --debug`

## Data policy

- Safe operations:
  - Read existing test data
  - Create data with `AI_TEST_` prefix
- Approval-required operations:
  - Delete data
  - Send email
- Prohibited operations:
  - Modify production data
  - Delete shared data
  - Invite external users

## Test generation policy

- Generated test path: `tests/<feature>.spec.ts`
- Helper policy: reuse existing auth helper when available
- Locator policy: prefer role, label, text, and test id locators
- Assertion policy: do not weaken assertions for convenience
- Credential policy: use environment variables or approved helpers

## Blockers

- Admin role is not available yet, so admin permission checks are `BLOCKED`.

## Change history

| Date       | Change                                  | Author |
| ---------- | --------------------------------------- | ------ |
| 2026-06-09 | Initial profile for staging exploration | QA     |
```

## AI エージェントへの依頼例

Target Project Profile を作らせる場合は、次のように依頼します。

```text
AGENTS.md を読んでください。
docs/target-project-profile.md と artifacts/_templates/target-project-profile.md を確認してください。
次の情報をもとに artifacts/service-exploration/TARGET_PROJECT_PROFILE.md を作成してください。

- 対象アプリ名: <name>
- 対象 URL: <url>
- 環境: <environment>
- 対象リポジトリ: <repo>
- ローカルパス: <path>
- ロール: <role>
- テスト実行コマンド: <command>
- データ操作ルール: <rules>

不明な項目は推測せず、Blockers または Open questions に記載してください。
認証情報の値は書かないでください。
```

## 完了条件

Target Project Profile は、次の状態になっていれば使用できます。

- 対象 URL が明確である
- 使用環境が明確である
- 使用するロールが明確である
- 認証情報の扱いが明確である
- Playwright CLI の session または saved state 方針が明確である
- 対象プロジェクトのテスト実行コマンドが明確である
- データ操作ルールが明確である
- 生成先と locator / assertion 方針が明確である
- 不明点が Blockers または Open questions に残っている

不明点があること自体は問題ではありません。

問題なのは、不明点を不明なままにせず、推測で確認済みとして扱うことです。
