# サンプル

このディレクトリには、このリポジトリの QA ワークフローを理解するためのサンプルを置きます。

ここにあるファイルは、実案件の正本成果物ではありません。実案件で作業する場合は、`AGENTS.md`、対象プロジェクトプロファイル、各スキルの `SKILL.md` に従い、root の `artifacts/`、`specs/`、`tests/` に成果物を作成します。

## 現在のサンプル

- `mini-saas/`: 架空のミニ SaaS に対して、ログイン機能を題材にした探索、仕様カタログ、テスト計画、テスト設計、生成前レビュー、coverage 台帳、生成テスト例を示します。

## 読む順序

1. `mini-saas/README.md`
2. `mini-saas/target-project-profile.md`
3. `mini-saas/service-exploration/`
4. `mini-saas/spec-catalog/`
5. `mini-saas/specs/login.plan.md`
6. `mini-saas/specs/login.test-design.md`
7. `mini-saas/specs/_reviews/login.validation.md`
8. `mini-saas/specs/login.coverage.md`
9. `mini-saas/generated-tests/login.spec.ts.md`

## 注意

- サンプルは `examples/` 配下に閉じています。
- `examples/` 配下の `.md` は読み物です。
- `generated-tests/login.spec.ts.md` は実行用の `.spec.ts` ではありません。
- 実在する URL、アカウント、認証情報、顧客情報は含めません。
- 日本語で読める成果物例にするため、UI ラベルとコード識別子以外は日本語で記載します。
