# 初回チュートリアル

このページは、AI エージェントを使った QA 作業に慣れていない人が、最初の1回を迷わず始めるための手順です。

詳しい考え方は後続ページで説明します。ここでは、最初に必要な準備、作業開始の判断、AI エージェントへの依頼文、人間が確認する成果物だけに絞ります。

## 前提

`playwright-qa-agent-workflow` は、AI エージェントそのものではありません。

このリポジトリは、AI エージェントに画面探索、テスト計画、テスト設計、生成前レビュー、Playwright Test 生成、失敗テスト修復を段階的に進めさせるためのルールと成果物置き場です。

AI エージェントには、次のことができる環境を使ってください。

- このリポジトリのファイルを読める
- 対象アプリのリポジトリまたは画面を確認できる
- シェルコマンドを実行できる
- Playwright CLI でブラウザ操作や証跡取得ができる

## 依頼文に毎回書かなくてよいこと

AI エージェントは、通常、リポジトリ内の `AGENTS.md` や該当スキルを読む前提で動きます。

そのため、利用者が毎回の依頼文で次のような共通指示を繰り返す必要はありません。

```text
AGENTS.md を読んでください。
```

依頼文には、共通ルールではなく、今回の作業でしか分からない情報を書きます。

- 対象アプリ名
- 対象 URL
- 使用する環境
- 使用するロール
- 対象 feature slug
- 今回の目的
- 触ってよいデータ、触ってはいけないデータ
- 参照すべき Target Project Profile
- 今回だけの注意点

## 1. ワークスペースを用意する

このリポジトリと対象アプリのリポジトリを、AI エージェントが両方読める場所に置きます。

例です。

```text
workspace/
  playwright-qa-agent-workflow/
  target-app/
```

この場合、Target Project Profile の `Local path` には次のように書きます。

```text
../target-app
```

GitHub URL だけで作業するのか、ローカルに clone されたディレクトリを読むのかを曖昧にしないでください。

## 2. `playwright-qa-agent-workflow` の初期確認を行う

`playwright-qa-agent-workflow` に移動して、依存関係をインストールします。

```bash
npm install
```

軽量チェックを実行します。

```bash
npm run check:evals
```

Playwright CLI が使えるか確認します。

```bash
playwright-cli --help
```

Playwright CLI が使えない場合、ブラウザ探索、画面操作、snapshot、screenshot、trace 取得は `BLOCKED` として扱います。確認していない内容を、確認済みとして書かせないでください。

## 3. Target Project Profile を作る

AI エージェントに対象アプリを安全に扱わせる前に、対象アプリの前提情報を作ります。

サービス全体探索から始める場合は、次に作成します。

```text
artifacts/service-exploration/TARGET_PROJECT_PROFILE.md
```

1機能だけを扱う場合は、次に作成しても構いません。

```text
artifacts/<feature>/TARGET_PROJECT_PROFILE.md
```

テンプレートは次です。

```text
artifacts/_templates/target-project-profile.md
```

最低限、次を埋めます。

| 項目       | 書くこと                                               |
| ---------- | ------------------------------------------------------ |
| 対象アプリ | アプリ名、対象リポジトリ、ブランチ、ローカルパス       |
| 環境       | dev、staging、検証環境など                             |
| URL        | Base URL、必要ならローカル URL                         |
| 認証       | 認証方式、使用ロール、認証情報の取得元                 |
| データ操作 | 作成、更新、削除、通知、外部連携の可否                 |
| テスト実行 | 対象プロジェクト側のテスト実行コマンド                 |
| 生成方針   | 生成先、helper / POM、locator、assertion、cleanup 方針 |

パスワード、Cookie、アクセストークン、リフレッシュトークン、API キー、保存済みブラウザ状態の中身は書かないでください。

## 4. 作業の入口を選ぶ

最初に、今回の入口を決めます。

