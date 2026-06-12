# Release QA Cockpit 設計書

## 1. 概要

`Release QA Cockpit` は、リリース前 QA の進捗、未解決不具合、
残リスク、承認可否、証跡をローカルブラウザ上で管理し、
最終的にリリース判定レポートを出力するための
ローカルファースト SaaS 風アプリケーションである。

本アプリケーションは、外部 API や外部 DB にデータを保存しない。
データはブラウザの IndexedDB に保存し、ユーザーのローカル環境だけで
QA 管理とリリース判定を完結させる。

このアプリケーションは、単体でも開発デモに使用できる業務アプリであり、
同時に AI エージェントが探索、仕様理解、テスト計画、テスト設計、
Playwright Test 生成、失敗時の修復を行うための実践的なテスト対象でもある。

## 2. 背景

AI エージェントに Web アプリケーションをテスト対象として触らせる場合、
単純な TODO アプリやログインサンプルでは、実務に近いテスト設計や
探索的テストの検証が難しい。

一方で、実際の業務 SaaS は外部認証、外部 DB、権限、ネットワーク、
API 制約、データ準備などが絡み、テスト対象として扱うまでの準備が重い。

そのため、本リポジトリ内に、ローカルだけで完結しながらも、
実際の SaaS に近い複雑さを持つアプリケーションを同梱する。

本アプリケーションでは、以下を重視する。

- 実際に使えそうな業務価値があること
- 開発デモで価値が伝わること
- IndexedDB によるローカル永続化を活用すること
- AI エージェントの探索対象として十分に複雑であること
- Playwright Test の自動生成対象として現実的であること
- データリセットにより、毎回同じ状態からテストできること

## 3. プロダクトコンセプト

### 3.1 プロダクト名

`Release QA Cockpit`

### 3.2 一文説明

リリース前 QA の状況、未解決リスク、不具合、承認可否、証跡を
ローカルブラウザ上で管理し、リリース判定レポートを出力するアプリ。

### 3.3 提供価値

本アプリケーションの価値は、一般的なプロジェクト管理 SaaS や
テスト管理ツールの代替ではなく、以下に特化する点にある。

- 外部保存なしで QA 状況を管理できる
- リリース可否の判断に必要な情報を一画面で確認できる
- 未解決不具合と残リスクをリリース判定に反映できる
- QA 実施結果と判定理由を証跡として出力できる
- デモや AI テスト検証のために状態を再現できる

### 3.4 差別化ポイント

本アプリケーションは Jira、Linear、TestRail のような汎用管理ツールを
目指さない。

差別化ポイントは、以下である。

- リリース前 QA の判定に特化する
- IndexedDB によりローカルだけで完結する
- Demo Mode により状態を即座に切り替えられる
- Evidence Pack により QA 証跡を出力できる
- AI エージェントのテスト対象として設計されている

## 4. 想定ユーザー

### 4.1 QA リード

リリース前 QA の進行状況、不具合、残リスクを確認し、
リリース判定を行うユーザー。

主な利用目的は以下である。

- リリースごとの QA 状況を確認する
- 未解決不具合を確認する
- 残リスクを承認または差し戻す
- リリース判定コメントを残す
- Evidence Pack を出力する

### 4.2 QA メンバー

テスト項目を実行し、結果、不具合、証跡メモを登録するユーザー。

主な利用目的は以下である。

- 担当テスト項目を確認する
- テスト結果を登録する
- Fail 時に不具合を登録する
- Blocked 時に理由を記録する
- 再テスト結果を登録する

### 4.3 開発者

不具合の内容を確認し、修正状況を更新するユーザー。

主な利用目的は以下である。

- 不具合の再現手順を確認する
- 不具合ステータスを更新する
- 修正後に再テスト依頼を出す

### 4.4 閲覧者

リリース状況を確認するが、編集はしないユーザー。

主な利用目的は以下である。

- QA 進捗を確認する
- リリース判定の理由を確認する
- Evidence Pack を閲覧する

### 4.5 開発デモ実施者

本アプリケーションを開発デモや AI テストワークフロー検証に使うユーザー。

主な利用目的は以下である。

- Demo Mode でシナリオを切り替える
- AI エージェントにアプリを探索させる
- 特定機能のテスト計画を作成させる
- Playwright Test の生成結果を確認する

## 5. スコープ

### 5.1 MVP スコープ

MVP では、リリース判定に必要な最小機能に絞る。

- ローカルログイン
- ロール切替
- QA Cockpit
- Release Workspace
- QA Scope
- Test Run Board
- Defect Triage
- Risk Register
- Release Decision
- Evidence Pack Export
- Demo Mode
- Seed Reset
- IndexedDB 永続化

### 5.2 Phase 2 スコープ

MVP 後に、操作性やデモ価値を高める機能を追加する。

- CSV インポート
- CSV エクスポート
- JSON バックアップ
- JSON リストア
- 保存済みビュー
- 大量データシナリオ
- 簡易通知
- アクティビティタイムライン強化
- キーボード操作改善

### 5.3 初期スコープ外

以下は初期スコープ外とする。

- 外部認証
- 外部 API 連携
- 外部 DB 保存
- 本格的なユーザー管理
- 組織管理
- 顧客要望管理
- 複雑な通知設定
- PDF 出力
- リアルタイム共同編集

