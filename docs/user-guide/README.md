# 使用者向けガイド

このガイドは、`playwright-qa-agent-workflow` を使って Web アプリケーションの探索、テスト計画、テスト設計、Playwright Test 生成、失敗テストの診断を進める人のための説明です。

Playwright や AI エージェントを初めて使う人でも、上から順に読めば作業を始められるように、専門用語をできるだけ作業手順に置き換えて説明します。

## 最初に理解すること

`playwright-qa-agent-workflow` は、テスト対象の Web アプリケーションそのものではありません。

また、このリポジトリ単体で AI エージェントを自動実行したり、対象アプリのテストを自動で完了させたりするものでもありません。

このリポジトリの役割は、AI エージェントに次の QA 作業を順番に進めさせるための共通ルール、スキル、成果物置き場、確認コマンドを提供することです。

```text
対象アプリの前提情報を整理する
  -> 画面や導線を探索する
  -> 1つの機能に絞ってテスト計画を作る
  -> テスト技法を使ってテスト設計を作る
  -> 生成前レビューを行う
  -> PASSした設計から Playwright Test を生成する
  -> 失敗したテストを診断して安全に修復する
```

## このガイドで扱うこと

このガイドでは、使用者が実際に迷いやすい次の内容を説明します。

1. 初回利用時に何をすればよいか
2. 作業前に何を準備するか
3. 対象アプリの情報をどこに書くか
4. サービス全体を探索する場合の進め方
5. 1機能ずつテスト化する場合の進め方
6. 作成された成果物の読み方
7. 作業が止まったときの確認方法

## このガイドで扱わないこと

次の内容は、このリポジトリではなく対象プロジェクト側の責務です。

- 対象アプリの起動方法を決めること
- 対象アプリの環境変数を管理すること
- 対象プロジェクト固有のテスト実行コマンドを作ること
- 本番データや認証情報を管理すること
- AI エージェントや LLM を自動で呼び出すこと

## 読む順番

初めて使う場合は、次の順で読んでください。

|順番|ファイル|目的|
|---|---|---|
|1|[`00-first-run.md`](00-first-run.md)|最初の1回を始めるための最短手順を確認する|
|2|[`01-before-you-start.md`](01-before-you-start.md)|作業前に必要な準備を確認する|
|3|[`02-target-project-profile.md`](02-target-project-profile.md)|対象アプリの URL、認証、データ方針、必要なら対象プロジェクト情報とテスト実行方法を整理する|
|4|[`target-repository-requirement.md`](target-repository-requirement.md)|対象アプリのリポジトリが必要になる場面と、ブラウザ探索だけで進められる範囲を確認する|
|5|[`03-service-exploration.md`](03-service-exploration.md)|対象アプリ全体を探索する|
|6|[`04-feature-workflow.md`](04-feature-workflow.md)|1機能をテスト計画、設計、生成まで進める|
|7|[`05-artifact-reading-guide.md`](05-artifact-reading-guide.md)|どの成果物を見れば現在状態が分かるか確認する|
|8|[`06-troubleshooting.md`](06-troubleshooting.md)|困ったときの確認方法を調べる|
|9|[`glossary.md`](glossary.md)|用語の意味を確認する|

## 最短で作業を始める場合

すでに対象アプリの URL、アカウント、データ操作ルールが分かっている場合は、次の流れで開始します。

Playwright Test の生成、対象プロジェクト側での実行、失敗テスト修復まで行う場合は、あわせて対象プロジェクトのテスト実行コマンドも確認してから進めます。

```bash
npm install
npm run check:evals
playwright-cli --help
```

次に、対象アプリの前提情報を作成します。

サービス全体を探索する場合は、次に作成します。

```text
artifacts/service-exploration/TARGET_PROJECT_PROFILE.md
```

1機能だけを扱う場合は、次に作成しても構いません。

```text
artifacts/<feature>/TARGET_PROJECT_PROFILE.md
```

AI エージェントへの依頼文には、共通ルールではなく今回の作業でしか分からない情報を書きます。

- 対象アプリ名
- 対象 URL
- 使用する環境
- 使用するロール
- 対象 feature slug
- 今回の目的
- データ操作ルール
- 参照すべき Target Project Profile
- 今回だけの注意点

AI エージェントは通常、`AGENTS.md` や該当スキルを読む前提で動くため、依頼文に共通指示を毎回繰り返す必要はありません。

その後、サービス全体を探索するか、1機能に絞って進めます。

サービス全体を探索する場合は、`03-service-exploration.md` を読んでください。

1機能に絞る場合は、次のように作業場所を作ります。

```bash
npm run agent:init -- --feature login --request "ログイン画面のテスト計画とテスト設計を作成する"
npm run agent:status -- --feature login
npm run agent:next -- --feature login
```

以降は `npm run agent:next` が示す次の作業に進みます。

## 使用者が守るべき重要ルール

### 推測で確認済みと書かない

画面で確認していないこと、証跡がないこと、対象プロジェクトの資料で確認していないことは、確認済みとして書かないでください。

分からないことは `Unverified`、`BLOCKED`、または `OPEN_QUESTIONS.md` に残します。

### 認証情報を残さない

認証情報や保存済みブラウザ状態は、成果物や Git に残してはいけません。

### Playwright CLI と Playwright Test を混同しない

Playwright CLI は、画面探索や証跡取得に使います。

Playwright Test の実行は、対象プロジェクト側で定義されたテスト実行コマンドを使います。

### 生成前に必ず validation を通す

`playwright-test-generator` は、`playwright-test-plan-validator` が `PASS` した後だけ使います。

生成前には必ず次を確認します。

```bash
npm run agent:gate -- --feature <feature> --for generator
```

`PASS` でなければ、テスト生成に進みません。

## 作業の完了とは

作業は、テストコードを作っただけでは完了ではありません。

次の成果物が更新されていることを確認します。

- `artifacts/<feature>/HANDOFF.md`
- `artifacts/<feature>/OPEN_QUESTIONS.md`
- `artifacts/<feature>/FINDINGS.md`
- `artifacts/<feature>/DECISIONS.md`
- `specs/<feature>.plan.md`
- `specs/<feature>.test-design.md`
- `specs/_reviews/<feature>.validation.md`
- `specs/<feature>.coverage.md`

特に、生成済みテストとテスト設計 ID の対応関係は `specs/<feature>.coverage.md` に残します。

run 配下の `test-mapping.md` は履歴であり、現在の正本ではありません。
