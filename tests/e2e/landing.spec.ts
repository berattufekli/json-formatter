import { expect, test } from '@playwright/test';

test('landing page presents every tool and links to it', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Paste messy code');
  for (const [label, path] of [['JSON', '/json'], ['CSS', '/css'], ['HTML', '/html'], ['SQL', '/sql'], ['YAML', '/yaml']] as const) {
    await expect(page.locator('#tools').getByRole('link', { name: new RegExp(`${label} formatter`, 'i') })).toHaveAttribute('href', path);
  }
});

test('the primary call to action opens the JSON formatter', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Open the JSON formatter/ }).click();
  await expect(page).toHaveURL(/\/json$/);
});

test('header navigation switches tools and marks the current one', async ({ page }) => {
  await page.goto('/json');
  const nav = page.getByRole('navigation', { name: 'Tools' });
  await expect(nav.getByRole('link', { name: 'JSON' })).toHaveAttribute('aria-current', 'page');
  await nav.getByRole('link', { name: 'SQL' }).click();
  await expect(page).toHaveURL(/\/sql$/);
  await expect(nav.getByRole('link', { name: 'SQL' })).toHaveAttribute('aria-current', 'page');
});

test('the GitHub link points at this repository', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /GitHub/ }).first()).toHaveAttribute('href', 'https://github.com/berattufekli/json-formatter');
});

test('theme switch applies and persists across reloads', async ({ page }) => {
  await page.goto('/json');
  await page.getByRole('button', { name: 'Dark theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Light theme' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('unknown routes give a 404', async ({ page }) => {
  const res = await page.goto('/does-not-exist');
  expect(res?.status()).toBe(404);
});
