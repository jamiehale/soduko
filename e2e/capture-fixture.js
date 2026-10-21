// Captures a saved game from the running app into e2e/fixtures/. Not part of
// the test suite (Playwright only runs *.spec.js). Re-run only to capture a new
// format; the committed v0.2.2 fixture must never be regenerated.
//
// Usage: start the app (`npm start`), then `node e2e/capture-fixture.js <name>`

const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

const main = async (name) => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(BASE_URL);
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  const cell = (i) => page.locator(`[data-cell="${i}"]`);

  // Stock puzzle 1
  await page.getByRole('button', { name: 'New' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.locator('[aria-haspopup="listbox"]').click();
  await page.getByRole('option').first().click();
  await dialog.getByRole('button', { name: 'Start' }).click();
  await dialog.waitFor({ state: 'hidden' });

  // A value, marks on two cells, another value, then undo the last value
  await cell(1).click();
  await page.keyboard.press('2');
  const from = await cell(2).boundingBox();
  const to = await cell(3).boundingBox();
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 2 });
  await page.mouse.up();
  await page.keyboard.press('1');
  await page.keyboard.press('7');
  await cell(11).click();
  await page.keyboard.press('6');
  await page.getByTestId('undo').click();

  const saved = await page.evaluate(() => window.localStorage.getItem('soduko'));
  await browser.close();

  const file = path.join(__dirname, 'fixtures', `${name}.json`);
  fs.writeFileSync(file, `${JSON.stringify(JSON.parse(saved), null, 2)}\n`);
  console.log(`Wrote ${file}`);
};

main(process.argv[2] || 'saved-game').catch((e) => {
  console.error(e);
  process.exit(1);
});
