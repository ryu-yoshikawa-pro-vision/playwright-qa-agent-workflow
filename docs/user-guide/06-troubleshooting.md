# 困ったときの確認方法

このページでは、`agents-playwright` を使うときによくある詰まり方と確認方法を説明します。

作業が止まったときは、すぐに推測で進めず、原因を切り分けます。

## 1. どのスキルを使えばよいか分からない

まず、feature slug が決まっているか確認します。

feature slug が決まっている場合は、次を実行します。

```bash
npm run agent:next -- --feature <feature>
```

例です。

```bash
npm run agent:next -- --feature login
```

表示された次のスキルまたはアクションに従います。

feature slug がまだ決まっていない場合は、サービス全体探索から始める可能性が高いです。

その場合は `03-service-exploration.md` を確認してください。

## 2. `agent:init` が失敗する

feature slug の形式が正しいか確認します。

良い例です。

```text
login
conversation-detail
user-management
```

悪い例です。

```text
Login Screen
login_screen
login/test
../login
login-
```

小文字英数字とハイフンだけを使います。

## 3. `agent:gate` が `BLOCKED` になる

生成前の gate が `BLOCKED` になる場合、Playwright Test を生成してはいけません。

次を確認します。

```bash
npm run agent:gate -- --feature <feature> --for generator
```

よくある原因です。

| 原因 | 確認するファイル | 対応 |
| --- | --- | --- |
| plan がない | `specs/<feature>.plan.md` | planner を実行する |
| test-design がない | `specs/<feature>.test-design.md` | designer を実行する |
| validation がない | `specs/_reviews/<feature>.validation.md` | validator を実行する |
| validation が `PASS` ではない | validation report | FAIL / BLOCKED 理由を直す |
| plan の SHA が一致しない | validation report | validator を再実行する |
| test-design の SHA が一致しない | validation report | validator を再実行する |
| Semantic Review Decision が `PASS` ではない | validation report | plan 側の品質を直す |
| Test Design Review Decision が `PASS` ではない | validation report | test-design 側の品質を直す |
| `PASS | FAIL | BLOCKED` のプレースホルダが残っている | validation report | 1つの判定に置き換える |

`agent:gate` は、generator に進んでよいかを判断するためのコマンドです。

`npm run check:validation` が通っても、`agent:gate` が `PASS` でなければ生成しません。

## 4. Playwright CLI が使えない

まず、次を実行します。

```bash
playwright-cli --help
```

実行できない場合、次の作業は `BLOCKED` です。

- ブラウザ探索
- UI 操作
- screenshot 取得
- snapshot 取得
- trace 取得
- live UI による ad hoc 確認

対応方法です。

1. Playwright CLI がインストールされているか確認する
2. PATH が通っているか確認する
3. 対象環境でシェルコマンドを実行できるか確認する
4. それでも使えない場合は、ブラウザ依存の作業を `BLOCKED` として記録する

Playwright CLI が使えない状態で、画面を確認したことにして成果物を書いてはいけません。

## 5. ログイン後の画面を探索できない

次を確認します。

| 確認項目 | 説明 |
| --- | --- |
| 対象 URL | 正しい環境を開いているか |
| アカウント | 使用可能なアカウントがあるか |
| ロール | 必要な権限があるか |
| 認証方式 | SSO、OAuth、MFA などが必要か |
| session 方針 | Playwright CLI session を使うか |
| saved state 方針 | 保存済みブラウザ状態を使うか |

認証情報そのものは成果物に書きません。

ログイン状態が必要だが用意できない場合、ログイン後画面の探索は `BLOCKED` として扱います。

## 6. 対象プロジェクトのテスト実行コマンドが分からない

このリポジトリ側で勝手に決めません。

対象プロジェクトの次を確認します。

- README
- `package.json` の scripts
- CI 設定
- 既存 Playwright 設定
- 既存テストの実行手順
- Target Project Profile

分からない場合は、生成後のテスト実行を `BLOCKED` として記録します。

ただし、静的なテストコードレビュー、test-design との対応確認、coverage 台帳更新は可能です。

## 7. 生成したテストが失敗する

すぐにテストを弱めないでください。

まず、失敗原因を分類します。

| 分類 | 例 | 対応 |
| --- | --- | --- |
| 環境問題 | アプリが起動していない、URL が違う | 環境を直す |
| 認証問題 | ログイン状態がない、権限が違う | session やロールを確認する |
| locator 問題 | ボタン名や label が変わった | 実画面と証跡で確認して修正する |
| wait 問題 | 非同期表示を待てていない | 適切な期待条件で待つ |
| データ問題 | 前提データがない | データ準備を見直す |
| 仕様変更 | 期待結果が変わった | test-design と validation に戻る |
| プロダクト不具合 | 仕様通りに動いていない | 不具合として報告する |

`playwright-test-healer` を使う場合は、修正前に failure analysis を作成します。

## 8. `test.skip()` や `test.fixme()` を使いたくなる

原則として使いません。

使用できるのは、ユーザーが明示的に承認した場合だけです。

失敗を隠すために `test.skip()` や `test.fixme()` を追加してはいけません。

