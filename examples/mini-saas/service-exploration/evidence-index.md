# evidence-index

このファイルはサンプルです。実際の証跡ファイルは存在しません。

## 証跡一覧

### EV-LOGIN-001

- 画面または状態: ログイン画面の初期表示
- 証跡種別: snapshot
- パス: `examples/mini-saas/evidence/snapshots/login-initial.txt`
- 取得タイミング: `/login` 表示後
- 証明すること: メールアドレス、パスワード、ログインボタンが存在する。
- 補足: サンプルのため実ファイルは置かない。

### EV-LOGIN-002

- 画面または状態: ログイン画面の初期表示
- 証跡種別: screenshot
- パス: `examples/mini-saas/evidence/screenshots/login-initial.png`
- 取得タイミング: `/login` 表示後
- 証明すること: 主要要素が視覚的に表示されている。
- 補足: サンプルのため実ファイルは置かない。

### EV-LOGIN-003

- 画面または状態: 未入力エラー
- 証跡種別: snapshot
- パス: `examples/mini-saas/evidence/snapshots/login-required-errors.txt`
- 取得タイミング: 未入力でログインボタンを押下後
- 証明すること: 必須入力エラーが表示される。
- 補足: サンプルのため実ファイルは置かない。

### EV-LOGIN-004

- 画面または状態: 認証失敗エラー
- 証跡種別: snapshot
- パス: `examples/mini-saas/evidence/snapshots/login-auth-error.txt`
- 取得タイミング: 誤ったパスワードでログインボタンを押下後
- 証明すること: 認証失敗エラーが表示される。
- 補足: サンプルのため実ファイルは置かない。

### EV-LOGIN-005

- 画面または状態: ダッシュボード表示
- 証跡種別: screenshot
- パス: `examples/mini-saas/evidence/screenshots/dashboard-after-login.png`
- 取得タイミング: 正常ログイン後
- 証明すること: ダッシュボード画面に遷移する。
- 補足: サンプルのため実ファイルは置かない。
