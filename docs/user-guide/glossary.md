# 用語集

このページでは、`agents-playwright` を使うときに出てくる用語を説明します。

Playwright や AI エージェントに慣れていない人でも理解できるように、実作業での意味を中心に説明します。

## AI エージェント

人間の指示を受けて、ファイルを読んだり、コマンドを実行したり、成果物を作成したりする AI です。

このリポジトリでは、AI エージェントに自由に作業させるのではなく、`AGENTS.md` と `.agents/skills/` に従って段階的に作業させます。

## Playwright

Web ブラウザを操作して、Web アプリケーションの動作確認や自動テストを行うためのツールです。

このリポジトリでは、主に次の2つを区別します。

- Playwright CLI
- Playwright Test

## Playwright CLI

AI エージェントがブラウザを操作し、画面探索や証跡取得を行うために使うコマンドです。

例です。

```bash
playwright-cli open <url>
playwright-cli snapshot
playwright-cli screenshot --filename=<path>
```

このリポジトリでは、Playwright CLI を主に次の用途で使います。

- 画面を開く
- 画面を操作する
- snapshot を取得する
- screenshot を取得する
- trace を取得する
- live UI で ad hoc に確認する

Playwright CLI は、対象プロジェクトのテストスイート実行コマンドではありません。

## Playwright Test

Playwright を使った自動テストコードと、その実行環境です。

一般的には `.spec.ts` のようなテストファイルを書いて実行します。

このリポジトリでは、validation が `PASS` した test-design から Playwright Test を生成します。

生成後の実行コマンドは、対象プロジェクト側のルールに従います。

## skill

AI エージェントに特定の作業をさせるための手順書です。

このリポジトリには、次のような skill があります。

| skill                            | 役割                         |
| -------------------------------- | ---------------------------- |
| `playwright-cli`                 | ブラウザ操作と証跡取得       |
| `playwright-service-mapper`      | サービス全体探索             |
| `playwright-test-planner`        | 機能単位のテスト計画         |
| `playwright-test-designer`       | テスト技法に基づくテスト設計 |
| `playwright-test-plan-validator` | 生成前レビュー               |
| `playwright-test-generator`      | Playwright Test 生成         |
| `playwright-test-healer`         | 失敗テストの診断と修復       |

## service mapping

対象アプリ全体を探索し、画面、導線、機能候補、権限差分、未確認事項を整理する作業です。

いきなりテストケースやテストコードを作るのではなく、まず対象アプリを把握するために行います。

## planner

1つの機能、画面、フローに絞って、何をテスト設計の対象にするかを整理する工程です。

出力は主に次です。

```text
specs/<feature>.plan.md
```

planner では、最終テストケースを作り込みません。

最終テストケースは designer で作成します。

## designer

planner が作った計画をもとに、テスト技法を選び、最終テストケースを作る工程です。

出力は主に次です。

```text
specs/<feature>.test-design.md
```

すべての技法を使う必要はありません。

対象機能に合う技法だけを選び、使わない技法は理由を書きます。

## validator

plan と test-design が、Playwright Test 生成に進める品質かをレビューする工程です。

出力は主に次です。

```text
specs/_reviews/<feature>.validation.md
```

判定は次の3つです。

| 判定      | 意味                                           |
| --------- | ---------------------------------------------- |
| `PASS`    | 生成に進める                                   |
| `FAIL`    | plan または test-design の修正が必要           |
| `BLOCKED` | 情報、証跡、ファイルなどが不足して判定できない |

## generator

validation が `PASS` した test-design から、Playwright Test を生成する工程です。

主な出力です。

```text
tests/<feature>.spec.ts
specs/<feature>.coverage.md
```

validation が `PASS` していない場合、generator に進んではいけません。

## healer

失敗した Playwright Test を診断し、安全に修復する工程です。

healer は、失敗を隠すためにテストを弱めるものではありません。

先に失敗原因を分類し、テスト側で直してよい場合だけ最小修正します。

## feature slug

1つの機能、画面、フローを識別する短い名前です。

例です。

```text
login
conversation-detail
user-management
```

feature slug は、artifact、spec、test file の名前に使います。

```text
artifacts/login/
specs/login.plan.md
specs/login.test-design.md
specs/login.coverage.md
tests/login.spec.ts
```

## artifact

AI エージェントの作業結果として作成されるファイルやディレクトリです。

