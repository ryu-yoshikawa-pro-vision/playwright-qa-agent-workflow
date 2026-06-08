# agents-playwright

`agents-playwright` は、AI エージェントに Playwright CLI を使った QA 作業を段階的に進めさせるための共通リポジトリです。

このリポジトリは、テスト対象の Web アプリケーション本体でも、完成済みの Playwright テストプロジェクトでもありません。AI エージェントが、画面探索、仕様整理、テスト計画、テスト設計、設計レビュー、Playwright Test の生成、失敗テストの修復までを、決められた順序と成果物形式で進めるための土台です。

## このリポジトリでできること

このリポジトリは、主に次の作業を支援します。

| 作業 | 内容 | 主な成果物 |
| --- | --- | --- |
| サービス全体の探索 | Playwright CLI で画面、導線、機能候補、権限差分を調べます。 | `artifacts/service-exploration/` |
| 仕様カタログの整備 | 探索で確認した画面、機能、フロー、データ、権限、ルールを再利用できる形で残します。 | `artifacts/spec-catalog/` |
| 機能単位のテスト計画 | 1つの画面、機能、フローに絞って、範囲、前提、証跡、リスク、設計材料を整理します。 | `specs/<feature>.plan.md` |
| テスト設計 | 同値分割、境界値分析、デシジョンテーブル、状態遷移、権限マトリクスなどから必要な技法だけを選び、最終テストケースに落とします。 | `specs/<feature>.test-design.md` |
| 設計レビュー | 計画と設計が十分かを確認し、生成に進めるかを判定します。 | `specs/_reviews/<feature>.validation.md` |
| Playwright Test 生成 | レビューに合格したテスト設計から Playwright Test を作成します。 | `tests/<feature>.spec.ts` |
| 失敗テストの修復 | 失敗原因を分類し、安全に直せる場合だけ最小限の修正を行います。 | `artifacts/<feature>/runs/<run-id>/05_healer/` |

## このリポジトリでしないこと

次の内容は、このリポジトリの責務ではありません。

- テスト対象アプリケーションの実装
- テスト対象アプリケーションの起動方法の管理
- 対象プロジェクト固有の Playwright Test 実行コマンドの固定
- AI エージェントや LLM の自動呼び出し
- Playwright CLI の完全なコマンドリファレンスの維持
- 認証情報、Cookie、トークン、保存済みブラウザ状態の Git 管理

対象アプリケーションのテスト実行は、対象プロジェクト側で定義されているコマンドに従います。Playwright CLI は、画面探索、UI 操作、スナップショット、スクリーンショット、トレース、診断、証跡取得に使用します。

## 全体の考え方

このリポジトリでは、AI エージェントの作業を次の段階に分けます。

```text
サービス全体を調べる
  -> 機能候補を出す
  -> 1つの機能に絞って計画する
  -> テスト技法を選んで設計する
  -> 計画と設計をレビューする
  -> 合格したら Playwright Test を生成する
  -> 失敗したテストは原因を分類して修復する
```

重要なのは、探索、計画、設計、レビュー、生成、修復を一度に混ぜないことです。各段階の成果物を残すことで、次の AI エージェントや人間のレビュー担当者が、途中からでも作業を引き継げるようにしています。

## 主なディレクトリ

