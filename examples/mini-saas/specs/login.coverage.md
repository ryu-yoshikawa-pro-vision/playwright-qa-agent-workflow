# login coverage 台帳

このファイルはサンプルです。実案件の coverage 正本ではありません。

## Current status

- Status: サンプル実装例あり
- Last updated by run: `examples/mini-saas/service-exploration/` のサンプル探索結果
- Current implementation path: `examples/mini-saas/generated-tests/login.spec.ts.md`
- Source plan: `examples/mini-saas/specs/login.plan.md`
- Source test design: `examples/mini-saas/specs/login.test-design.md`
- Validation report: `examples/mini-saas/specs/_reviews/login.validation.md`

## Coverage summary

- TD-001: 生成テスト例で確認する。
- TD-002: 生成テスト例で確認する。
- TD-003: 生成テスト例で確認する。
- TD-004: 生成テスト例で確認する。
- TD-005: 生成テスト例で確認する。
- TD-006: 追加証跡が必要なため未実装扱いとする。

## Implemented test mapping

- TD-001:
  - 実装例: `login.spec.ts.md` の `TD-001: 正常なユーザーはログインできる`
  - 確認内容: 正常ログイン後にダッシュボードへ到達すること。
- TD-002:
  - 実装例: `login.spec.ts.md` の `TD-002: メールアドレス未入力の場合はエラーになる`
  - 確認内容: メールアドレス必須エラーが表示されること。
- TD-003:
  - 実装例: `login.spec.ts.md` の `TD-003: パスワード未入力の場合はエラーになる`
  - 確認内容: パスワード必須エラーが表示されること。
- TD-004:
  - 実装例: `login.spec.ts.md` の `TD-004: メール形式が不正な場合はエラーになる`
  - 確認内容: メール形式エラーが表示されること。
- TD-005:
  - 実装例: `login.spec.ts.md` の `TD-005: 誤ったパスワードの場合は認証失敗エラーになる`
  - 確認内容: 認証失敗エラーが表示され、ログイン画面に留まること。

## Explicitly not covered

- TD-006:
  - 理由: 送信中状態はタイミング依存であり、追加の trace または screenshot が必要なため。
- パスワード再設定:
  - 理由: 今回の対象外であるため。
- 多要素認証:
  - 理由: 仕様未確認であるため。
- アカウントロック:
  - 理由: 仕様未確認であるため。

## Current assertions policy

- 画面遷移は URL または画面見出しで確認する。
- エラー表示は role または text locator で確認する。
- 認証失敗時は、詳細すぎるエラー理由が表示されないことも確認対象にする。
- 認証情報は環境変数から取得し、テストコードに直接書かない。

## Open questions affecting coverage

- セッション期限切れ時の挙動は未確認。
- ログイン済み状態で `/login` にアクセスした場合の挙動は未確認。
- アカウントロック仕様の有無は未確認。
- 送信中状態の安定した観察方法は未確認。

## Change history

- 2026-06-09:
  - 変更内容: サンプル coverage 台帳を作成。
  - 対応 run: `examples/mini-saas/service-exploration/` のサンプル探索結果
  - 理由: サンプルとして、設計 ID と生成テスト例の対応を示すため。
