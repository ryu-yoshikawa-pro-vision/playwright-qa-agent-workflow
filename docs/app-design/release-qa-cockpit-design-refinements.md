# Release QA Cockpit 設計レビュー反映事項

## 1. 目的

本ドキュメントは、`docs/app-design/release-qa-cockpit.md` のレビュー結果を踏まえ、実装前に固定すべき判定ルール、状態定義、MVP 分割、権限、データモデル上の補足を整理する。

`release-qa-cockpit.md` と本ドキュメントの記述が競合する場合、実装時は本ドキュメントの内容を優先する。

## 2. 反映方針

レビューで確認した主な課題は以下である。

- Release Readiness の判定優先順位が未定義である
- High リスクが Accepted の場合に Ready なのか At Risk なのかが曖昧である
- Critical / High 不具合の「未解決」定義が揺れている
- Pending Approval リスクの扱いが画面説明と判定ロジックで揺れている
- Evidence 1 件以上という条件だけでは Ready 条件として弱い
- Reports の履歴保存と Store 一覧が一致していない
- Demo Mode がデータ破壊操作を含む一方で、権限マトリクス上は QA Lead でも操作可能になっている
- Defect Triage のコメント追加に対して comments store が定義されていない
- MVP が大きく、最初の実装 PR が肥大化しやすい

本ドキュメントでは、これらを実装可能なルールとして明確化する。

## 3. Release Readiness 判定優先順位

Release Readiness は、DB の状態から純粋関数として算出する。
UI の表示状態や現在開いている画面には依存させない。

判定優先順位は以下とする。

```text
1. Not Ready 条件に 1 つでも該当する場合は Not Ready
2. Not Ready 条件に該当せず、Warning 条件に 1 つでも該当する場合は At Risk
3. Not Ready 条件にも Warning 条件にも該当しない場合は Ready
```

この優先順位により、High リスクが Accepted 済みで残っている場合は Ready ではなく At Risk とする。

## 4. ReadinessResult の最終形

実装時の戻り値は以下を基本とする。

```ts
export interface ReadinessResult {
  readiness: ReadinessStatus;
  unmetConditions: string[];
  warningConditions: string[];
  canMarkReady: boolean;
  canMarkAtRisk: boolean;
}
```

### 4.1 canMarkReady

`canMarkReady` は以下の場合のみ true とする。

- `readiness` が `ready` である
- `unmetConditions` が空である
- `warningConditions` が空である

### 4.2 canMarkAtRisk

`canMarkAtRisk` は以下の場合のみ true とする。

- `readiness` が `atRisk` である
- `unmetConditions` が空である
- `warningConditions` が 1 件以上存在する

## 5. 未解決不具合の定義

Release Decision に影響する「未解決不具合」は、単なる Open のみではなく、再テスト未完了の状態も含める。

実装時は以下を blocking status とする。

```ts
export const unresolvedBlockingDefectStatuses: DefectStatus[] = [
  'open',
  'triaged',
  'inProgress',
  'fixed',
  'readyForRetest',
  'reopened',
];
```

`fixed` は、修正された可能性はあるが QA の再テスト完了前であるため、Release Decision 上は未解決として扱う。

`closed`、`wontFix`、`duplicate` は blocking status には含めない。
ただし、`wontFix` は対応しない判断そのものがリスクになり得るため、必要に応じて Risk として登録する。

## 6. 不具合重要度ごとの判定影響

### 6.1 Critical / High

Critical または High の不具合が blocking status の場合、Readiness は Not Ready とする。

```text
Critical / High + blocking status => Not Ready
```

### 6.2 Medium / Low

Medium または Low の不具合が blocking status の場合、Readiness は At Risk とする。

```text
Medium / Low + blocking status => At Risk
```

ただし、Medium / Low であっても `impactsReleaseDecision` が true の場合は Not Ready とする。

```text
Medium / Low + impactsReleaseDecision = true + blocking status => Not Ready
```

## 7. リスク状態ごとの判定影響

リスクは `impact` と `status` の組み合わせで判定する。

### 7.1 High impact risk

```text
High impact + Draft           => Not Ready
High impact + PendingApproval => Not Ready
High impact + Rejected        => Not Ready
High impact + Accepted        => At Risk
```

High impact のリスクは、承認されるまではリリース不可とする。
承認済みであっても残リスクとして扱うため、Ready ではなく At Risk とする。

### 7.2 Medium impact risk