| パス | 役割 |
| --- | --- |
| `AGENTS.md` | AI エージェントが最初に読む共通ルールです。 |
| `.agents/skills/` | 作業段階ごとのスキル定義です。 |
| `.agents/skills/*/references/` | 各スキルの詳細ルール、出力形式、判断基準です。 |
| `docs/` | ワークフロー、成果物、Playwright CLI、品質ゲート、Git 管理などの説明です。 |
| `artifacts/_templates/` | 各成果物のひな形です。 |
| `artifacts/service-exploration/` | サービス全体探索の継続的な引き継ぎ情報です。 |
| `artifacts/spec-catalog/` | 画面、機能、フロー、データ、権限、ルールなどの共通仕様カタログです。 |
| `specs/` | 機能単位のテスト計画とテスト設計を置きます。 |
| `specs/_reviews/` | 計画と設計のレビュー結果を置きます。 |
| `scripts/` | 成果物構造、レビュー結果、ログなどを検査する補助スクリプトです。 |
| `evals/` | スキルの選択、品質ゲート、設計技法などを確認するための軽量評価資料です。 |
| `.codex/` | Codex 用の実行ログ記録フックです。 |
| `.opencode/` | OpenCode 用の実行ログ記録プラグインです。 |
| `.agent-logs/` | AI エージェントのローカル実行ログ置き場です。通常は Git 管理しません。 |

## 利用前に必要なもの

ローカルで利用する場合は、次の準備が必要です。

- Node.js 18 以上
- npm
- シェルコマンドを実行できる環境
- Playwright CLI を実行できる環境
- AI エージェントがこのリポジトリと対象アプリケーションの両方を読める状態
- 対象アプリケーションにアクセスできる URL、アカウント、必要な権限

## 初回セットアップ

このリポジトリをローカルに用意したら、まず依存関係をインストールします。

```bash
npm install
```

次に、リポジトリ内の成果物テンプレートや評価用ファイルがそろっているか確認します。

```bash
npm run check:evals
```

Playwright CLI が使えることも確認します。

```bash
playwright-cli --help
```

Playwright CLI が未導入の場合は、利用環境に合わせて導入してください。ローカルで共通利用する場合は、次のようにグローバル導入する想定です。

```bash
npm install -g @playwright/cli@latest
playwright-cli --help
```

Playwright CLI が使えない場合、ブラウザ探索、スクリーンショット、スナップショット、トレース取得、ライブ画面を使った確認は `BLOCKED` として扱います。AI エージェントに推測で結果を書かせないでください。

## AI エージェントに作業させる前に読むファイル

AI エージェントには、まず次の順で読むように指示します。

1. `AGENTS.md`
2. 今回の作業に対応する `.agents/skills/<skill>/SKILL.md`
3. 関連する `docs/` の説明
4. 関連する `artifacts/`、`specs/`、`evals/` の既存成果物

特に、Playwright CLI を使う作業では次のファイルが重要です。

- `docs/playwright-cli.md`
- `.agents/skills/playwright-cli/SKILL.md`
- `.agents/skills/playwright-cli/references/use-cases.md`
- `.agents/skills/playwright-cli/references/commands.md`

## スキルの使い分け

| スキル | 使う場面 | 主な出力 |
| --- | --- | --- |
| `playwright-cli` | 画面探索、UI 操作、スクリーンショット、スナップショット、トレース、診断を行うとき | `artifacts/**/evidence/` |
| `playwright-service-mapper` | サービス全体、全画面、全導線を調べるとき | `artifacts/service-exploration/` |
| `playwright-test-planner` | 1つの機能、画面、フローのテスト計画を作るとき | `specs/<feature>.plan.md` |
| `playwright-test-designer` | 計画をもとにテスト技法を選び、最終テストケースを作るとき | `specs/<feature>.test-design.md` |
| `playwright-test-plan-validator` | 計画と設計をレビューし、生成可否を判定するとき | `specs/_reviews/<feature>.validation.md` |
| `playwright-test-generator` | 合格済みの設計から Playwright Test を生成するとき | `tests/<feature>.spec.ts` |
| `playwright-test-healer` | 失敗した Playwright Test を診断、修復するとき | `artifacts/<feature>/runs/<run-id>/05_healer/` |

## サービス全体を探索する流れ

対象アプリケーションをまだ十分に把握できていない場合は、最初にサービス全体探索を行います。

```text
playwright-service-mapper
  -> artifacts/service-exploration/runs/<run-id>/01_service_mapper/
  -> artifacts/service-exploration/FEATURE_BACKLOG.md
  -> artifacts/spec-catalog/
```

