# Release QA Cockpit 最終実装ルール

## 1. 目的

本ドキュメントは、`Release QA Cockpit` の設計レビューで最後に残った曖昧さを解消し、実装時に優先する最終ルールを固定するための補足である。

以下のドキュメント間で記述が競合する場合、実装時の優先順位は次の通りとする。

```text
1. docs/app-design/release-qa-cockpit-final-implementation-rules.md
2. docs/app-design/release-qa-cockpit-design-refinements.md
3. docs/app-design/release-qa-cockpit.md
```

本ドキュメントでは、以下を最終確定する。

- Low impact risk の Ready / At Risk 判定
- Evidence 条件の判定前後の扱い
- Playwright smoke spec の状態遷移
- QA 完了コメントと Evidence 作成を含むデモ・テスト導線

## 2. Low impact risk の最終扱い

`Low impact risk` は、Release Readiness を原則として阻止しない。
ただし、承認待ちまたは却下済みの状態で残っている場合は、リリース判定時に注意喚起が必要であるため `At Risk` とする。

実装時は以下の表を最終ルールとする。

```text
Low impact + Draft           => Ready
Low impact + PendingApproval => At Risk
Low impact + Rejected        => At Risk
Low impact + Accepted        => Ready
```

### 2.1 判定理由

- `Draft` は未承認ではあるが、Low impact のため Readiness を阻止しない
- `PendingApproval` は判断待ちの状態が残っているため Warning とする
- `Rejected` は合意されていない判断事項が残っているため Warning とする
- `Accepted` は低影響リスクとして受容済みのため Ready を阻止しない

### 2.2 実装上の扱い

`Low impact + PendingApproval` と `Low impact + Rejected` は `warningConditions` に追加する。
`Low impact + Draft` と `Low impact + Accepted` は `unmetConditions` にも `warningConditions` にも追加しない。

```ts
const lowImpactRiskRules = {
  draft: 'ready',
  pendingApproval: 'atRisk',
  rejected: 'atRisk',
  accepted: 'ready',
} as const;
```

これにより、`ReadinessResult` は DB 状態から一意に算出できる。

## 3. Evidence 条件の最終扱い

Evidence 条件は、以下の 3 段階に分けて扱う。

```text
1. Readiness 計算時
2. Release Decision 保存時
3. Evidence Pack 生成時
```

### 3.1 Readiness 計算時

Readiness 計算時点では、`decision record` や `Release Decision evidence` の存在を必須にしない。

理由は、`decision record` と `Release Decision evidence` は Release Decision 保存時に作成されるためである。
Readiness 計算時にこれらを必須にすると、判定前に判定後のデータを要求する循環が発生する。

Readiness 計算時の最低条件は以下とする。

```text
Readiness 計算時の最低 Evidence 条件:
- Test Result evidence が 1 件以上存在する
- QA 完了コメントが入力されている
```

`Manual Note` や `External Reference` のみでは、Readiness 計算時の Evidence 条件を満たさない。

### 3.2 Release Decision 保存時

Release Decision を保存するタイミングで、以下を作成する。

```text
Release Decision 保存時:
- decision record を作成する
- Release Decision evidence を自動生成する
- ActivityLog に判定保存イベントを記録する
```

Release Decision evidence には、最低限以下を含める。

- readiness
- QA 完了コメント
- 判定コメント
- unmetConditions
- warningConditions
- 判定者
- 判定日時

### 3.3 Evidence Pack 生成時

Evidence Pack 生成時は、現在の IndexedDB 状態から Markdown を都度生成する。
MVP では生成履歴を保存しない。

Evidence Pack には、最低限以下を含める。

```text
Evidence Pack 生成時に含めるもの:
- Release 概要
- Test Result evidence
- decision record
- Release Decision evidence
- Defect summary
- Risk summary
- ActivityLog
```

### 3.4 Ready / At Risk 保存可否

Ready または At Risk として Release Decision を保存するには、以下を満たす必要がある。

```text
- unmetConditions が空である
- QA 完了コメントが入力されている
- Test Result evidence が 1 件以上存在する
```

Ready の場合は、さらに `warningConditions` が空である必要がある。
At Risk の場合は、`warningConditions` が 1 件以上存在する必要がある。

## 4. Readiness 判定条件の最終整理

### 4.1 Not Ready 条件

以下のいずれかに該当する場合、Readiness は `Not Ready` とする。

