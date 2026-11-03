import { expect, test } from '@playwright/test';
import { inputBox, openOptions, openTool, output, status, type } from './helpers';

const TOOLS = ['json', 'css', 'html', 'sql', 'yaml'] as const;

for (const tool of TOOLS) {
  test.describe(`${tool}: shared workbench behaviour`, () => {
    test.beforeEach(async ({ page }) => openTool(page, tool));

    test('the sample is formatted on first load', async ({ page }) => {
      await expect(status(page)).toHaveAttribute('data-state', 'valid');
      await expect(output(page)).not.toBeEmpty();
    });

    test('clearing the input resets output and status', async ({ page }) => {
      await page.getByTestId('clear').click();
      await expect(inputBox(page)).toHaveValue('');
      await expect(status(page)).toHaveAttribute('data-state', 'idle');
      await expect(page.getByText(new RegExp(`Paste some ${tool}`, 'i'))).toBeVisible();
    });

    test('the sample button restores the example', async ({ page }) => {
      await page.getByTestId('clear').click();
      await page.getByRole('button', { name: /Sample/ }).click();
      await expect(inputBox(page)).not.toHaveValue('');
      await expect(status(page)).toHaveAttribute('data-state', 'valid');
    });

    test('input is remembered after a reload', async ({ page }) => {
      const marker = { json: '{"remember":1}', css: '.remember{color:red}', html: '<p>remember</p>', sql: 'select 1 as remember', yaml: 'remember: 1' }[tool];
      await type(page, marker);
      await expect(output(page)).toContainText('remember');
      await page.reload();
      await expect(inputBox(page)).toHaveValue(marker);
    });

    test('a file can be opened and replaces the input', async ({ page }) => {
      const content = { json: '{"fromFile":true}', css: '.f{margin:0}', html: '<b>file</b>', sql: 'select 42 as fromfile', yaml: 'fromFile: true' }[tool];
      await page.getByTestId('file-input').setInputFiles({ name: `x.${tool}`, mimeType: 'text/plain', buffer: Buffer.from(content) });
      await expect(inputBox(page)).toHaveValue(content);
      await expect(page.getByText(`Loaded x.${tool}`)).toBeVisible();
    });

    test('dropping a file onto the editor loads it', async ({ page }) => {
      const content = { json: '{"dropped":1}', css: '.d{top:0}', html: '<i>drop</i>', sql: 'select 7', yaml: 'dropped: 1' }[tool];
      const dt = await page.evaluateHandle((c) => {
        const d = new DataTransfer();
        d.items.add(new File([c], 'drop.txt', { type: 'text/plain' }));
        return d;
      }, content);
      await inputBox(page).dispatchEvent('drop', { dataTransfer: dt });
      await expect(inputBox(page)).toHaveValue(content);
    });

    test('copy puts the output on the clipboard', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await expect(status(page)).toHaveAttribute('data-state', 'valid');
      const shown = (await output(page).textContent()) ?? '';
      await page.getByTestId('copy').click();
      await expect(page.getByTestId('copy')).toContainText('Copied');
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(shown);
    });

    test('download saves the output with the right extension', async ({ page }) => {
      await expect(status(page)).toHaveAttribute('data-state', 'valid');
      const shown = (await output(page).textContent()) ?? '';
      const [download] = await Promise.all([page.waitForEvent('download'), page.getByTestId('download').click()]);
      expect(download.suggestedFilename()).toMatch(new RegExp(`\\.${tool}$`));
      const stream = await download.createReadStream();
      let text = '';
      for await (const chunk of stream) text += chunk;
      expect(text).toBe(shown);
    });

    test('swap moves the output into the input', async ({ page }) => {
      await expect(status(page)).toHaveAttribute('data-state', 'valid');
      const shown = (await output(page).textContent()) ?? '';
      await page.getByTestId('swap').click();
      await expect(inputBox(page)).toHaveValue(shown);
    });

    test('Ctrl/⌘ + Enter runs the main action even with auto-format off', async ({ page }) => {
      await openOptions(page);
      await page.getByRole('switch', { name: 'Format as you type' }).click();
      await page.keyboard.press('Escape');
      await type(page, { json: '{"k":1}', css: '.k{a:b}', html: '<p>k</p>', sql: 'select k from t', yaml: 'k: 1' }[tool]);
      await page.waitForTimeout(500);
      await inputBox(page).press('Control+Enter');
      await expect(output(page)).toContainText('k');
    });

    test('line numbers can be hidden and the text size changed', async ({ page }) => {
      await expect(page.locator('.gutter').first()).toBeVisible();
      await openOptions(page);
      await page.getByRole('switch', { name: 'Line numbers' }).click();
      await expect(page.locator('.gutter')).toHaveCount(0);
      const size = page.getByTestId('font-size');
      await expect(size).toHaveText('13');
      await page.getByRole('button', { name: 'Larger text' }).click();
      await expect(size).toHaveText('14');
      await page.getByRole('button', { name: 'Smaller text' }).click();
      await page.getByRole('button', { name: 'Smaller text' }).click();
      await expect(size).toHaveText('12');
    });

    test('the pane divider moves with the keyboard', async ({ page }) => {
      const input = page.getByRole('region', { name: 'Input' });
      const before = (await input.boundingBox())!.width;
      await page.getByRole('separator', { name: 'Resize panes' }).focus();
      await page.keyboard.press('ArrowRight');
      await expect.poll(async () => (await input.boundingBox())!.width).toBeGreaterThan(before);
    });
  });
}