サービス全体探索では、次のような成果物を残します。

- 画面一覧
- ナビゲーション一覧
- 機能一覧
- 権限差分
- 探索済み範囲と未探索範囲
- スクリーンショットやスナップショットの証跡一覧
- 後続でテスト計画に進める機能候補

サービス全体探索で、いきなり巨大なテスト計画を作らないでください。まずは画面、導線、機能候補、未確認事項を整理し、その後に1機能ずつ計画へ進めます。

## 1つの機能をテスト化する流れ

対象機能が決まっている場合は、機能単位のワークフローを使います。

まず、作業用の成果物ディレクトリを作成します。

```bash
npm run agent:init -- --feature login --request 'ログイン画面のテスト計画とテスト設計を作成する'
```

現在の状態を確認します。

```bash
npm run agent:status -- --feature login
```

次に実行すべきスキルを確認します。

```bash
npm run agent:next -- --feature login
```

標準的な順序は次の通りです。

```text
playwright-test-planner
  -> specs/login.plan.md
playwright-test-designer
  -> specs/login.test-design.md
playwright-test-plan-validator
  -> specs/_reviews/login.validation.md
playwright-test-generator
  -> tests/login.spec.ts
```

生成に進む前には、必ずゲートを確認します。

```bash
npm run agent:gate -- --feature login --for generator
```

`agent:gate` が `PASS` になるまで、`playwright-test-generator` に進めないでください。

## 成果物の考え方

このリポジトリでは、成果物を大きく2種類に分けます。

1つ目は、1回の実行で得た詳細な記録です。

```text
artifacts/<scope-or-feature>/runs/<run-id>/
```

ここには、探索ログ、スクリーンショット、スナップショット、トレース、生成ログ、修復ログなどを置きます。これらは作業中の確認には重要ですが、重くなりやすく、機密情報を含む可能性もあるため、通常は Git 管理しません。

2つ目は、次の作業者に引き継ぐための継続情報です。

```text
artifacts/<scope-or-feature>/HANDOFF.md
artifacts/<scope-or-feature>/OPEN_QUESTIONS.md
artifacts/<scope-or-feature>/FINDINGS.md
artifacts/<scope-or-feature>/DECISIONS.md
```

サービス全体探索では、さらに次のファイルも使います。

```text
artifacts/service-exploration/FEATURE_BACKLOG.md
```

AI エージェントの作業は、実行単位の記録だけで終わらせず、重要な発見、未解決事項、判断、次に行うことを必ず引き継ぎファイルへ反映します。

## 仕様カタログ

`artifacts/spec-catalog/` は、対象アプリケーションの共通仕様を残す場所です。

次のような情報を蓄積します。

- 画面の目的、導線、UI 要素、状態
- 機能のふるまい
- 業務フロー
- データ構造やデータライフサイクル
- ロール、権限、表示差分
- 入力制約や業務ルール
- 用語

仕様カタログに書く内容は、確認状況を明示します。

| 状態 | 意味 |
| --- | --- |
| `Confirmed` | 証跡により確認済みです。 |
| `Partial` | 一部だけ確認済みです。 |
| `Unverified` | 未確認です。事実として扱わないでください。 |

未確認の内容を、確認済みの仕様としてテスト生成に使わないでください。

## 証跡の扱い

Playwright CLI では、スナップショットとスクリーンショットを組み合わせて使います。

| 証跡 | 主な用途 |
| --- | --- |
| スナップショット | role、label、accessible name、テキスト構造、locator 候補の確認 |
| スクリーンショット | レイアウト、表示状態、非活性、モーダル、ドロワー、ローディング、バリデーション、空状態の確認 |
| トレース | 操作手順、遷移、失敗時の再現確認 |
| console / network | エラー、警告、通信状態の診断 |

画面の見た目や表示状態に関する判断は、スナップショットだけで確定しないでください。スクリーンショットまたはトレースの証跡も残します。

## 品質ゲート

