# 機能単位ワークフローの進め方

このページでは、1つの機能、画面、またはフローを対象に、テスト計画、テスト設計、生成前レビュー、Playwright Test 生成まで進める方法を説明します。

例として、feature slug を `login` として説明します。

## 機能単位ワークフローとは

機能単位ワークフローは、対象を1つに絞って進める作業です。

```text
作業場所を作る
  -> テスト計画を作る
  -> テスト設計を作る
  -> 生成前レビューを行う
  -> PASS した場合だけ Playwright Test を生成する
  -> coverage 台帳を更新する
```

対象がまだ決まっていない場合は、先に `03-service-exploration.md` に従ってサービス全体探索を行ってください。

## feature slug を決める

feature slug は、成果物やテストファイル名に使う短い名前です。

使える形式は、小文字英数字とハイフンです。

良い例です。

```text
login
conversation-detail
user-management
ailead-12428-meeting-bot-invitation
```

悪い例です。

```text
Login Screen
login_screen
login/test
../login
login-
```

一度決めた feature slug は、同じ作業の途中で変更しないでください。

対象範囲が大きく変わった場合は、別の feature slug を作ります。

## 1. 作業場所を作る

まず、feature 用の artifact ディレクトリと run ディレクトリを作成します。

```bash
npm run agent:init -- --feature login --request "ログイン画面のテスト計画とテスト設計を作成する"
```

作成される主な構造です。

```text
artifacts/login/
  HANDOFF.md
  OPEN_QUESTIONS.md
  FINDINGS.md
  DECISIONS.md
  runs/<run-id>/
    00_request.md
    01_planner/
    02_test_designer/
    03_validator/
    04_generator/
    05_healer/
    evidence/
    99_handoff.md
```

`agent:init` は、AI エージェントを実行するコマンドではありません。

作業場所を作るための補助コマンドです。

## 2. 現在状態を確認する

次に、現在の状態を確認します。

```bash
npm run agent:status -- --feature login
```

このコマンドでは、次の有無を確認できます。

- `specs/login.plan.md`
- `specs/login.test-design.md`
- `specs/_reviews/login.validation.md`
- `specs/login.coverage.md`
- `tests/login.spec.ts`

## 3. 次に使うスキルを確認する

次に、どのスキルを使うべきか確認します。

```bash
npm run agent:next -- --feature login
```

代表的な状態と次の作業です。

| 状態                                           | 次の作業                                                 |
| ---------------------------------------------- | -------------------------------------------------------- |
| artifact scope がない                          | `agent:init` を実行する                                  |
| plan がない                                    | `playwright-test-planner` を使う                         |
| plan はあるが test-design がない               | `playwright-test-designer` を使う                        |
| plan と test-design はあるが validation がない | `playwright-test-plan-validator` を使う                  |
| validation が PASS していない                  | planner または designer を修正し、validator を再実行する |
| validation が PASS して実装がない              | `playwright-test-generator` を使う                       |
| 実装はあるが coverage がない                   | `specs/<feature>.coverage.md` を更新する                 |

迷ったら、まず `agent:next` を見ます。

## 4. テスト計画を作る

テスト計画では、何をテスト設計の対象にするかを整理します。

使用するスキルは `playwright-test-planner` です。

AI エージェントへの依頼例です。

```text
feature slug は login です。
artifacts/login/TARGET_PROJECT_PROFILE.md または artifacts/service-exploration/TARGET_PROJECT_PROFILE.md を確認してください。
npm run agent:status -- --feature login を確認してください。
playwright-test-planner スキルに従って、ログイン画面のテスト計画を作成してください。
必要に応じて Playwright CLI で画面を確認し、snapshot と screenshot の証跡を取得してください。

作成・更新する成果物:
- specs/login.plan.md
- artifacts/login/runs/<run-id>/01_planner/
- artifacts/login/HANDOFF.md
- artifacts/login/OPEN_QUESTIONS.md
- artifacts/login/FINDINGS.md
- artifacts/login/DECISIONS.md

確認できていないことは推測せず、Unverified または OPEN_QUESTIONS.md に残してください。
```

### plan に書く内容

`specs/login.plan.md` には、次を含めます。

- 対象範囲
- 対象外範囲
- 入口画面
- 操作導線
- 前提条件
- 使用するロール
- データ前提
- 証跡一覧
- 画面や動作の概要
- リスク
- テスト設計に渡す入力情報
- 未確認事項

この段階では、最終テストケースを作り込みません。

最終テストケースは、次の `playwright-test-designer` で作成します。

## 5. テスト設計を作る

テスト設計では、テスト技法を使って具体的なテストケースを作ります。

使用するスキルは `playwright-test-designer` です。

AI エージェントへの依頼例です。

```text
feature slug は login です。
specs/login.plan.md をもとに、playwright-test-designer スキルで specs/login.test-design.md を作成してください。

必要なテスト技法だけを選んでください。
使わない技法は、使わない理由を書いてください。
最終テストケースは、それぞれ独立して実行できる形にしてください。
証跡がない期待結果は確認済みとして書かないでください。
```

### 使う技法を無理に増やさない

テスト設計では、すべての技法を使う必要はありません。