| 状況                                                     | 入口                        |
| -------------------------------------------------------- | --------------------------- |
| 対象アプリ全体をまだ把握できていない                     | サービス全体探索            |
| テスト化する機能がまだ決まっていない                     | サービス全体探索            |
| 対象がログイン、会話詳細、ユーザー管理などに決まっている | 機能単位ワークフロー        |
| PASS 済みの test-design がある                           | generator gate 確認後に生成 |
| 既存の Playwright Test が失敗している                    | healer                      |

迷った場合は、いきなりテスト生成に進まず、サービス全体探索または機能単位の計画から始めます。

## 5. サービス全体探索を依頼する

対象アプリ全体を把握したい場合は、次のように依頼します。

```text
対象は <対象アプリ名> です。
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
- artifacts/service-exploration/runs/<run-id>/99_handoff.md

確認できた再利用可能な仕様は artifacts/spec-catalog/ に反映してください。
確認できていないことは推測せず、Unverified または OPEN_QUESTIONS.md に残してください。
```

人間は、作業後に次を確認します。

- 主要画面が整理されているか
- 探索済み範囲と未探索範囲が分かるか
- 証跡があるか
- 未確認事項が隠されていないか
- 次に planner へ進める機能候補があるか

## 6. 1機能の作業を依頼する

対象機能が決まっている場合は、feature slug を決めます。

例です。

```text
login
conversation-detail
user-management
```

まず作業場所を作ります。

```bash
npm run agent:init -- --feature login --request "ログイン画面のテスト計画とテスト設計を作成する"
npm run agent:status -- --feature login
npm run agent:next -- --feature login
```

AI エージェントへは、次のように依頼します。

```text
feature slug は login です。
artifacts/login/TARGET_PROJECT_PROFILE.md または artifacts/service-exploration/TARGET_PROJECT_PROFILE.md を確認してください。
npm run agent:status -- --feature login を確認してください。
npm run agent:next -- --feature login が示す次のスキルに従って作業してください。

ログイン画面について、Playwright CLI の証跡をもとにテスト計画から進めてください。
確認できていないことは推測せず、Unverified または OPEN_QUESTIONS.md に残してください。
```

以降は、`npm run agent:next -- --feature login` が示す次の作業に進みます。

## 7. 生成前に gate を確認する

Playwright Test を生成する前に、必ず generator gate を確認します。

```bash
npm run agent:gate -- --feature login --for generator
```

`PASS` でない場合、`playwright-test-generator` に進めません。

`validation.md` が存在していても、判定が `PASS` でない場合や SHA-256 が古い場合は生成できません。

## 8. 人間が最後に確認するもの

作業が終わったら、テストコードだけを見て完了にしないでください。

まず次を確認します。

```text
artifacts/<feature>/HANDOFF.md
artifacts/<feature>/OPEN_QUESTIONS.md
specs/<feature>.plan.md
specs/<feature>.test-design.md
specs/_reviews/<feature>.validation.md
specs/<feature>.coverage.md
```

サービス全体探索の場合は、次を確認します。

```text
artifacts/service-exploration/HANDOFF.md
artifacts/service-exploration/FEATURE_BACKLOG.md
artifacts/service-exploration/OPEN_QUESTIONS.md
artifacts/spec-catalog/
```

特に確認する点です。

- 現在状態が `HANDOFF.md` にまとまっているか
- 未確認事項が `OPEN_QUESTIONS.md` に残っているか
- 仕様が証跡なしで断定されていないか
- validation が `PASS` しているか
- 実装済みテストと test-design ID の対応が `specs/<feature>.coverage.md` にあるか
- run 配下だけに重要情報が残っていないか

## 9. 次に読むページ

初回の流れが分かったら、次を読んで詳細を確認してください。

1. [`01-before-you-start.md`](01-before-you-start.md)
2. [`02-target-project-profile.md`](02-target-project-profile.md)
3. [`03-service-exploration.md`](03-service-exploration.md)
4. [`04-feature-workflow.md`](04-feature-workflow.md)
5. [`05-artifact-reading-guide.md`](05-artifact-reading-guide.md)
6. [`06-troubleshooting.md`](06-troubleshooting.md)
7. [`glossary.md`](glossary.md)