Playwright Test の生成は、計画と設計がレビューに合格した場合だけ許可します。

レビュー結果は、次のファイルに記録します。

```text
specs/_reviews/<feature>.validation.md
```

レビューでは、次の内容を確認します。

- 計画の範囲が明確か
- 前提、データ、権限、導線が整理されているか
- 証跡に基づいているか
- 未確認事項が明示されているか
- テスト技法の選択理由があるか
- 最終テストケースが独立しているか
- 期待結果が観察可能か
- 除外したケースと残リスクが説明されているか
- 生成に必要な情報がそろっているか

判定は次の3種類です。

| 判定 | 意味 |
| --- | --- |
| `PASS` | 生成に進めます。 |
| `FAIL` | 計画または設計の修正が必要です。 |
| `BLOCKED` | 必要な情報、証跡、ファイルが不足しており、判定できません。 |

## 検査コマンド

このリポジトリには、成果物や評価ファイルを確認するためのコマンドがあります。

| コマンド | 確認内容 |
| --- | --- |
| `npm run check:artifacts` | 必須ディレクトリ、テンプレート、スキル、引き継ぎファイルの存在確認 |
| `npm run check:validation` | 計画、設計、レビュー結果の SHA-256 整合性確認 |
| `npm run check:semantic` | セマンティック品質評価用 fixture の確認 |
| `npm run check:test-design` | テスト設計技法評価用 fixture の確認 |
| `npm run check:logs` | `.agent-logs/**/*.jsonl` の形式と秘匿情報らしきキーの確認 |
| `npm run check:evals` | 上記の軽量チェックをまとめて実行 |
| `npm run check` | lint、format、typecheck、軽量チェックをまとめて実行 |

作業後の最低限の確認として、次を実行してください。

```bash
npm run check:evals
```

リポジトリ全体を整える場合は、次も実行します。

```bash
npm run check
```

## Git 管理方針

Git に残すものは、軽量で再利用できる成果物を中心にします。

Git 管理する主なものは次の通りです。

- `AGENTS.md`
- `.agents/skills/`
- `docs/`
- `evals/`
- `artifacts/_templates/`
- `artifacts/service-exploration/*.md`
- `artifacts/spec-catalog/`
- `specs/*.plan.md`
- `specs/*.test-design.md`
- `specs/_reviews/*.validation.md`

通常 Git 管理しないものは次の通りです。

- `.agent-logs/**/*.jsonl`
- `artifacts/**/runs/`
- `artifacts/**/evidence/`
- `artifacts/**/auth/`
- `test-results/`
- `playwright-report/`
- `blob-report/`
- `*.trace.zip`
- `*.webm`
- `*.mp4`
- `storage-state*.json`
- `*.auth.json`

認証状態、Cookie、トークン、API キー、パスワードは絶対に Git 管理しないでください。

## 実行ログ

Codex と OpenCode では、対応しているイベントを `.agent-logs/` に JSONL 形式で記録できます。

| エージェント | 設定ファイル | 既定の出力先 |
| --- | --- | --- |
| Codex | `.codex/hooks.json`、`.codex/hooks/jsonl_logger.mjs` | `.agent-logs/codex/<session-id>.jsonl` |
| OpenCode | `.opencode/plugins/jsonl-logger.js` | `.agent-logs/opencode/<session-or-date>.jsonl` |

ログにはプロンプト本文そのものではなく、長さやハッシュを記録します。ツール入力や結果は長すぎる場合に切り詰められ、秘匿情報らしきキーは `[REDACTED]` に置き換えられます。

ただし、このログは完全な監査証跡ではありません。安全確認の唯一の手段にはしないでください。

## AI エージェントへの指示例

サービス全体を調べる場合は、次のように依頼します。

```text
AGENTS.md を読んでください。
Playwright CLI を使い、対象アプリケーション全体を探索してください。
playwright-service-mapper スキルに従い、画面一覧、導線、機能候補、権限差分、証跡一覧、未確認事項を artifacts/service-exploration/ に整理してください。
確認できた再利用可能な仕様は artifacts/spec-catalog/ に反映してください。
```

