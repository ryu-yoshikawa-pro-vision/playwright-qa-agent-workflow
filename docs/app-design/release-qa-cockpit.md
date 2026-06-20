# Release QA Cockpit 設計書

> 実装時の正本は `docs/app-design/release-qa-cockpit-implementation-source-of-truth.md` とする。
> 本ファイルと正本が競合する場合は、正本を優先する。

`Release QA Cockpit` は、リリース前 QA の進捗、未解決不具合、残リスク、承認可否、証跡をローカルブラウザ上で管理し、最終的にリリース判定レポートを出力するためのローカルファースト SaaS 風アプリケーションである。

詳細な実装条件、Ready / At Risk / Not Ready 判定、MVP Store 範囲、Reports / Evidence Pack の扱い、実装先ディレクトリは、必ず `release-qa-cockpit-implementation-source-of-truth.md` を先に確認する。

本ファイル内に古い Ready 条件、`examples/release-qa-cockpit/`、Reports 履歴 Store、HTML / JSON 出力などの記述が残っている場合でも、MVP 実装では正本を優先する。