## 6. リポジトリ内配置

本アプリケーションは、ワークフロー本体とは分離し、
実行可能なサンプル対象アプリとして配置する。

```text
examples/
  release-qa-cockpit/
    README.md
    package.json
    index.html
    vite.config.ts
    tsconfig.json
    src/
      main.tsx
      App.tsx
      routes/
      pages/
      components/
      features/
      db/
      fixtures/
      testids/
      styles/
    tests/
      smoke.spec.ts
    docs/
      target-project-profile.md
      app-spec.md
      seed-data.md
```

設計書は以下に配置する。

```text
docs/app-design/release-qa-cockpit.md
```

## 7. 技術構成

### 7.1 フロントエンド

- React
- TypeScript
- Vite
- React Router
- Zod
- date-fns

### 7.2 データ保存

- IndexedDB
- Dexie.js
- dexie-react-hooks

IndexedDB はブラウザ内に構造化データを保存するために使用する。
Dexie.js は IndexedDB の薄いラッパーとして使用し、
DB スキーマ、CRUD、トランザクション、クエリの扱いを簡潔にする。

### 7.3 テスト

- Playwright Test
- React Testing Library は任意

本アプリケーションの主目的は E2E テスト対象であるため、
MVP では Playwright Test を優先する。

### 7.4 スタイリング

MVP では、CSS Modules または通常の CSS を使用する。
過度な UI ライブラリ依存は避ける。

理由は以下である。

- AI エージェントが DOM 構造を理解しやすい
- aria 属性とラベルを制御しやすい
- UI ライブラリ固有の複雑な DOM に依存しない
- テスト対象としての安定性を確保しやすい

## 8. 画面一覧

### 8.1 ルーティング

```text
/login
/dashboard
/releases
/releases/:releaseId/overview
/releases/:releaseId/scope
/releases/:releaseId/test-run
/releases/:releaseId/defects
/releases/:releaseId/risks
/releases/:releaseId/decision
/releases/:releaseId/evidence
/reports
/settings/demo
/settings/data
```

### 8.2 Login

ローカルデモユーザーでログインする画面。

MVP では、実際のパスワード認証ではなく、
用意されたデモユーザーを選択してログインする方式とする。

主な UI は以下である。

- ユーザー選択
- ロール表示
- ログインボタン
- データリセット導線

テスト観点は以下である。

- ユーザー選択後にログインできる
- 未選択ではログインできない
- ログイン後に dashboard へ遷移する
- セッションが IndexedDB に保存される
- ログアウト後に login へ戻る

### 8.3 Dashboard / QA Cockpit

アプリ起動後に表示する中心画面。

単なる集計画面ではなく、リリース可否を判断するための
Cockpit とする。

表示項目は以下である。

- 対象リリース
- Release Readiness
- 判定理由
- QA 進捗
- 未実施テスト数
- Fail テスト数
- Blocked テスト数
- Critical / High 不具合数
- 未承認リスク数
- 次に必要なアクション
- 最近のアクティビティ

Release Readiness は以下のいずれかで表示する。

- Not Ready
- At Risk
- Ready

テスト観点は以下である。

- シードデータごとに判定が変わる
- 判定理由が表示される
- カードクリックで詳細画面へ遷移する
- ロールにより操作導線が変わる
- データ更新後に集計が再計算される

### 8.4 Releases

リリース一覧画面。

表示項目は以下である。

- リリース名
- プロダクト名
- バージョン
- リリース予定日
- ステータス
- Readiness
- QA 進捗
- 未解決 Critical / High 不具合数
- 担当 QA

操作は以下である。

- リリース作成
- リリース検索
- ステータス絞り込み
- Readiness 絞り込み
- 詳細へ遷移
- アーカイブ

テスト観点は以下である。

- リリースを新規作成できる
- 必須項目未入力では保存できない
- 検索とフィルタが併用できる
- アーカイブ済みリリースは編集制限される
- 一覧の Readiness が詳細画面と一致する

### 8.5 Release Overview

リリースの概要画面。

表示項目は以下である。

- リリース名
- バージョン
- リリース予定日
- QA 期間
- リリース目的
- 対象範囲サマリー
- 主要リスク
- 最終判定サマリー

操作は以下である。

- 基本情報編集
- ステータス変更
- アーカイブ
- Evidence 画面へ遷移

テスト観点は以下である。

- 日付の前後関係が検証される
- アーカイブ後は編集できない
- ステータス変更が activity log に残る

### 8.6 QA Scope

リリース対象の確認範囲を管理する画面。

QA Scope は、テストケース管理よりも上位の概念として扱う。
「今回のリリースで何を確認するか」を明確にするための機能である。

表示項目は以下である。

- スコープ名
- カテゴリ
- 優先度
- 必須確認かどうか
- 対象機能
- 説明
- 関連テスト項目数

操作は以下である。

- スコープ追加
- スコープ編集
- スコープ削除
- テスト項目追加
- 必須 / 任意の切り替え

テスト観点は以下である。

- 必須スコープにテスト項目がない場合は警告される
- スコープ削除時に関連テスト項目がある場合は確認される
- スコープの必須設定が Release Decision に影響する