- 必須テストに `notStarted` がある
- 必須テストに `inProgress` がある
- 必須テストに `fail` がある
- 必須テストに `blocked` がある
- Critical / High の blocking defect がある
- Medium / Low でも `impactsReleaseDecision` が true の blocking defect がある
- High impact risk が `draft`、`pendingApproval`、`rejected` のいずれかである
- Medium impact risk が `rejected` である
- QA 完了コメントが未入力である
- Test Result evidence が 1 件もない

### 4.2 At Risk 条件

Not Ready 条件に該当しないが、以下のいずれかに該当する場合、Readiness は `At Risk` とする。

- Medium / Low の blocking defect がある
- High impact risk が `accepted` である
- Medium impact risk が `draft`、`pendingApproval`、`accepted` のいずれかである
- Low impact risk が `pendingApproval` または `rejected` である
- 必須テストに理由付き `skipped` がある
- QA 期間が予定より超過している
- `wontFix` 不具合に対応する Risk が `accepted` として残っている

### 4.3 Ready 条件

以下をすべて満たす場合のみ、Readiness は `Ready` とする。

- Not Ready 条件に該当しない
- At Risk 条件に該当しない
- 必須テストがすべて `pass` である
- Critical / High の blocking defect がない
- QA 完了コメントが入力済みである
- Test Result evidence が 1 件以上存在する

## 5. Playwright smoke spec の最終流れ

Smoke spec は、状態遷移ルールと Evidence 条件に合わせて以下の流れを最終形とする。

```text
1. Admin としてログインする
2. Demo Mode で Blocked Release を投入する
3. Dashboard が Not Ready を表示する
4. Critical defect が Ready を阻止している理由を確認する
5. Defect を In Progress に変更する
6. Defect を Fixed に変更する
7. Defect を Ready for Retest に変更する
8. 対応する TestExecution を Retest に変更する
9. 対応する TestExecution を Pass に変更する
10. Defect を Closed に変更する
11. High impact risk を Accepted にする
12. QA 完了コメントを入力する
13. Test Result evidence が存在することを確認する。存在しない場合は作成する
14. Dashboard または Release Decision が At Risk を表示する
15. Release Decision を At Risk として保存する
16. Release Decision evidence が自動生成されることを確認する
17. Evidence Pack を Markdown で生成する
18. Data Reset を実行する
19. Dashboard が Not Ready に戻る
```

この smoke spec では、以下を確認する。

- Admin ログイン
- Demo Mode / Seed Reset
- IndexedDB 永続化
- Defect の状態遷移
- TestExecution の状態遷移
- Risk Register と Release Decision の連動
- QA 完了コメントの必須制御
- Test Result evidence の必須制御
- Release Decision evidence の自動生成
- Evidence Pack Export
- Data Reset 後の再現性

## 6. Defect 状態遷移の補足

Smoke spec では、Defect を直接 `Closed` にしない。
必ず以下の順で進める。

```text
Open -> Triaged -> In Progress -> Fixed -> Ready for Retest -> Closed
```

ただし、MVP の UI では `Triaged` を省略してもよい。
その場合でも、最低限以下の流れは維持する。

```text
Open -> In Progress -> Fixed -> Ready for Retest -> Closed
```

`Closed` にする前に、関連する TestExecution が `pass` であることを確認する。

## 7. TestExecution 状態遷移の補足

Defect が `Ready for Retest` になった場合、関連する TestExecution は `retest` に変更できる。

Retest の完了後、以下のどちらかに遷移する。

```text
Retest -> Pass
Retest -> Fail
```

`Retest -> Pass` の場合、関連 Defect を `Closed` にできる。
`Retest -> Fail` の場合、関連 Defect は `Reopened` に戻す。

## 8. 実装時の優先事項

実装時は、まず以下を優先する。

```text
1. Readiness の純粋関数化
2. unmetConditions / warningConditions の表示
3. Low impact risk の一意な判定
4. Evidence 条件の循環排除
5. Defect / TestExecution の状態遷移制約
6. smoke spec の固定
```

UI の見た目や細かなフォーム項目よりも、まず Release Decision の判定一貫性を優先する。

## 9. 最終判断

この最終ルールにより、以下が明確になる。

- Low impact risk の扱いが一意になる
- Evidence 条件が判定前・保存時・出力時で分離される
- Ready / At Risk / Not Ready の条件が実装可能になる
- smoke spec が状態遷移ルールと矛盾しなくなる
- QA 完了コメントと Test Result evidence がデモ・テスト導線に含まれる

以降の実装では、本ドキュメントを Release QA Cockpit の最終実装ルールとして扱う。
