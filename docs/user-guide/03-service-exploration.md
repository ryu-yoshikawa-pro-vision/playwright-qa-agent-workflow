# サービス全体探索の進め方

このページでは、対象アプリ全体をまだ十分に把握できていないときの進め方を説明します。

サービス全体探索では、いきなりテストケースや Playwright Test を作りません。

まず、画面、導線、機能候補、権限差分、未確認事項を整理し、後続でどの機能をテスト計画に進めるかを決めます。

## 使う場面

次のどれかに当てはまる場合は、サービス全体探索から始めます。

- 対象アプリの画面構成が分からない
- どの機能をテスト対象にするか決まっていない
- 既存仕様書が古い、または不足している
- 権限ごとの見え方を確認したい
- 後続のテスト計画に使う機能候補を洗い出したい
- AI エージェントに対象アプリを把握させたい

対象がすでに「ログイン画面」「会話詳細画面」「ユーザー管理」などに決まっている場合は、サービス全体探索ではなく `04-feature-workflow.md` に進んでください。

## 使用するスキル

サービス全体探索では、主に次のスキルを使います。

| スキル | 目的 |
| --- | --- |
| `playwright-service-mapper` | サービス全体の画面、導線、機能候補を整理する |
| `playwright-cli` | ブラウザを操作し、snapshot、screenshot、trace などの証跡を取る |

## 作成・更新する成果物

サービス全体探索では、次の成果物を作成または更新します。

```text
artifacts/service-exploration/
  TARGET_PROJECT_PROFILE.md
  HANDOFF.md
  OPEN_QUESTIONS.md
  FINDINGS.md
  DECISIONS.md
  FEATURE_BACKLOG.md
  runs/<run-id>/
    00_request.md
    01_service_mapper/
      exploration-log.md
      service-map.md
      screen-inventory.md
      navigation-map.md
      feature-inventory.md
      role-permission-map.md
      coverage-matrix.md
      open-questions.md
      evidence-index.md
      service-mapper-summary.md
    evidence/
      screenshots/
      traces/
      snapshots/
      console/
      network/
    99_handoff.md
```

再利用できる仕様が分かった場合は、次も更新します。

```text
artifacts/spec-catalog/
```

## 作業前に確認すること

サービス全体探索を始める前に、次を確認します。

- `artifacts/service-exploration/TARGET_PROJECT_PROFILE.md` があること
- 対象アプリの URL が分かっていること
- 使用するアカウントまたはロールが分かっていること
- データ操作ルールが分かっていること
- Playwright CLI が使えること

Playwright CLI は次で確認します。

```bash
playwright-cli --help
```

## AI エージェントへの依頼例

サービス全体探索を依頼する場合は、次のように依頼します。

```text
AGENTS.md を読んでください。
artifacts/service-exploration/TARGET_PROJECT_PROFILE.md を確認してください。
playwright-service-mapper スキルに従い、対象アプリ全体を Playwright CLI で探索してください。

次を作成・更新してください。
- artifacts/service-exploration/HANDOFF.md
- artifacts/service-exploration/OPEN_QUESTIONS.md
- artifacts/service-exploration/FINDINGS.md
- artifacts/service-exploration/DECISIONS.md
- artifacts/service-exploration/FEATURE_BACKLOG.md
- artifacts/service-exploration/runs/<run-id>/01_service_mapper/
- artifacts/service-exploration/runs/<run-id>/evidence/

確認できた再利用可能な仕様は artifacts/spec-catalog/ に反映してください。
確認できていないことは推測で書かず、Unverified または OPEN_QUESTIONS.md に残してください。
```

## 探索で確認する内容

### 1. 画面一覧

次を記録します。

| 項目 | 例 |
| --- | --- |
| 画面 ID | `SCR-001` |
| 画面名 | ログイン画面 |
| URL または到達方法 | `/login` |
| 主な表示内容 | メールアドレス、パスワード、ログインボタン |
| 主な操作 | ログイン、パスワード再設定導線 |
| 証跡 | screenshot、snapshot |
| 未確認事項 | MFA の有無は未確認 |