### 8.7 Test Run Board

テスト実行画面。

この画面は、AI エージェントのテスト対象として重要な画面である。
状態遷移、フォーム、関連データ作成、進捗再計算を含む。

表示列は以下である。

- Not Started
- In Progress
- Pass
- Fail
- Blocked
- Skipped
- Retest

表示項目は以下である。

- テスト項目名
- 優先度
- 必須 / 任意
- 担当者
- 最終更新日時
- 関連不具合数
- 証跡メモ有無

操作は以下である。

- テスト項目を開く
- 実行結果を変更する
- 実行メモを入力する
- Fail 時に不具合を作成する
- Blocked 時に理由を入力する
- Skipped 時に理由を入力する
- Retest へ戻す
- 担当者を変更する

状態遷移は以下とする。

```text
Not Started -> In Progress
In Progress -> Pass
In Progress -> Fail
In Progress -> Blocked
In Progress -> Skipped
Fail -> Retest
Retest -> Pass
Retest -> Fail
Blocked -> In Progress
Skipped -> In Progress
```

制約は以下である。

- Fail にする場合は実際結果の入力を必須とする
- Blocked にする場合はブロック理由を必須とする
- Skipped にする場合はスキップ理由を必須とする
- 必須項目が Not Started のままでは Ready にできない
- 必須項目が Fail のままでは Ready にできない
- 必須項目が Blocked のままでは Ready にできない

テスト観点は以下である。

- 結果変更後に Board の列が変わる
- Fail にすると Defect 作成導線が表示される
- Blocked 理由未入力では保存できない
- 実行結果が IndexedDB に保存される
- 画面再読み込み後も結果が保持される
- 進捗率が再計算される

### 8.8 Defect Triage

不具合の一覧、詳細、状態遷移を管理する画面。

この画面は、単なる不具合一覧ではなく、
リリース判定に影響する不具合をトリアージするための画面である。

表示項目は以下である。

- タイトル
- 重要度
- 優先度
- ステータス
- 関連リリース
- 関連テスト項目
- 担当者
- リリース判定への影響
- 最終更新日時

重要度は以下である。

- Critical
- High
- Medium
- Low

ステータスは以下である。

- Open
- Triaged
- In Progress
- Fixed
- Ready for Retest
- Reopened
- Closed
- Won't Fix
- Duplicate

主な操作は以下である。

- 不具合作成
- 不具合編集
- ステータス変更
- 担当者変更
- コメント追加
- 関連テスト項目を開く
- Duplicate 指定
- リリース判定への影響を設定

状態遷移は以下とする。

```text
Open -> Triaged
Triaged -> In Progress
In Progress -> Fixed
Fixed -> Ready for Retest
Ready for Retest -> Closed
Ready for Retest -> Reopened
Reopened -> In Progress
Open -> Won't Fix
Open -> Duplicate
Triaged -> Won't Fix
Triaged -> Duplicate
```

制約は以下である。

- Critical / High の Open 不具合がある場合、Ready にできない
- Duplicate にする場合は重複元不具合を必須とする
- Won't Fix にする場合は理由を必須とする
- Ready for Retest の不具合は Test Run Board に Retest を作る
- Closed にするには再テスト結果が Pass であることを推奨する

テスト観点は以下である。

- 不具合を作成できる
- 必須項目未入力では保存できない
- ステータス遷移が制約される
- Duplicate 理由未入力では保存できない
- Critical 不具合が Ready 判定を阻止する
- Fixed にすると Retest 導線が表示される

### 8.9 Risk Register

リリース判定に残るリスクを管理する画面。

不具合とは別に、リリース可否判断で明示的に確認すべき事項を扱う。

表示項目は以下である。

- リスク名
- リスク種別
- 影響度
- 発生可能性
- 対応方針
- 承認状態
- 承認者
- 承認コメント
- 関連不具合
- 関連テスト項目

リスク種別は以下である。

- Known Issue
- Schedule Risk
- Test Coverage Risk
- Environment Risk
- Operational Risk

承認状態は以下である。

- Draft
- Pending Approval
- Accepted
- Rejected

制約は以下である。

- High 以上のリスクは承認なしに Ready にできない
- Accepted にする場合は承認コメントを必須とする
- Rejected にする場合は差し戻し理由を必須とする
- リスクが Pending Approval の場合は At Risk とする

テスト観点は以下である。

- リスクを登録できる
- 承認コメントなしで Accepted にできない
- リスク承認後に Release Decision が更新される
- Rejected 後は Ready にならない

### 8.10 Release Decision

リリース可否を判定する画面。

本アプリケーションの中心機能である。

表示項目は以下である。

- Release Readiness
- 判定条件チェックリスト
- 未達条件一覧
- 未解決 Critical / High 不具合
- 未完了必須テスト
- 未承認リスク
- QA 完了コメント
- 判定コメント
- 判定履歴

判定は以下の 3 種類とする。

- Not Ready
- At Risk
- Ready

Ready 条件は以下である。

- 必須テストがすべて Pass または理由付き Skipped である
- Critical の Open / Triaged / In Progress 不具合がない
- High の Open / Triaged / In Progress 不具合がない
- Blocked の必須テストがない
- High 以上のリスクが Accepted である
- QA 完了コメントが入力されている
- Evidence が 1 件以上存在する