test.describe('invalid input', () => {
  test('JSON: shows the error, its line and column, and marks the line', async ({ page }) => {
    await openTool(page, 'json');
    await type(page, '{\n  "a": 1,\n  "b": ,\n}');
    await expect(status(page)).toHaveAttribute('data-state', 'invalid');
    await expect(page.getByTestId('error-line')).toContainText('Line 3, col 8');
    await expect(page.getByTestId('error-card')).toBeVisible();
    await page.getByRole('button', { name: /Go to line 3/ }).click();
    await expect(inputBox(page)).toBeFocused();
  });

  test('JSON: fixing the text clears the error', async ({ page }) => {
    await openTool(page, 'json');
    await type(page, '{"a":');
    await expect(status(page)).toHaveAttribute('data-state', 'invalid');
    await type(page, '{"a":1}');
    await expect(status(page)).toHaveAttribute('data-state', 'valid');
    await expect(page.getByTestId('error-card')).toHaveCount(0);
  });

  for (const [tool, bad] of [
    ['css', '.a { color: red'],
    ['html', '<div><span>unclosed</div>'],
    ['yaml', 'a: [1, 2\nb: 3'],
  ] as const) {
    test(`${tool}: a parse error is reported instead of broken output`, async ({ page }) => {
      await openTool(page, tool);
      await type(page, bad);
      await expect(status(page)).toHaveAttribute('data-state', 'invalid');
      await expect(page.getByTestId('error-card')).toBeVisible();
    });
  }
});

test.describe('json', () => {
  test.beforeEach(async ({ page }) => openTool(page, 'json'));

  test('Format indents, Minify compacts and shows the size change', async ({ page }) => {
    await type(page, '{ "a" : [ 1, 2 ],   "b": {"c": true} }');
    await expect(output(page)).toContainText('"a": [');
    await page.getByTestId('action-minify').click();
    await expect(output(page)).toHaveText('{"a":[1,2],"b":{"c":true}}');
    await expect(page.getByTestId('delta')).toContainText('→');
  });

  test('indent size and tabs are honoured', async ({ page }) => {
    await type(page, '{"a":1}');
    await openOptions(page);
    await page.getByRole('button', { name: '4', exact: true }).click();
    await expect(output(page)).toHaveText('{\n    "a": 1\n}');
    await page.getByRole('button', { name: 'Tab', exact: true }).click();
    await expect(output(page)).toHaveText('{\n\t"a": 1\n}');
  });

  test('sort keys orders nested objects', async ({ page }) => {
    await type(page, '{"b":1,"a":{"z":1,"y":2}}');
    await openOptions(page);
    await page.getByRole('switch', { name: 'Sort keys' }).click();
    await expect(output(page)).toHaveText('{\n  "a": {\n    "y": 2,\n    "z": 1\n  },\n  "b": 1\n}');
  });

  test('Ctrl/⌘ + Shift + M minifies', async ({ page }) => {
    await type(page, '{ "a": 1 }');
    await inputBox(page).press('Control+Shift+M');
    await expect(output(page)).toHaveText('{"a":1}');
  });

  test('the tree view shows the structure and nodes collapse', async ({ page }) => {
    await type(page, '{"user":{"name":"Ada","langs":["js","sql"]},"ok":true}');
    await page.getByTestId('tree-toggle').click();
    const tree = page.getByTestId('json-tree');
    await expect(tree).toContainText('"name"');
    await expect(tree).toContainText('"Ada"');
    await tree.getByRole('button', { name: /"user"/ }).click();
    await expect(tree).not.toContainText('"Ada"');
    await expect(tree).toContainText('2 items');
    await tree.getByRole('button', { name: /"user"/ }).click();
    await expect(tree).toContainText('"Ada"');
  });

  test('the tree toggle disappears when minifying', async ({ page }) => {
    await expect(page.getByTestId('tree-toggle')).toBeVisible();
    await page.getByTestId('action-minify').click();
    await expect(page.getByTestId('tree-toggle')).toHaveCount(0);
  });

  test('large documents stay responsive', async ({ page }) => {
    const big = JSON.stringify({ rows: Array.from({ length: 4000 }, (_, i) => ({ id: i, name: `row ${i}`, tags: ['a', 'b'] })) });
    await type(page, big);
    await expect(status(page)).toHaveAttribute('data-state', 'valid', { timeout: 10_000 });
    await expect(page.getByTestId('delta')).toBeVisible();
  });
});