先に次を確認します。

- 本当にテスト側の問題か
- プロダクト不具合ではないか
- 仕様変更ではないか
- test-design を更新する必要がないか
- coverage 台帳に影響がないか

## 9. assertion を弱めたくなる

テストを通すためだけに assertion を弱めてはいけません。

悪い例です。

```ts
await expect(page.getByText('保存しました')).toBeVisible();
```

が失敗したため、次のように変える。

```ts
await expect(page.locator('body')).toBeVisible();
```

これは、確認したい内容を失っています。

assertion を変える場合は、次を確認します。

- 元の期待結果は正しいか
- 画面仕様が変わったのか
- より適切な観察方法があるか
- test-design の期待結果も変える必要があるか
- coverage 台帳に変更を記録する必要があるか

## 10. arbitrary sleep を入れたくなる

`waitForTimeout` のような固定待ちは、主な修正方法にしないでください。

悪い例です。

```ts
await page.waitForTimeout(5000);
```

代わりに、画面上の期待状態を待ちます。

例です。

```ts
await expect(page.getByRole('button', { name: '保存' })).toBeEnabled();
await expect(page.getByText('保存しました')).toBeVisible();
```

固定待ちが必要に見える場合は、なぜ状態待ちにできないのかを記録します。

## 11. coverage 台帳がない、または古い

実装済みテストがあるのに `specs/<feature>.coverage.md` がない場合、作業は完了ではありません。

次を確認します。

```bash
npm run agent:status -- --feature <feature>
```

coverage 台帳には、次を記録します。

- 実装済みテスト
- 対応する test-design ID
- 何を確認しているか
- 何を確認していないか
- 明示的に除外したケース
- 残リスク
- 最後に更新した run
- 変更履歴

実装ファイルの方が coverage 台帳より新しい場合、coverage が古い可能性があります。

その場合は、実装変更が coverage、除外、未確認事項、assertion 方針に影響していないか確認します。

## 12. どのファイルが正本か分からない

目的別に見るファイルです。

| 知りたいこと | 見るファイル |
| --- | --- |
| 現在状態 | `artifacts/<feature>/HANDOFF.md` |
| 未解決事項 | `artifacts/<feature>/OPEN_QUESTIONS.md` |
| テスト計画 | `specs/<feature>.plan.md` |
| テスト設計 | `specs/<feature>.test-design.md` |
| 生成前レビュー | `specs/_reviews/<feature>.validation.md` |
| 実装済みテストとの対応 | `specs/<feature>.coverage.md` |
| 実行履歴 | `artifacts/<feature>/runs/<run-id>/` |

run 配下のファイルは履歴です。

現在の正本は、scope-level handoff と `specs/` 配下のファイルです。

## 13. `npm run check` が失敗する

まず、どのチェックで失敗しているか確認します。

| コマンド | 主な確認内容 |
| --- | --- |
| `npm run lint` | JavaScript / TypeScript / Markdown の lint |
| `npm run format:check` | Prettier の整形確認 |
| `npm run typecheck` | TypeScript の型確認 |
| `npm run check:artifacts` | 必須成果物やテンプレートの存在確認 |
| `npm run check:validation` | plan / test-design / validation の SHA 整合性 |
| `npm run check:coverage` | coverage 台帳と実装テストの対応確認 |
| `npm run check:logs` | runtime log の形式確認 |
| `npm run check:semantic` | semantic fixture の構造確認 |
| `npm run check:test-design` | test-design fixture の構造確認 |

エラー文に出ているファイルを直します。

ただし、これらのチェックが通っても、実アプリの探索品質やテスト設計の意味的正しさが保証されるわけではありません。

## 14. AI エージェントの成果物が薄い

この場合、スキルを増やす前に、入力情報と証跡を確認します。

よくある原因です。

- Target Project Profile が薄い
- 対象範囲が広すぎる
- Playwright CLI の証跡が少ない
- screenshot がなく snapshot だけで判断している
- 未確認事項を `Unverified` として整理していない
- 仕様カタログを読んでいない
- planner と designer の責務が混ざっている
- validation が形式だけで通っている

対応です。

1. feature を小さく切る
2. 対象画面を実際に Playwright CLI で確認する
3. snapshot と screenshot の両方を残す
4. plan に証跡と未確認事項を明記する
5. designer では必要な技法だけを選ぶ
6. validator で shallow な記述を FAIL にする

AI エージェントに「もっと詳しく」とだけ言っても改善しにくいです。

不足している入力、証跡、判断観点を具体的に指定してください。

## 15. 判断に迷ったときの原則

迷った場合は、次の原則を優先します。

1. 推測で確認済みにしない
2. 危険な操作はしない
3. 証跡がない仕様は `Unverified` にする
4. generator は `agent:gate` が `PASS` してから使う
5. テストを通すために assertion を弱めない
6. 重要情報は run 配下だけでなく handoff に昇格する
7. coverage に影響する変更は `specs/<feature>.coverage.md` に反映する
8. design に影響する変更は `specs/<feature>.test-design.md` に戻して validation をやり直す