例です。

- 計画
- テスト設計
- validation report
- coverage 台帳
- handoff
- open questions
- screenshots
- snapshots
- traces

## run

1回の作業実行を表す単位です。

run ごとに次のようなディレクトリが作られます。

```text
artifacts/<feature>/runs/<run-id>/
```

run 配下の成果物は、その時点の履歴です。

現在の正本ではありません。

## run ID

1回の作業を識別する ID です。

形式は次です。

```text
YYYYMMDD-HHMMSS
```

## handoff

次の作業者に引き継ぐための要約です。

見るファイルです。

```text
artifacts/<feature>/HANDOFF.md
artifacts/service-exploration/HANDOFF.md
```

現在状態、次の作業、注意点、関連成果物を残します。

## open questions

未解決事項です。

見るファイルです。

```text
artifacts/<feature>/OPEN_QUESTIONS.md
```

確認できていない仕様、証跡不足、ロール不足、データ不足などを記録します。

## findings

作業中に分かった重要な発見です。

見るファイルです。

```text
artifacts/<feature>/FINDINGS.md
```

画面で確認できた仕様、既存資料との差分、不具合の可能性などを記録します。

## decisions

作業中に決めた重要な判断です。

見るファイルです。

```text
artifacts/<feature>/DECISIONS.md
```

対象範囲、対象外、使用する技法、生成しないケース、修復方針などを記録します。

## spec catalog

複数の作業で再利用できる仕様情報をまとめる場所です。

見る場所です。

```text
artifacts/spec-catalog/
```

画面、機能、フロー、データ、ロール、ルール、用語などを整理します。

## plan

テスト計画です。

見るファイルです。

```text
specs/<feature>.plan.md
```

対象範囲、前提、証跡、リスク、設計に渡す情報を整理します。

## test design

テスト設計です。

見るファイルです。

```text
specs/<feature>.test-design.md
```

テスト技法、テスト条件、最終テストケース、除外ケース、残リスクを整理します。

## validation report

生成前レビュー結果です。

見るファイルです。

```text
specs/_reviews/<feature>.validation.md
```

`PASS`、`FAIL`、`BLOCKED` の判定や、plan / test-design の SHA-256 を記録します。

## coverage 台帳

実装済みテストと test-design ID の対応関係を示す現在の正本です。

見るファイルです。

```text
specs/<feature>.coverage.md
```

何を確認しているか、何を確認していないか、除外したケース、残リスク、変更履歴を記録します。

## test mapping

generator が1回の生成作業で作る対応表です。

見るファイルです。

```text
artifacts/<feature>/runs/<run-id>/04_generator/test-mapping.md
```

これは履歴です。

現在の正本は `specs/<feature>.coverage.md` です。

## snapshot

画面のアクセシビリティ情報やテキスト構造を取得した証跡です。

主に次を確認するために使います。

- ボタン名
- ラベル
- role
- accessible name
- テキスト構造
- locator 候補

## screenshot

画面の見た目を画像として残した証跡です。

主に次を確認するために使います。

- レイアウト
- 表示状態
- disabled 状態
- モーダル
- drawer
- loading
- empty state
- responsive layout

## trace

画面操作の流れを記録した証跡です。

失敗調査や、複数操作をまたぐ確認に使います。

## locator

Playwright Test が画面要素を見つけるための指定方法です。

例です。

```ts
page.getByRole('button', { name: 'ログイン' });
page.getByLabel('メールアドレス');
page.getByText('保存しました');
```

原則として、ユーザーから見える role、label、text、test id を優先します。

## assertion

テストで確認する期待結果です。

例です。

```ts
await expect(page.getByText('保存しました')).toBeVisible();
```

テストを通すために assertion を弱めてはいけません。

## BLOCKED

必要な情報、証跡、権限、環境、ファイルなどが不足していて作業を進められない状態です。

`BLOCKED` は失敗ではありません。

推測で進めず、安全に止めている状態です。

## Unverified

まだ確認できていない情報です。

確認できていない仕様を、確認済みのように書かないために使います。

## Target Project Profile

対象アプリの接続、認証、テスト実行、データ操作、生成方針をまとめるファイルです。

例です。

```text
artifacts/service-exploration/TARGET_PROJECT_PROFILE.md
artifacts/<feature>/TARGET_PROJECT_PROFILE.md
```

作業前に必ず確認します。