test.describe('css', () => {
  test.beforeEach(async ({ page }) => openTool(page, 'css'));

  test('Format puts each declaration on its own line', async ({ page }) => {
    await type(page, '.a{color:red;margin:0 auto}');
    await expect(output(page)).toHaveText('.a {\n  color: red;\n  margin: 0 auto;\n}');
  });

  test('Minify strips comments and whitespace', async ({ page }) => {
    await type(page, '/* c */\n.a {\n  color: red;\n  margin: 0;\n}');
    await page.getByTestId('action-minify').click();
    await expect(output(page)).toHaveText('.a{color:red;margin:0}');
  });

  test('sort properties orders declarations', async ({ page }) => {
    await type(page, '.a{margin:0;color:red}');
    await openOptions(page);
    await page.getByRole('switch', { name: 'Sort properties' }).click();
    await expect(output(page)).toHaveText('.a {\n  color: red;\n  margin: 0;\n}');
  });
});

test.describe('html', () => {
  test.beforeEach(async ({ page }) => openTool(page, 'html'));

  test('Format indents nested elements', async ({ page }) => {
    await type(page, '<ul><li>One</li><li>Two</li></ul>');
    await expect(output(page)).toContainText('  <li>One</li>');
  });

  test('Minify removes comments and the gaps between tags', async ({ page }) => {
    await type(page, '<div>\n  <!-- note -->\n  <p>hi</p>\n</div>');
    await page.getByTestId('action-minify').click();
    await expect(output(page)).toHaveText('<div><p>hi</p></div>');
  });
});

test.describe('sql', () => {
  test.beforeEach(async ({ page }) => openTool(page, 'sql'));

  test('Format breaks clauses onto lines and upper-cases keywords', async ({ page }) => {
    await type(page, 'select a,b from t where x=1');
    await expect(output(page)).toHaveText('SELECT\n  a,\n  b\nFROM\n  t\nWHERE\n  x = 1');
  });

  test('keywords keep their case when the option is off', async ({ page }) => {
    await type(page, 'select a from t');
    await openOptions(page);
    await page.getByRole('switch', { name: 'Uppercase keywords' }).click();
    await expect(output(page)).toContainText('select');
  });

  test('Minify gives one line without comments', async ({ page }) => {
    await type(page, "select a, 'x  y' -- c\nfrom t");
    await page.getByTestId('action-minify').click();
    await expect(output(page)).toHaveText("select a,'x  y' from t");
  });
});

test.describe('yaml', () => {
  test.beforeEach(async ({ page }) => openTool(page, 'yaml'));

  test('Format normalises indentation', async ({ page }) => {
    await type(page, 'a:   1\nb:\n    - x\n    - y');
    await expect(output(page)).toHaveText('a: 1\nb:\n  - x\n  - y');
  });

  test('To JSON converts the document', async ({ page }) => {
    await type(page, 'a: 1\nb: [x, y]');
    await page.getByTestId('action-json').click();
    await expect(output(page)).toHaveText('{\n  "a": 1,\n  "b": [\n    "x",\n    "y"\n  ]\n}');
  });
});

test.describe('small screens', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('input and output are shown one at a time', async ({ page }) => {
    await openTool(page, 'json');
    await expect(page.getByRole('region', { name: 'Input' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Output' })).toBeHidden();
    await page.getByRole('tab', { name: 'output' }).click();
    await expect(page.getByRole('region', { name: 'Output' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Input' })).toBeHidden();
  });

  test('running from the toolbar jumps to the output', async ({ page }) => {
    await openTool(page, 'json');
    await page.getByTestId('run').click();
    await expect(page.getByRole('region', { name: 'Output' })).toBeVisible();
  });

  test('the theme button cycles light, dark and system', async ({ page }) => {
    await openTool(page, 'json');
    await page.getByRole('button', { name: /^Theme:/ }).click();
    await expect(page.locator('html')).toHaveClass(/dark|light/);
  });
});