| 技法               | 使う場面                                 | 使わない場面              |
| ------------------ | ---------------------------------------- | ------------------------- |
| 同値分割           | 入力値や条件を有効・無効などに分けられる | 条件分岐がない静的表示    |
| 境界値分析         | 文字数、数値、日付、件数などの境界がある | 境界や範囲が未確認        |
| デシジョンテーブル | 複数条件の組み合わせで結果が変わる       | 条件が1つだけ             |
| 状態遷移           | 下書き、公開、停止など状態が変わる       | 状態を持たない画面        |
| 権限マトリクス     | ロールごとに表示や操作が変わる           | 1ロールしか確認していない |

見栄えのためにテストケース数を増やさないでください。

少なくても、根拠が明確で、期待結果が観察でき、独立して実行できるテストケースの方が価値があります。

## 6. 生成前レビューを行う

テスト設計ができたら、すぐに Playwright Test を生成しません。

先に `playwright-test-plan-validator` でレビューします。

AI エージェントへの依頼例です。

```text
feature slug は login です。
specs/login.plan.md と specs/login.test-design.md を playwright-test-plan-validator スキルでレビューしてください。

Plan SHA-256 と Test design SHA-256 を計算してください。
specs/_reviews/login.validation.md に、Semantic Quality Review と Test Design Quality Review を含めて判定を書いてください。
判定は PASS、FAIL、BLOCKED のいずれか1つにしてください。
プレースホルダの PASS | FAIL | BLOCKED を残さないでください。
```

### 判定の意味

| 判定      | 意味                       | 次の作業                       |
| --------- | -------------------------- | ------------------------------ |
| `PASS`    | 生成に進める               | generator に進む               |
| `FAIL`    | 計画または設計の修正が必要 | planner または designer に戻る |
| `BLOCKED` | 必要情報や証跡が足りない   | 不足情報を解消する             |

## 7. generator gate を確認する

生成前に、必ず次を実行します。

```bash
npm run agent:gate -- --feature login --for generator
```

`PASS` の場合だけ、Playwright Test 生成に進めます。

`BLOCKED` の場合は、表示された理由を確認し、plan、test-design、validation を修正します。

`npm run check:validation` は、リポジトリ全体の整合性チェックです。

生成してよいかどうかの判断には、必ず `agent:gate` を使います。

## 8. Playwright Test を生成する

generator gate が `PASS` になったら、`playwright-test-generator` を使います。

AI エージェントへの依頼例です。

```text
feature slug は login です。
npm run agent:gate -- --feature login --for generator を実行してください。
PASS の場合だけ、playwright-test-generator スキルで Playwright Test を生成してください。

入力:
- specs/login.plan.md
- specs/login.test-design.md
- specs/_reviews/login.validation.md
- 関連する evidence

出力:
- tests/login.spec.ts
- specs/login.coverage.md
- artifacts/login/runs/<run-id>/04_generator/test-mapping.md
- artifacts/login/HANDOFF.md

validated test-design にない仕様を勝手に追加しないでください。
除外したケースを勝手に実装しないでください。
認証情報をテストコードに直接書かないでください。
```

## 9. coverage 台帳を更新する

Playwright Test を生成したら、`specs/login.coverage.md` を更新します。

coverage 台帳には、次を書きます。

- 実装したテスト名
- 対応するテスト設計 ID
- 何を確認しているか
- 何を確認していないか
- 明示的に除外したケース
- 残っているリスク
- 最後に更新した run
- 変更履歴

重要なのは、run 配下の `test-mapping.md` を正本にしないことです。

`test-mapping.md` は、その実行時点の履歴です。

現在有効な対応関係は、`specs/login.coverage.md` に残します。

## 10. 生成後にテストを実行する

生成後のテスト実行は、対象プロジェクト側のテスト実行コマンドを使います。

このコマンドは Target Project Profile に書かれているはずです。

例です。

```bash
npm run test:e2e -- tests/e2e/login.spec.ts
```

このリポジトリの `playwright-cli` スキルは、プロジェクトのテストスイート実行コマンドではありません。

`playwright-cli` は、ブラウザ探索、証跡取得、ad hoc な画面確認に使います。

## 11. 失敗した場合

生成した Playwright Test が失敗した場合は、すぐに assertion を弱めたり、`test.skip()` を追加したりしません。

`playwright-test-healer` を使って、原因を分類します。

主な分類例です。

| 分類               | 例                         | 対応                             |
| ------------------ | -------------------------- | -------------------------------- |
| テスト実装の問題   | locator が古い、待機が不足 | 最小修正する                     |
| テストデータの問題 | 前提データがない           | データ準備を見直す               |
| 環境問題           | 対象アプリが起動していない | 環境を直す                       |
| 仕様変更           | 期待結果が変わった         | test-design と validation に戻る |
| プロダクト不具合   | 実装が仕様と違う           | 不具合として報告する             |

詳しくは `06-troubleshooting.md` を見てください。

## 完了条件

機能単位ワークフローは、次の状態になっていれば完了です。

- `specs/<feature>.plan.md` がある
- `specs/<feature>.test-design.md` がある
- `specs/_reviews/<feature>.validation.md` がある
- validation が `PASS` している
- `tests/<feature>.spec.ts` がある、または生成しない理由が明記されている
- `specs/<feature>.coverage.md` がある
- `HANDOFF.md` に現在状態と次の作業が書かれている
- `OPEN_QUESTIONS.md` に未解決事項がまとまっている
- 重要な発見や判断が `FINDINGS.md`、`DECISIONS.md` に反映されている

テストコードだけが存在していても、coverage 台帳や handoff がなければ完了ではありません。