1つの機能を計画する場合は、次のように依頼します。

```text
AGENTS.md を読んでください。
feature slug は login です。
npm run agent:status -- --feature login を確認し、必要なら npm run agent:init -- --feature login --request 'ログイン画面のテスト計画を作成する' を実行してください。
playwright-test-planner スキルに従い、Playwright CLI の証跡をもとに specs/login.plan.md を作成してください。
```

テスト設計を行う場合は、次のように依頼します。

```text
AGENTS.md を読んでください。
specs/login.plan.md をもとに、playwright-test-designer スキルで specs/login.test-design.md を作成してください。
必要なテスト技法だけを選び、選ばなかった技法は理由を記載してください。
最終テストケースは、それぞれ独立して実行できる形にしてください。
```

生成前レビューを行う場合は、次のように依頼します。

```text
AGENTS.md を読んでください。
specs/login.plan.md と specs/login.test-design.md を playwright-test-plan-validator スキルでレビューしてください。
Plan SHA-256 と Test design SHA-256 を計算し、specs/_reviews/login.validation.md に判定を記録してください。
```

テスト生成を行う場合は、次のように依頼します。

```text
AGENTS.md を読んでください。
npm run agent:gate -- --feature login --for generator を実行してください。
PASS の場合だけ、playwright-test-generator スキルで specs/login.test-design.md から Playwright Test を生成してください。
生成したテストは、テスト設計のケース ID、計画、レビュー結果、証跡に対応づけてください。
```

## 作業時の注意

- 未確認の仕様を確認済みとして書かないでください。
- スクリーンショットなしで視覚的な状態を断定しないでください。
- 権限差分は、実際に該当ロールで確認できた場合だけ確定してください。
- テストを通すためにアサーションを弱めないでください。
- `test.skip()` や `test.fixme()` は、明示的な承認がある場合だけ使ってください。
- 失敗がプロダクト不具合の可能性がある場合、テスト側を無理に直さず不具合として報告してください。
- 重要な発見、判断、未解決事項、次の作業は、必ず `HANDOFF.md`、`FINDINGS.md`、`DECISIONS.md`、`OPEN_QUESTIONS.md` に反映してください。

## 関連ドキュメント

| ファイル | 内容 |
| --- | --- |
| `docs/workflow.md` | 全体ワークフロー |
| `docs/workflow-harness.md` | `agent:init`、`agent:status`、`agent:next`、`agent:gate` の使い方 |
| `docs/playwright-cli.md` | Playwright CLI の役割と証跡取得方針 |
| `docs/test-execution-boundary.md` | Playwright CLI と対象プロジェクトのテスト実行コマンドの境界 |
| `docs/artifact-conventions.md` | 成果物の配置ルール |
| `docs/handoff-conventions.md` | 引き継ぎファイルの考え方 |
| `docs/spec-catalog.md` | 仕様カタログの運用ルール |
| `docs/validation-gate.md` | 計画と設計の品質ゲート |
| `docs/git-management.md` | Git 管理するもの、しないもの |
| `docs/automatic-runtime-logging.md` | Codex / OpenCode の実行ログ |
| `docs/agent-compatibility.md` | 対応しやすい AI エージェントの条件 |

## 最初に迷ったとき

まず次の順で確認してください。

1. `AGENTS.md` を読む
2. `docs/workflow.md` で全体の流れを確認する
3. 対象がサービス全体か、1機能かを決める
4. サービス全体なら `playwright-service-mapper` を使う
5. 1機能なら `npm run agent:init` で作業場所を作る
6. `npm run agent:next` で次に使うスキルを確認する
7. 生成前には `npm run agent:gate -- --feature <feature> --for generator` を必ず実行する

この順序を守ることで、AI エージェントの作業が途中で曖昧になりにくくなります。
