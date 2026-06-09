# login.spec.ts 生成例

このファイルはサンプルです。実行用の `.spec.ts` ではありません。

実案件では、validation が `PASS` になった後、対象プロジェクトのテスト配置方針に従って `tests/login.spec.ts` などへ生成します。

## 生成される Playwright Test の例

```ts
import { expect, test } from '@playwright/test';

const sampleUserEmail = 'user@example.test';
const sampleUserSecret = 'sample-secret';
const sampleInvalidSecret = 'invalid-secret';

test.describe('login', () => {
  test('TD-001: 正常なユーザーはログインできる', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('メールアドレス').fill(sampleUserEmail);
    await page.getByLabel('パスワード').fill(sampleUserSecret);
    await page.getByRole('button', { name: 'ログイン' }).click();

    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();
  });

  test('TD-002: メールアドレス未入力の場合はエラーになる', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('パスワード').fill(sampleUserSecret);
    await page.getByRole('button', { name: 'ログイン' }).click();

    await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('TD-003: パスワード未入力の場合はエラーになる', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('メールアドレス').fill(sampleUserEmail);
    await page.getByRole('button', { name: 'ログイン' }).click();

    await expect(page.getByText('パスワードを入力してください')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('TD-004: メール形式が不正な場合はエラーになる', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('メールアドレス').fill('invalid-email');
    await page.getByLabel('パスワード').fill(sampleUserSecret);
    await page.getByRole('button', { name: 'ログイン' }).click();

    await expect(page.getByText('メールアドレスの形式が正しくありません')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('TD-005: 誤った認証情報の場合は認証失敗エラーになる', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('メールアドレス').fill(sampleUserEmail);
    await page.getByLabel('パスワード').fill(sampleInvalidSecret);
    await page.getByRole('button', { name: 'ログイン' }).click();

    await expect(page.getByText('メールアドレスまたはパスワードが正しくありません')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
```

## 生成時の注意

- 実案件では、認証情報をテストコードや成果物に直接書かない。
- UI ラベルやエラー文言は、実際の画面証跡に合わせて調整する。
- TD-006 は追加証跡が必要なため、この生成例には含めない。
- 実案件では `specs/<feature>.coverage.md` を更新し、設計 ID と実装テストの対応を残す。
