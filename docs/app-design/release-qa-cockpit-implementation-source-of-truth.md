# Release QA Cockpit 実装正本

このファイルは、`Release QA Cockpit` 実装時の誤読を防ぐための正本である。

実装時に他ドキュメントと競合する場合は、このファイルを優先する。

## 配置

実装先は `demo-apps/release-qa-cockpit/` とする。

`examples/release-qa-cockpit/` は古い配置案であり、実装先、生成テストパス、Target Project Profile のいずれにも使用しない。

## Readiness 判定

判定優先順位は以下とする。

```text
1. Not Ready 条件に該当する場合は Not Ready
2. Not Ready 条件に該当せず Warning 条件がある場合は At Risk
3. Not Ready 条件にも Warning 条件にも該当しない場合は Ready
```

### Not Ready

- 必須テストに `notStarted`、`inProgress`、`fail`、`blocked` がある
- Critical / High の blocking defect がある
- Medium / Low でも `impactsReleaseDecision` が true の blocking defect がある
- High impact risk が `draft`、`pendingApproval`、`rejected` のいずれかである
- Medium impact risk が `rejected` である
- QA 完了コメントが未入力である
- Test Result evidence が 1 件もない

### At Risk

- Medium / Low の blocking defect がある
- High impact risk が `accepted` である
- Medium impact risk が `draft`、`pendingApproval`、`accepted` のいずれかである
- Low impact risk が `pendingApproval` または `rejected` である
- 必須テストに理由付き `skipped` がある
- QA 期間が予定より超過している
- `wontFix` 不具合に対応する Risk が `accepted` として残っている

### Ready

- Not Ready 条件に該当しない
- At Risk 条件に該当しない
- 必須テストがすべて `pass` である
- Critical / High の blocking defect がない
- QA 完了コメントが入力済みである
- Test Result evidence が 1 件以上存在する

理由付き `skipped` は Ready ではなく At Risk とする。

High impact risk の `accepted` は Ready ではなく At Risk とする。

## blocking defect status

```ts
export const unresolvedBlockingDefectStatuses = [
  'open',
  'triaged',
  'inProgress',
  'fixed',
  'readyForRetest',
  'reopened',
] as const;
```

`closed`、`wontFix`、`duplicate` は blocking status に含めない。

## Evidence 条件

Readiness 計算時に必要な Evidence 条件は以下とする。

- Test Result evidence が 1 件以上存在する
- QA 完了コメントが入力されている

Manual Note / External Reference のみでは条件を満たさない。

Release Decision evidence は判定保存時に自動生成するため、Readiness 計算時には必須にしない。

## Reports

MVP の Reports は Release 単位の Evidence Pack Export を閲覧・生成する導線に限定する。

MVP では以下の Store を作成しない。

```text
reportExports
reports
reportHistory
```

Evidence Pack は現在の IndexedDB 状態から Markdown として都度生成する。

## Store

MVP の IndexedDB Store は以下とする。

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

`comments`、`reportExports`、`reports`、`reportHistory` store は MVP では作成しない。
