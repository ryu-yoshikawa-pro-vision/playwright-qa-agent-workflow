# 成果物の読み方

このページでは、`agents-playwright` の成果物をどの順番で読めばよいかを説明します。

このリポジトリでは、多くのファイルが作成されます。

すべてを毎回読む必要はありません。

目的に応じて、まず読むファイルを決めます。

## まず見るファイル

作業の現在状態を知りたい場合は、最初に次を見ます。

```text
artifacts/<feature>/HANDOFF.md
specs/<feature>.coverage.md
specs/_reviews/<feature>.validation.md
```

サービス全体探索の場合は、次を見ます。

```text
artifacts/service-exploration/HANDOFF.md
artifacts/service-exploration/FEATURE_BACKLOG.md
artifacts/service-exploration/OPEN_QUESTIONS.md
```

## 成果物の種類

成果物は、大きく次の4種類に分かれます。

| 種類         | 目的                                  | 主な場所                           |
| ------------ | ------------------------------------- | ---------------------------------- |
| 引き継ぎ     | 次の作業者が現在状態を理解する        | `artifacts/<scope>/HANDOFF.md`     |
| 正本         | 現在有効な計画、設計、coverage を示す | `specs/`                           |
| 実行履歴     | 1回の作業で何をしたかを残す           | `artifacts/<scope>/runs/<run-id>/` |
| 仕様カタログ | 再利用可能な仕様情報を残す            | `artifacts/spec-catalog/`          |

## 1. 現在状態を知りたい

見るファイルです。

```text
artifacts/<feature>/HANDOFF.md
```

ここには、次の情報がまとまっている想定です。

- 直近で何をしたか
- どの成果物が作成・更新されたか
- 次に何をすべきか
- 作業上の注意点
- 未解決事項へのリンク
- 関連する run へのリンク

`HANDOFF.md` に現在状態が書かれていない場合、その作業は引き継ぎ不十分です。

run 配下のログだけに重要情報が残っている状態は避けます。

## 2. 未解決事項を知りたい

見るファイルです。

```text
artifacts/<feature>/OPEN_QUESTIONS.md
artifacts/service-exploration/OPEN_QUESTIONS.md
artifacts/spec-catalog/OPEN_QUESTIONS.md
```

未解決事項には、次のような内容を書きます。

- 仕様が確認できていないこと
- 証跡が不足していること
- 使用ロールが足りず確認できないこと
- データ準備が必要なこと
- 対象プロジェクト側の情報が不足していること

未解決事項があること自体は問題ではありません。

問題なのは、未解決事項を隠して、確認済みのように扱うことです。

## 3. 重要な発見を知りたい

見るファイルです。

```text
artifacts/<feature>/FINDINGS.md
artifacts/service-exploration/FINDINGS.md
```

発見には、次のような内容を書きます。

- 画面で確認できた仕様
- 既存ドキュメントと画面の差分
- テスト設計で使える制約
- 不具合の可能性
- 権限差分
- 再利用できる locator 候補

再利用できる仕様は、必要に応じて `artifacts/spec-catalog/` にも反映します。

## 4. 重要な判断を知りたい

見るファイルです。

```text
artifacts/<feature>/DECISIONS.md
artifacts/service-exploration/DECISIONS.md
artifacts/spec-catalog/DECISIONS.md
```

判断には、次のような内容を書きます。

- 今回の対象範囲
- 対象外にした範囲
- 採用したテスト技法
- 採用しなかったテスト技法と理由
- 生成しないケースと理由
- 修復時に assertion 方針を変えたかどうか

判断は後から見返すために重要です。

口頭やチャットだけで決めた内容は、必要に応じて `DECISIONS.md` に残します。

## 5. 計画を知りたい

見るファイルです。

```text
specs/<feature>.plan.md
```

plan は、テスト設計の前提です。

主に次を確認します。

- 対象範囲
- 対象外範囲
- entry point
- 使用ロール
- データ前提
- 画面や動作の概要
- 証跡
- リスク
- テスト設計に渡す情報
- 未確認事項

plan は、最終テストケース一覧ではありません。

最終テストケースは `specs/<feature>.test-design.md` にあります。

## 6. テスト設計を知りたい

見るファイルです。

```text
specs/<feature>.test-design.md
```

test-design は、テストケースの正本です。

主に次を確認します。

- 使用したテスト技法
- 使用しなかったテスト技法と理由
- テスト条件
- 技法ごとの分析
- 最終テストケース
- 自動化候補
- 除外したケース
- 残リスク
- 未解決事項

Playwright Test を生成する場合、generator はこの test-design を主な入力として扱います。

validated test-design にない仕様を、generator が勝手に追加してはいけません。

## 7. 生成前レビューの結果を知りたい

見るファイルです。

```text
specs/_reviews/<feature>.validation.md
```

validation では、plan と test-design が生成に進める品質かを確認します。

主に次を確認します。

- `Decision`
- `Semantic Review Decision`
- `Test Design Review Decision`
- `Plan SHA-256`
- `Test design SHA-256`
- FAIL または BLOCKED の理由
- planner / designer への修正指示