```text
Medium impact + Draft           => At Risk
Medium impact + PendingApproval => At Risk
Medium impact + Rejected        => Not Ready
Medium impact + Accepted        => At Risk
```

Medium impact のリスクは原則 At Risk とする。
Rejected の場合は未解決の判断事項が残るため Not Ready とする。

### 7.3 Low impact risk

```text
Low impact + Draft           => Ready または At Risk
Low impact + PendingApproval => At Risk
Low impact + Rejected        => At Risk
Low impact + Accepted        => Ready または At Risk
```

Low impact は原則 Ready を阻止しない。
ただし、リスク一覧に残っている場合は warningConditions に含め、画面上で注意喚起してよい。

## 8. Ready / At Risk / Not Ready 条件の最終定義

### 8.1 Not Ready 条件

以下のいずれかに該当する場合、Readiness は Not Ready とする。

- 必須テストに `notStarted` がある
- 必須テストに `inProgress` がある
- 必須テストに `fail` がある
- 必須テストに `blocked` がある
- Critical / High の blocking defect がある
- Medium / Low でも `impactsReleaseDecision` が true の blocking defect がある
- High impact のリスクが `draft`、`pendingApproval`、`rejected` のいずれかである
- Medium impact のリスクが `rejected` である
- QA 完了コメントが未入力である
- Evidence Pack の生成に必要な最低証跡が不足している

### 8.2 At Risk 条件

Not Ready 条件に該当しないが、以下のいずれかに該当する場合、Readiness は At Risk とする。

- Medium / Low の blocking defect がある
- High impact の Accepted リスクがある
- Medium impact の Draft / PendingApproval / Accepted リスクがある
- Low impact の PendingApproval / Rejected リスクがある
- 必須テストに理由付き `skipped` がある
- QA 期間が予定より超過している
- `wontFix` 不具合に対応する Risk が Accepted として残っている

### 8.3 Ready 条件

以下をすべて満たす場合のみ、Readiness は Ready とする。

- Not Ready 条件に該当しない
- At Risk 条件に該当しない
- 必須テストがすべて `pass` である
- Critical / High の blocking defect がない
- Release Decision に必要な QA 完了コメントが入力済みである
- Evidence Pack の生成に必要な最低証跡が存在する

## 9. Evidence 条件の明確化

`Evidence が 1 件以上存在する` だけでは Ready 条件として弱いため、MVP では以下を最低条件とする。

```text
Evidence Pack の生成に必要な最低証跡:
- Test Result evidence が 1 件以上存在する
- Release Decision evidence または decision record が存在する
```

ただし、Release Decision evidence は判定保存時に自動生成してよい。
そのため、Ready 判定前の画面では以下のように扱う。

```text
判定保存前:
- Test Result evidence が 1 件以上存在すること
- QA 完了コメントが入力されていること

判定保存後:
- Release Decision evidence を自動生成する
- Evidence Pack には判定履歴と判定コメントを含める
```

Manual Note や External Reference のみでは Ready 条件を満たしたとは扱わない。

## 10. Reports の履歴保存方針

MVP では、Reports の履歴保存用 Store は追加しない。

MVP の Reports は、現在の IndexedDB 状態から Markdown を都度生成する機能とする。
生成したレポートの履歴保存は Phase 2 以降に回す。

Phase 2 で履歴保存を追加する場合は、以下の Store を追加する。

```text
reportExports
```

`reportExports` の TypeScript 型案は以下である。

```ts
export interface ReportExport {
  id: string;
  releaseId: string;
  format: 'markdown' | 'html' | 'json';
  title: string;
  content: string;
  generatedByUserId: string;
  generatedAt: string;
}
```

## 11. Defect コメント機能の扱い

MVP では、Defect のコメント専用 Store は追加しない。

Defect Triage の「コメント追加」は、MVP では以下のいずれかで代替する。

- ActivityLog に状態変更理由を記録する
- EvidenceItem の `defectNote` として記録する

本格的なスレッドコメントは Phase 2 以降とする。
Phase 2 で追加する場合は、以下の Store を追加する。

```text
comments
```

## 12. Demo Mode と Data Reset の権限

Demo Mode はシナリオ切替や現在状態の初期化を含むため、実質的にデータ破壊操作である。

MVP では、以下の権限に修正する。

```text
機能                         Admin  QA Lead  QA Member  Developer  Viewer
Demo Mode 閲覧               Yes    Yes      No         No         No
Demo Scenario Preview        Yes    Yes      No         No         No
Demo Scenario Apply          Yes    No       No         No         No
Data Reset                   Yes    No       No         No         No
```

