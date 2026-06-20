# Release QA Cockpit 設計レビュー反映事項

> 実装時の正本は `docs/app-design/release-qa-cockpit-implementation-source-of-truth.md` とする。
> 本ファイルと正本が競合する場合は、正本を優先する。

本ドキュメントは、初期設計レビューで発見した論点の補足である。
ただし、MVP 実装時の最終判断は `release-qa-cockpit-implementation-source-of-truth.md` に集約する。

実装時に特に誤読しやすい点は以下である。

- Low impact risk の扱いは正本の表を使う。
- 正式判定は保存済みDB状態のみ、保存前プレビューは draft input を受け取る。
- Readiness 計算時、Release Decision 保存時、Evidence Pack 生成時の Evidence 条件を混同しない。
- MVP では `reportExports` / `reports` / `reportHistory` / `comments` store を作成しない。
- Reports は MVP では Evidence Pack Export の生成導線に限定する。

詳細な条件は、必ず `release-qa-cockpit-implementation-source-of-truth.md` を参照する。