生成前には、必ず次も確認します。

```bash
npm run agent:gate -- --feature <feature> --for generator
```

`validation.md` が存在していても、`agent:gate` が `PASS` でなければ生成に進みません。

## 8. 実装済みテストと設計 ID の対応を知りたい

見るファイルです。

```text
specs/<feature>.coverage.md
```

coverage 台帳は、現在実装されているテストとテスト設計 ID の対応関係を示す正本です。

主に次を確認します。

- 実装済みテスト
- 対応するテスト設計 ID
- 何を確認しているか
- 何を確認していないか
- 明示的に除外したケース
- 残っているリスク
- 最後に更新した run
- 変更履歴

`artifacts/<feature>/runs/<run-id>/04_generator/test-mapping.md` は履歴です。

現在の正本は `specs/<feature>.coverage.md` です。

## 9. 実行履歴を知りたい

見る場所です。

```text
artifacts/<feature>/runs/<run-id>/
```

run 配下には、1回の作業で作成した詳細な記録が入ります。

例です。

```text
01_planner/
02_test_designer/
03_validator/
04_generator/
05_healer/
evidence/
99_handoff.md
```

run 配下は、履歴や詳細調査には便利です。

ただし、現在の正本ではありません。

重要な発見、判断、未解決事項、次の作業は、必ず scope-level の handoff ファイルへ昇格します。

## 10. 証跡を確認したい

見る場所です。

```text
artifacts/<feature>/runs/<run-id>/evidence/
```

代表的な証跡です。

| 種類        | 目的                                                     |
| ----------- | -------------------------------------------------------- |
| screenshots | 見た目、表示状態、モーダル、disabled、loading など       |
| snapshots   | role、label、accessible name、テキスト構造、locator 候補 |
| traces      | 操作の流れ、失敗調査、遷移確認                           |
| console     | ブラウザエラー、警告                                     |
| network     | API エラー、通信失敗                                     |

証跡ファイルは重くなりやすく、機密情報を含む可能性があります。

通常は Git 管理しません。

## 11. 仕様カタログを見たい

見る場所です。

```text
artifacts/spec-catalog/
```

仕様カタログは、複数機能で再利用できる仕様情報を残す場所です。

例です。

```text
artifacts/spec-catalog/
  INDEX.md
  OPEN_QUESTIONS.md
  DECISIONS.md
  terminology.md
  screens/
  features/
  flows/
  data/
  roles/
  rules/
```

仕様カタログには、確認済みの仕様だけでなく、`Partial` や `Unverified` として不確かな情報を残す場合もあります。

不確かな情報を確認済みとして扱わないでください。

## 読む順番の例

### 例1: 途中から作業を引き継ぐ

次の順で読みます。

1. `artifacts/<feature>/HANDOFF.md`
2. `artifacts/<feature>/OPEN_QUESTIONS.md`
3. `specs/<feature>.coverage.md`
4. `specs/_reviews/<feature>.validation.md`
5. 必要に応じて `runs/<run-id>/99_handoff.md`

### 例2: テスト生成してよいか確認する

次の順で確認します。

1. `specs/<feature>.plan.md`
2. `specs/<feature>.test-design.md`
3. `specs/_reviews/<feature>.validation.md`
4. `npm run agent:gate -- --feature <feature> --for generator`

`agent:gate` が `PASS` でなければ生成しません。

### 例3: テストが何を確認しているか知りたい

次を見ます。

1. `specs/<feature>.coverage.md`
2. `specs/<feature>.test-design.md`
3. `tests/<feature>.spec.ts`
4. `artifacts/<feature>/runs/<run-id>/04_generator/test-mapping.md`

最初に見るのは coverage 台帳です。

### 例4: 画面仕様を知りたい

次を見ます。

1. `artifacts/spec-catalog/INDEX.md`
2. `artifacts/spec-catalog/screens/`
3. `artifacts/spec-catalog/flows/`
4. `artifacts/service-exploration/HANDOFF.md`
5. 必要に応じて service exploration の run-local artifacts

## よくある誤解

### run 配下が最新の正本だと思ってしまう

違います。

run 配下は履歴です。

現在の状態は、`HANDOFF.md`、`specs/*.plan.md`、`specs/*.test-design.md`、`specs/*.coverage.md`、`specs/_reviews/*.validation.md` を見ます。

### test-mapping.md だけあればよいと思ってしまう

違います。

`test-mapping.md` は生成時の履歴です。

現在有効な対応関係は `specs/<feature>.coverage.md` に残します。

### screenshot があれば snapshot は不要だと思ってしまう

違います。

screenshot は見た目の証跡に強く、snapshot は role、label、accessible name、locator 候補に強いです。

両方を使い分けます。

### validation があれば必ず生成できると思ってしまう

違います。

validation が存在しても、判定が `PASS` でなかったり、SHA-256 が古かったりする場合は生成できません。

必ず `agent:gate` を確認します。
