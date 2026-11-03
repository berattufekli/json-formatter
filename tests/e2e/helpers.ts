import { expect, type Page } from '@playwright/test';

export const inputBox = (page: Page) => page.getByRole('textbox', { name: /input$/i });
export const output = (page: Page) => page.getByTestId('output');
export const status = (page: Page) => page.getByTestId('status');

/** Open a tool with a clean slate (no stored input from an earlier test). */
export async function openTool(page: Page, tool: string) {
  await page.goto(`/${tool}`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(inputBox(page)).toBeVisible();
}

export async function type(page: Page, text: string) {
  await inputBox(page).fill(text);
}

export async function openOptions(page: Page) {
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByTestId('settings')).toBeVisible();
}
