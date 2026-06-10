# 対象アプリのリポジトリ要否

このワークフローの主軸は、対象アプリのコード解析ではなく Playwright CLI による実画面探索です。

## リポジトリがなくても進められる作業

- サービス全体探索
- 機能単位の画面探索
- テスト計画
- テスト設計
- 生成前レビュー

これらは、対象 URL、認証方法、使用ロール、データ操作ルール、Playwright CLI の証跡があれば進められます。

## リポジトリが必要になる作業

- Playwright Test を対象プロジェクトに保存する
- 既存 helper、fixture、POM、locator 方針に合わせる
- 対象プロジェクト側のコマンドでテストを実行する
- 失敗した Playwright Test を修復する

探索だけの場合、Target Project Profile の `Local path` は `N/A` で構いません。