At Risk 条件は以下である。

- Medium 以下の未解決不具合がある
- High リスクが Accepted 済みで残っている
- Skipped された必須テストがあるが理由が入力されている
- リリース可能だが注意喚起が必要である

Not Ready 条件は以下である。

- 必須テストが未実施である
- 必須テストが Fail である
- 必須テストが Blocked である
- Critical / High の未解決不具合がある
- High 以上のリスクが未承認である
- QA 完了コメントが未入力である
- Evidence が存在しない

操作は以下である。

- 判定条件を確認する
- QA 完了コメントを入力する
- リリース判定を保存する
- 判定を差し戻す
- Evidence Pack を出力する

テスト観点は以下である。

- 条件未達時に Ready ボタンが disabled になる
- disabled 理由が表示される
- 条件達成後に Ready にできる
- At Risk 判定が保存できる
- 判定履歴が残る
- Evidence Pack の内容に判定結果が反映される

### 8.11 Evidence

QA 証跡を管理する画面。

Evidence は添付ファイルそのものではなく、MVP ではローカルメモ、URL、
実行ログ、テスト結果、判定履歴の構造化データとして扱う。

表示項目は以下である。

- Evidence タイトル
- 種別
- 関連リリース
- 関連テスト項目
- 関連不具合
- メモ
- 作成者
- 作成日時

Evidence 種別は以下である。

- Test Result
- Defect Note
- Risk Acceptance
- Release Decision
- Manual Note
- External Reference

操作は以下である。

- Evidence 作成
- Evidence 編集
- Evidence 削除
- Evidence Pack 出力

テスト観点は以下である。

- Evidence を登録できる
- Evidence なしでは Ready にできない
- Evidence Pack に Evidence が出力される
- 関連テスト項目から Evidence へ遷移できる

### 8.12 Reports

出力済みまたは生成可能なレポートを扱う画面。

MVP では、IndexedDB にレポート履歴を保存し、
Markdown または HTML を生成する。

出力形式は以下である。

- Markdown
- HTML
- JSON

MVP では Markdown を最優先とする。

出力内容は以下である。

- リリース概要
- QA スコープ
- テスト進捗
- Fail / Blocked / Skipped 一覧
- 未解決不具合
- リスク承認履歴
- 最終判定
- 判定コメント
- Evidence 一覧
- Activity Log

テスト観点は以下である。

- レポートを生成できる
- レポート内容が現在の DB 状態と一致する
- Ready / Not Ready / At Risk が反映される
- Markdown をコピーできる
- HTML プレビューを表示できる

### 8.13 Demo Mode

デモと AI テストの再現性を確保するための画面。

操作は以下である。

- シナリオ選択
- シードデータ再投入
- 空データ化
- 大量データ投入
- 現在状態の初期化

シナリオは以下を用意する。

- Healthy Release
- Blocked Release
- Risk Accepted Release
- Large Regression
- Empty Workspace
- Role Permission

テスト観点は以下である。

- シナリオを切り替えられる
- 切り替え後に dashboard の判定が変わる
- リセット後に同じデータ状態になる
- IndexedDB が初期化される

### 8.14 Data Settings

IndexedDB のデータ管理を行う画面。

操作は以下である。

- データリセット
- JSON エクスポート
- JSON インポート
- DB バージョン表示
- ストア件数表示

MVP では JSON インポートは Phase 2 としてもよい。

テスト観点は以下である。

- データリセットできる
- リセット前に確認ダイアログが表示される
- リセット後にログイン状態が想定どおりになる
- ストア件数が表示される

## 9. ロールと権限

### 9.1 ロール一覧

ロールは以下とする。

- Admin
- QA Lead
- QA Member
- Developer
- Viewer

### 9.2 権限マトリクス

```text
機能                         Admin  QA Lead  QA Member  Developer  Viewer
ログイン                     Yes    Yes      Yes        Yes        Yes
リリース作成                 Yes    Yes      No         No         No
リリース編集                 Yes    Yes      No         No         No
QA Scope 編集                Yes    Yes      No         No         No
テスト実行                   Yes    Yes      Yes        No         No
不具合作成                   Yes    Yes      Yes        Yes        No
不具合ステータス更新         Yes    Yes      No         Yes        No
リスク作成                   Yes    Yes      No         No         No
リスク承認                   Yes    Yes      No         No         No
リリース判定                 Yes    Yes      No         No         No
Evidence 作成                Yes    Yes      Yes        Yes        No
Evidence Pack 出力           Yes    Yes      Yes        Yes        Yes
Demo Mode 操作               Yes    Yes      No         No         No
Data Reset                   Yes    No       No         No         No
```

### 9.3 権限テスト方針

権限は UI 表示だけでなく、操作実行時にもチェックする。

- 操作不可の場合、ボタンは非表示または disabled とする
- disabled の場合は理由を表示する
- URL 直打ちで画面を開いても保存操作は拒否する
- 権限拒否は toast または inline message で表示する

## 10. データモデル

### 10.1 IndexedDB 名

```text
releaseQaCockpitDb
```

### 10.2 Store 一覧