QA Lead は Demo Mode の説明やシナリオ内容を確認できるが、実際に DB を初期化・再投入する操作は Admin のみとする。

開発デモで QA Lead に操作させたい場合は、デモユーザー自体を Admin として用意する。

## 13. MVP 実装フェーズの再分割

既存設計の MVP は機能範囲としては妥当だが、実装 PR としては大きい。
そのため、実装時は以下に分割する。

### 13.1 MVP-1: 土台と判定表示

- Vite / React / TypeScript
- React Router
- Dexie DB
- ローカルログイン
- Demo Seed
- Demo Mode の閲覧
- Admin による Seed Reset
- Dashboard / QA Cockpit
- Release Decision の読み取り専用表示

完了条件は以下である。

- `npm run dev` で起動できる
- ローカルユーザーでログインできる
- IndexedDB に seed data が入る
- Dashboard に Not Ready / At Risk / Ready が表示される
- Admin が seed reset できる

### 13.2 MVP-2: QA 実行と判定再計算

- QA Scope
- Test Run Board
- TestExecution の状態変更
- Fail / Blocked / Skipped の理由バリデーション
- Defect Triage
- Risk Register
- Readiness 再計算

完了条件は以下である。

- Test Run Board の操作が Release Decision に反映される
- Critical / High 不具合が Ready を阻止する
- High impact risk の状態が Ready / At Risk / Not Ready に反映される

### 13.3 MVP-3: 証跡とエクスポート

- Evidence
- Test Result evidence
- Release Decision 保存
- Release Decision evidence 自動生成
- Markdown Evidence Pack Export
- 主要操作の Playwright smoke spec

完了条件は以下である。

- Ready / At Risk / Not Ready の判定履歴を保存できる
- Evidence Pack を Markdown で生成できる
- Data Reset 後に同じ状態へ戻せる
- smoke spec が安定して通る

## 14. 実装時の優先テスト観点

実装後は、まず以下を Playwright smoke spec として固定する。

```text
1. Admin としてログインする
2. Demo Mode で Blocked Release を投入する
3. Dashboard が Not Ready を表示する
4. Critical defect が Ready を阻止している理由を確認する
5. Defect を Closed にする
6. 対応する TestExecution を Retest から Pass にする
7. High impact risk を Accepted にする
8. Dashboard が At Risk を表示する
9. Evidence Pack を Markdown で生成する
10. Data Reset 後に Dashboard が Not Ready に戻る
```

この smoke spec は、単なる画面表示確認ではなく、アプリの中核価値である以下を確認する。

- IndexedDB 永続化
- Demo Mode / Seed Reset
- Test Run Board と Defect Triage の連動
- Risk Register と Release Decision の連動
- Evidence Pack Export
- Playwright で安定して操作できる UI

## 15. 既存設計書への反映が必要な箇所

既存設計書を直接編集する場合は、以下の章に本ドキュメントの内容を反映する。

- `8.8 Defect Triage`
  - Open のみではなく blocking status の定義を追記する
  - コメント追加は MVP では ActivityLog / Evidence で代替する旨を追記する
- `8.9 Risk Register`
  - High / Medium / Low impact risk の判定影響を追記する
  - Pending Approval の扱いを impact 別に分ける
- `8.10 Release Decision`
  - 判定優先順位を追記する
  - Ready / At Risk / Not Ready 条件を本ドキュメントの定義に置き換える
- `8.11 Evidence`
  - Manual Note だけでは Ready 条件を満たさないことを追記する
- `8.12 Reports`
  - MVP では履歴保存せず都度生成とする
- `8.13 Demo Mode`
  - Apply 操作は Admin のみに制限する
- `9.2 権限マトリクス`
  - Demo Mode 閲覧、Preview、Apply を分ける
- `20. 実装フェーズ`
  - MVP を MVP-1 / MVP-2 / MVP-3 に分割する

## 16. 最終判断

このレビュー反映により、`Release QA Cockpit` は以下の点で実装可能性が上がる。

- Readiness 判定の優先順位が一意になる
- 不具合とリスクの状態が Release Decision にどう影響するか明確になる
- Evidence Pack の Ready 条件が実務上自然になる
- Demo Mode と Data Reset の権限が安全になる
- MVP が PR 単位で実装しやすくなる
- AI エージェントに作らせるテスト計画・テスト設計が安定する
