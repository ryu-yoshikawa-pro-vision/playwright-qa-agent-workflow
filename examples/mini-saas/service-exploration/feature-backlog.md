# feature-backlog

このファイルはサンプルです。実際のバックログではありません。

## 優先度 高

### login

- 理由: 認証は全機能の入口であり、失敗すると主要機能が利用できない。
- 次の成果物: `examples/mini-saas/specs/login.plan.md`
- 必要な証跡:
  - 初期表示 snapshot
  - 初期表示 screenshot
  - 未入力エラー snapshot
  - 認証失敗エラー snapshot
  - ログイン成功後のダッシュボード screenshot

## 優先度 中

### dashboard

- 理由: ログイン後の主要画面だが、今回はログイン成功の到達確認に限定する。
- 次の成果物: 今回は作成しない。

## 優先度 低

### password-reset

- 理由: メール送信や外部連携を伴う可能性があるため、サンプルでは対象外にする。
- 次の成果物: 今回は作成しない。