```text
users
sessions
releases
releaseScopes
testItems
testExecutions
defects
risks
decisions
evidenceItems
activityLogs
demoScenarios
appSettings
```

### 10.3 TypeScript 型定義案

```ts
export type UserRole =
  | 'admin'
  | 'qaLead'
  | 'qaMember'
  | 'developer'
  | 'viewer';

export type ReleaseStatus =
  | 'draft'
  | 'planned'
  | 'inQa'
  | 'blocked'
  | 'readyForDecision'
  | 'approved'
  | 'released'
  | 'archived';

export type ReadinessStatus = 'notReady' | 'atRisk' | 'ready';

export type TestExecutionStatus =
  | 'notStarted'
  | 'inProgress'
  | 'pass'
  | 'fail'
  | 'blocked'
  | 'skipped'
  | 'retest';

export type DefectSeverity = 'critical' | 'high' | 'medium' | 'low';

export type DefectStatus =
  | 'open'
  | 'triaged'
  | 'inProgress'
  | 'fixed'
  | 'readyForRetest'
  | 'reopened'
  | 'closed'
  | 'wontFix'
  | 'duplicate';

export type RiskStatus =
  | 'draft'
  | 'pendingApproval'
  | 'accepted'
  | 'rejected';
```

### 10.4 User

```ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 10.5 Session

```ts
export interface Session {
  id: string;
  userId: string;
  createdAt: string;
  lastActiveAt: string;
}
```

### 10.6 Release

```ts
export interface Release {
  id: string;
  name: string;
  productName: string;
  version: string;
  description: string;
  status: ReleaseStatus;
  plannedReleaseDate: string;
  qaStartDate: string;
  qaEndDate: string;
  ownerUserId: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 10.7 ReleaseScope

```ts
export interface ReleaseScope {
  id: string;
  releaseId: string;
  name: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  isRequired: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}
```

### 10.8 TestItem

```ts
export interface TestItem {
  id: string;
  releaseId: string;
  scopeId: string;
  title: string;
  precondition: string;
  steps: string[];
  expectedResult: string;
  priority: 'high' | 'medium' | 'low';
  isRequired: boolean;
  assigneeUserId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

### 10.9 TestExecution

```ts
export interface TestExecution {
  id: string;
  releaseId: string;
  testItemId: string;
  status: TestExecutionStatus;
  actualResult?: string;
  note?: string;
  blockedReason?: string;
  skippedReason?: string;
  executedByUserId?: string;
  executedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 10.10 Defect

```ts
export interface Defect {
  id: string;
  releaseId: string;
  testItemId?: string;
  title: string;
  severity: DefectSeverity;
  priority: 'high' | 'medium' | 'low';
  status: DefectStatus;
  summary: string;
  reproductionSteps: string;
  expectedResult: string;
  actualResult: string;
  assigneeUserId?: string;
  impactsReleaseDecision: boolean;
  duplicateOfDefectId?: string;
  resolutionReason?: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}
```

### 10.11 Risk

```ts
export interface Risk {
  id: string;
  releaseId: string;
  title: string;
  type:
    | 'knownIssue'
    | 'scheduleRisk'
    | 'testCoverageRisk'
    | 'environmentRisk'
    | 'operationalRisk';
  impact: 'high' | 'medium' | 'low';
  probability: 'high' | 'medium' | 'low';
  mitigation: string;
  status: RiskStatus;
  approvalComment?: string;
  approvedByUserId?: string;
  approvedAt?: string;
  relatedDefectId?: string;
  relatedTestItemId?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 10.12 Decision

```ts
export interface Decision {
  id: string;
  releaseId: string;
  readiness: ReadinessStatus;
  qaCompletionComment: string;
  decisionComment: string;
  decidedByUserId: string;
  decidedAt: string;
  unmetConditionMessages: string[];
  createdAt: string;
}
```

### 10.13 EvidenceItem

```ts
export interface EvidenceItem {
  id: string;
  releaseId: string;
  type:
    | 'testResult'
    | 'defectNote'
    | 'riskAcceptance'
    | 'releaseDecision'
    | 'manualNote'
    | 'externalReference';
  title: string;
  body: string;
  relatedTestItemId?: string;
  relatedDefectId?: string;
  relatedRiskId?: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}
```

### 10.14 ActivityLog

```ts
export interface ActivityLog {
  id: string;
  releaseId?: string;
  entityType:
    | 'release'
    | 'scope'
    | 'testItem'
    | 'testExecution'
    | 'defect'
    | 'risk'
    | 'decision'
    | 'evidence'
    | 'settings';
  entityId?: string;
  action: string;
  message: string;
  actorUserId?: string;
  createdAt: string;
}
```

## 11. Dexie スキーマ案

```ts
import Dexie, { Table } from 'dexie';

export class ReleaseQaCockpitDb extends Dexie {
  users!: Table<User, string>;
  sessions!: Table<Session, string>;
  releases!: Table<Release, string>;
  releaseScopes!: Table<ReleaseScope, string>;
  testItems!: Table<TestItem, string>;
  testExecutions!: Table<TestExecution, string>;
  defects!: Table<Defect, string>;
  risks!: Table<Risk, string>;
  decisions!: Table<Decision, string>;
  evidenceItems!: Table<EvidenceItem, string>;
  activityLogs!: Table<ActivityLog, string>;
  demoScenarios!: Table<DemoScenario, string>;
  appSettings!: Table<AppSetting, string>;