画面名だけでは不足です。

後続の計画や設計で使えるように、到達方法、操作、状態、証跡を残します。

### 2. 導線

次を記録します。

| 項目 | 例 |
| --- | --- |
| 開始画面 | ログイン画面 |
| 操作 | 正常ログイン |
| 到達画面 | ダッシュボード |
| 条件 | 有効な一般ユーザー |
| 証跡 | trace、screenshot |
| 備考 | 初回ログイン時の案内表示は未確認 |

導線は、画面間の移動を後続のテスト計画で使える形にするために記録します。

### 3. 機能候補

後続でテスト計画に進める候補を `FEATURE_BACKLOG.md` に記録します。

| 優先度 | 機能候補 | 理由 | 推奨次アクション |
| --- | --- | --- | --- |
| High | ログイン | 全機能の入口でありリスクが高い | planner に進める |
| Medium | ユーザー管理 | 権限差分がありそう | 追加探索後に planner |
| Low | ヘルプページ | 静的表示中心 | 必要時に確認 |

`FEATURE_BACKLOG.md` は、単なるメモではありません。

次にどの機能を planner に進めるかを判断するための候補一覧です。

### 4. 権限差分

複数ロールを確認できる場合は、ロールごとの差分を記録します。

| 画面 / 機能 | 一般ユーザー | 管理者 | 未確認事項 |
| --- | --- | --- | --- |
| ダッシュボード | 表示可 | 表示可 | なし |
| ユーザー管理 | 非表示 | 表示可 | 編集権限の詳細は未確認 |

実際に該当ロールで確認していない場合は、権限差分を断定しないでください。

### 5. 証跡

探索では、snapshot と screenshot を組み合わせます。

| 証跡 | 使いどころ |
| --- | --- |
| snapshot | ボタン名、ラベル、ロール、テキスト、locator 候補 |
| screenshot | レイアウト、表示状態、モーダル、disabled、loading、empty state |
| trace | 一連の操作、失敗調査、遷移の確認 |
| console | ブラウザエラー、警告 |
| network | API エラー、通信失敗 |

画面の見た目や状態に関する主張は、snapshot だけで断定しません。

たとえば、disabled 状態、モーダル表示、ローディング状態、レスポンシブ表示は screenshot または trace が必要です。

## 仕様カタログへの反映

探索で分かった再利用可能な仕様は、`artifacts/spec-catalog/` に反映します。

反映する例です。

- 画面一覧
- 主要フロー
- 共通ルール
- データ制約
- ロール差分
- 用語
- エラーメッセージ

ただし、1回の探索でしか確認していない内容や、不確かな内容は `Partial` または `Unverified` として扱います。

仕様カタログには、できるだけ証跡または参照元成果物を書きます。

## 完了条件

サービス全体探索は、次の状態になっていれば完了です。

- 主要画面が `screen-inventory.md` に整理されている
- 主要導線が `navigation-map.md` に整理されている
- 機能候補が `feature-inventory.md` と `FEATURE_BACKLOG.md` に整理されている
- 探索済み範囲と未探索範囲が分かる
- 証跡一覧が `evidence-index.md` にある
- 未確認事項が `OPEN_QUESTIONS.md` にある
- 重要な発見が `FINDINGS.md` にある
- 重要な判断が `DECISIONS.md` にある
- 次に planner へ進める機能候補がある
- `HANDOFF.md` に次の作業者が読むべき内容がある

## やってはいけないこと

サービス全体探索では、次をしてはいけません。

- いきなり巨大なテスト計画を作る
- いきなり Playwright Test を生成する
- 証跡がない仕様を確認済みとして書く
- 1つのロールしか見ていないのに権限差分を断定する
- run 配下のログだけに重要情報を残す
- 認証情報や保存済みブラウザ状態を Git に残す

## 次に進む作業

サービス全体探索が終わったら、`FEATURE_BACKLOG.md` から1つの機能を選び、機能単位ワークフローに進みます。

次のページを読んでください。

```text
docs/user-guide/04-feature-workflow.md
```