  constructor() {
    super('releaseQaCockpitDb');

    this.version(1).stores({
      users: 'id, email, role, isActive',
      sessions: 'id, userId, lastActiveAt',
      releases: 'id, status, plannedReleaseDate, ownerUserId, archivedAt',
      releaseScopes: 'id, releaseId, category, priority, isRequired',
      testItems: 'id, releaseId, scopeId, priority, isRequired, assigneeUserId',
      testExecutions: 'id, releaseId, testItemId, status, executedByUserId',
      defects: 'id, releaseId, testItemId, severity, status, assigneeUserId',
      risks: 'id, releaseId, status, impact, probability',
      decisions: 'id, releaseId, readiness, decidedAt',
      evidenceItems: 'id, releaseId, type, createdByUserId',
      activityLogs: 'id, releaseId, entityType, entityId, createdAt',
      demoScenarios: 'id, name',
      appSettings: 'id',
    });
  }
}
```

## 12. 判定ロジック

### 12.1 判定関数

Release Readiness は、DB の状態から計算する。
UI の状態に依存させない。

```ts
export interface ReadinessResult {
  readiness: ReadinessStatus;
  unmetConditions: string[];
  warningConditions: string[];
  canMarkReady: boolean;
}
```

### 12.2 Not Ready 判定

以下のいずれかに該当する場合、Not Ready とする。

- 必須テストに Not Started がある
- 必須テストに In Progress がある
- 必須テストに Fail がある
- 必須テストに Blocked がある
- Critical の未解決不具合がある
- High の未解決不具合がある
- High impact の未承認リスクがある
- QA 完了コメントが未入力である
- Evidence が 1 件もない

### 12.3 At Risk 判定

Ready 条件は満たすが、以下の注意事項がある場合、At Risk とする。

- Medium の未解決不具合がある
- Low の未解決不具合がある
- Accepted 済みの High リスクがある
- 必須テストに理由付き Skipped がある
- QA 期間が予定より超過している

### 12.4 Ready 判定

以下をすべて満たす場合、Ready とする。

- 必須テストがすべて Pass または理由付き Skipped である
- Critical / High の未解決不具合がない
- Blocked の必須テストがない
- High impact 以上のリスクがすべて Accepted である
- QA 完了コメントが入力済みである
- Evidence が 1 件以上存在する

## 13. バリデーション

Zod を使用してフォーム入力を検証する。

### 13.1 Release

- name は必須
- productName は必須
- version は必須
- plannedReleaseDate は必須
- qaStartDate は必須
- qaEndDate は必須
- qaStartDate は qaEndDate より後にできない
- qaEndDate は plannedReleaseDate より後にできない

### 13.2 TestItem

- title は必須
- expectedResult は必須
- steps は 1 件以上必須
- required の場合は priority を high または medium にする

### 13.3 TestExecution

- fail の場合は actualResult 必須
- blocked の場合は blockedReason 必須
- skipped の場合は skippedReason 必須

### 13.4 Defect

- title は必須
- severity は必須
- reproductionSteps は必須
- expectedResult は必須
- actualResult は必須
- duplicate の場合は duplicateOfDefectId 必須
- wontFix の場合は resolutionReason 必須

### 13.5 Risk

- title は必須
- impact は必須
- probability は必須
- mitigation は必須
- accepted の場合は approvalComment 必須
- rejected の場合は approvalComment 必須

### 13.6 Decision

- qaCompletionComment は必須
- decisionComment は必須
- Ready 保存時は Ready 条件を満たす必要がある

## 14. UI / UX 方針

### 14.1 全体レイアウト

```text
Header
  - アプリ名
  - 現在のユーザー
  - ロール
  - ログアウト

Sidebar
  - Dashboard
  - Releases
  - Reports
  - Demo Mode
  - Data Settings

Main
  - 各画面の h1
  - 操作ボタン
  - 一覧、詳細、フォーム、ボード
```

### 14.2 画面設計方針

- 各画面に一意な h1 を置く
- 主要操作は button として実装する
- フォーム項目には必ず label を付与する
- disabled の理由を表示する
- 保存成功時は toast を表示する
- 保存失敗時は inline error と toast を表示する
- 空状態を用意する
- ローディング状態を用意する
- 破壊的操作には確認ダイアログを出す

### 14.3 AI エージェント向け UI 方針

- aria-label を丁寧に設定する
- getByRole で選択しやすい UI にする
- テーブル行には data-testid を補助的に付ける
- モーダルには role="dialog" を付ける
- トーストには role="status" を付ける
- エラーには role="alert" を付ける

## 15. data-testid 方針

Playwright Test では、基本的に以下を優先する。

1. getByRole
2. getByLabel
3. getByText
4. getByTestId

`data-testid` は、複雑な表、ボード、行、カード、状態確認の補助に使う。

### 15.1 命名規則

```text
{feature}-{element}-{purpose}
```

例は以下である。

```text
release-create-button
release-save-button
release-status-select
test-run-board
test-run-card-{id}
test-run-status-select
defect-create-button
defect-severity-select
risk-accept-button
decision-ready-button
evidence-export-markdown-button
demo-scenario-select
data-reset-button
```

### 15.2 避ける命名

以下は避ける。

```text
button1
modal
card
item
container
```

## 16. Demo Mode シナリオ

### 16.1 Healthy Release

リリース判定が Ready になるシナリオ。

状態は以下である。

- 必須テストはすべて Pass
- Critical / High 不具合なし
- High リスクなし
- QA 完了コメントあり
- Evidence あり

用途は以下である。

- 正常系デモ
- Evidence Pack 出力デモ
- Ready 判定テスト

### 16.2 Blocked Release

リリース判定が Not Ready になるシナリオ。

状態は以下である。

- 必須テストに Fail がある
- Critical 不具合が Open
- Blocked テストがある
- QA 完了コメントなし

用途は以下である。

- Not Ready 判定デモ
- 不具合修正から Ready までのデモ
- AI エージェントの探索対象

### 16.3 Risk Accepted Release

リリース判定が At Risk になるシナリオ。

状態は以下である。

- 必須テストは Pass
- Critical / High 不具合なし
- High リスクは Accepted
- Medium 不具合が残っている
- Evidence あり

用途は以下である。

- リスク承認デモ
- At Risk 判定テスト
- デシジョンテーブル検証

### 16.4 Large Regression

検索、フィルタ、ページングを確認するシナリオ。

状態は以下である。

- テスト項目 150 件以上
- 不具合 30 件以上
- リスク 10 件以上
- 複数担当者
- 複数ステータス

用途は以下である。

- 一覧 UI デモ
- 検索テスト
- ページングテスト
- パフォーマンス確認

### 16.5 Empty Workspace

初回利用状態を確認するシナリオ。

状態は以下である。

- リリースなし
- テスト項目なし
- 不具合なし
- リスクなし

用途は以下である。

- 空状態デモ
- 初回導線確認
- アプリ説明確認

### 16.6 Role Permission

権限差分を確認するシナリオ。

状態は以下である。

- 複数ユーザー
- 編集可能データあり
- 承認待ちリスクあり
- 判定可能リリースあり

用途は以下である。

- ロール別操作可否確認
- disabled 理由確認
- 権限テスト

## 17. 開発デモシナリオ

開発デモでは、以下の流れを推奨する。

```text
1. Demo Mode で Blocked Release を読み込む
2. Dashboard で Not Ready の理由を確認する
3. Test Run Board で Fail のテスト項目を開く
4. 関連 Defect を確認する
5. Defect を Fixed に変更する
6. Retest を Pass に変更する
7. Risk Register で残リスクを Accepted にする
8. Release Decision に戻る
9. 判定が Ready または At Risk に変わることを確認する
10. Evidence Pack を Markdown で出力する
```

このデモで示せる価値は以下である。

- IndexedDB によるローカル永続化
- テスト結果と不具合の連動
- リスク承認とリリース判定の連動
- 状態遷移の制約
- 証跡レポート出力
- AI エージェントに触らせる価値

## 18. AI テスト対象としての要件

### 18.1 サービス探索に向く要件

- 複数の明確な機能領域を持つ
- 各画面に意味のある h1 がある
- Dashboard から主要画面へ遷移できる
- Demo Mode により状態を切り替えられる
- 主要導線に説明文がある

### 18.2 テスト計画に向く要件

- 権限差分がある
- 状態遷移がある
- バリデーションがある
- 判定条件がある
- 一覧、詳細、フォーム、ボードがある
- 保存後の永続化確認ができる

### 18.3 テスト設計に向く要件

以下のテスト技法を適用できるようにする。

- 同値分割
- 境界値分析
- デシジョンテーブル
- 状態遷移テスト
- 組み合わせテスト
- CRUD テスト
- 探索的テスト
- 回帰テスト

### 18.4 Playwright Test 生成に向く要件

- 主要操作が role と label で選択できる
- 不安定なアニメーションを避ける
- 保存結果を画面上で確認できる
- IndexedDB を初期化する UI を持つ
- 各シナリオの初期状態が再現可能である
- トーストと inline message の両方で結果を確認できる

## 19. 代表テスト観点

### 19.1 Release Decision

- Ready 条件を満たさない場合、Ready にできない
- Ready 条件を満たす場合、Ready にできる
- High リスクが Accepted の場合、At Risk になる
- Evidence がない場合、Ready にできない
- QA 完了コメントがない場合、Ready にできない

### 19.2 Test Run Board

- Not Started から In Progress に変更できる
- In Progress から Pass に変更できる
- Fail の場合、actualResult が必須になる
- Blocked の場合、blockedReason が必須になる
- Skipped の場合、skippedReason が必須になる
- Fail から Defect を作成できる

### 19.3 Defect Triage

- Critical Open 不具合がある場合、Ready にできない
- High Open 不具合がある場合、Ready にできない
- Duplicate の場合、重複元が必須になる
- Won't Fix の場合、理由が必須になる
- Fixed から Ready for Retest に変更できる

### 19.4 Risk Register

- High impact リスクは承認なしに Ready にできない
- Accepted には承認コメントが必要である
- Rejected には差し戻し理由が必要である
- Accepted リスクは Evidence Pack に出力される

### 19.5 Demo Mode

- シナリオ切り替え後に Dashboard の判定が変わる
- Data Reset 後に同じ状態へ戻る
- Empty Workspace では空状態が表示される
- Role Permission ではロール別に操作可否が変わる

## 20. 実装フェーズ

### 20.1 Phase 0: 土台作成

- Vite + React + TypeScript を作成する
- ルーティングを作成する
- 共通レイアウトを作成する
- Dexie DB を作成する
- Demo Seed を投入できるようにする

完了条件は以下である。

- `npm run dev` で起動できる
- `/login` と `/dashboard` にアクセスできる
- IndexedDB に初期データが保存される

### 20.2 Phase 1: MVP 実装

- ローカルログイン
- Dashboard / QA Cockpit
- Releases
- Release Overview
- QA Scope
- Test Run Board
- Defect Triage
- Risk Register
- Release Decision
- Evidence
- Demo Mode
- Data Reset

完了条件は以下である。

- Blocked Release シナリオを操作して Ready または At Risk にできる
- Evidence Pack を Markdown で出力できる
- データリセットで同じ状態に戻せる

### 20.3 Phase 2: デモ強化

- Reports 画面を強化する
- HTML プレビューを追加する
- Large Regression シナリオを追加する
- 検索、フィルタ、ページングを強化する
- JSON エクスポートを追加する
- JSON インポートを追加する

完了条件は以下である。

- 大量データでも主要画面を操作できる
- レポートの再生成ができる
- バックアップと復元ができる

### 20.4 Phase 3: AI テスト検証

- target-project-profile を作成する
- app-spec を作成する
- seed-data ドキュメントを作成する
- smoke spec を追加する
- AI エージェントにサービス探索させる
- 機能単位のテスト計画を作成させる
- Playwright Test 生成を検証する

完了条件は以下である。

- AI エージェントが主要機能を識別できる
- Release Decision のテスト計画が作成できる
- Test Run Board の E2E テストが生成できる
- 生成テストが安定して実行できる

## 21. README に記載すべき内容

`examples/release-qa-cockpit/README.md` には以下を記載する。

- アプリ概要
- 起動方法
- 技術構成
- デモユーザー
- Demo Mode の使い方
- IndexedDB の扱い
- データリセット方法
- 推奨デモシナリオ
- AI エージェント向けの使い方
- Playwright Test 実行方法

## 22. target-project-profile に記載すべき内容

`examples/release-qa-cockpit/docs/target-project-profile.md` には以下を記載する。

```text
Application name: Release QA Cockpit
Target path: examples/release-qa-cockpit
Base URL: http://localhost:5173
Install command: npm install
Start command: npm run dev
Test command: npm run test:e2e
Data storage: IndexedDB only
External services: None
Reset method: Settings > Data > Reset seed data
Demo scenarios: Settings > Demo Mode
Primary test target: Release Decision, Test Run Board, Defect Triage
Generated test path: examples/release-qa-cockpit/tests/
```

認証情報は実秘密情報として扱わない。
デモユーザーは README に明記し、プロファイルには詳細な秘密情報を置かない。

## 23. 受け入れ基準

MVP の受け入れ基準は以下である。

- アプリが `npm run dev` で起動する
- データが IndexedDB に保存される
- Demo Mode でシナリオを切り替えられる
- Dashboard に Release Readiness が表示される
- Test Run Board で結果を変更できる
- Fail から Defect を作成できる
- Defect と Risk が Release Decision に反映される
- Ready 条件を満たすまで Ready にできない
- Evidence Pack を Markdown で出力できる
- Data Reset で初期状態へ戻せる
- 主要操作が Playwright で安定して選択できる

## 24. リスクと対策

### 24.1 機能過多になるリスク

対策は以下である。

- 初期実装は Release Decision を中心にする
- 顧客管理や通知は入れない
- CSV 連携は Phase 2 に回す

### 24.2 テスト対象として不自然になるリスク

対策は以下である。

- UI 操作を難しくするためだけの機能を入れない
- 業務上意味のある制約だけを入れる
- デモシナリオを実務に近い流れにする

### 24.3 IndexedDB 操作が複雑化するリスク

対策は以下である。

- Dexie に DB 操作を集約する
- Repository 関数を作る
- UI コンポーネントから直接 Dexie を触りすぎない
- seed 処理を明確に分離する

### 24.4 AI エージェントが画面を理解しにくいリスク

対策は以下である。

- h1、label、aria-label を整備する
- ナビゲーション名を機能名と一致させる
- 主要画面に説明文を置く
- Demo Mode で状態を明示する

## 25. 最終方針

本アプリケーションは、単なる QA 管理ツールではなく、
リリース前 QA の判定と証跡出力に特化したローカル SaaS として設計する。

最重要機能は以下である。

1. Release Readiness 判定
2. Test Run Board
3. Defect Triage
4. Risk Register
5. Release Decision
6. Evidence Pack Export
7. Demo Mode / Seed Reset

この方針により、以下を同時に満たす。

- 単体アプリとして価値がある
- 開発デモで説明しやすい
- IndexedDB を使う意味がある
- AI エージェントのテスト対象として十分に複雑である
- Playwright Test 生成の検証対象として現実的である
