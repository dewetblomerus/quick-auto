import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/automate');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/QuickAverage/);
});

test.describe('Initial Page Load', () => {
  test('takes the user to a room id', async ({ page }) => {
    await page.goto('/');

    // url ends in numbers
    expect(page.url()).toMatch(/\d+$/);
  });

  test('renders form', async ({ page }) => {
    await page.goto('/automate');

    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Number')).toBeVisible();
    await expect(page.getByLabel('Only Viewing')).toBeVisible();
  });

  test('hides number input when only viewing', async ({ page }) => {
    await page.goto('/automate');

    page.on('websocket', (ws) => {
      // ws.on("framesent", (event) => console.log(JSON.parse(event.payload)));
      expect(ws.isClosed()).toBeFalsy();
    });

    await new Promise((r) => setTimeout(r, 100));

    await page.getByLabel('Only Viewing').check();

    expect(await page.getByLabel('Only Viewing').isChecked()).toBeTruthy();

    await expect(page.getByLabel('Number')).not.toBeVisible();
  });

  test('only the first users sees admin buttons', async ({ browser }) => {
    // Create two isolated browser contexts
    const firstContext = await browser.newContext();
    const secondContext = await browser.newContext();

    // Create pages and interact with contexts independently
    const firstPage = await firstContext.newPage();
    const secondPage = await secondContext.newPage();

    await firstPage.goto('/');
    const firstUrl = firstPage.url();

    // url ends in numbers
    expect(firstUrl).toMatch(/\d+$/);
    await secondPage.goto(firstUrl);

    await expect(
      firstPage.getByRole('button', { name: 'Clear Numbers' })
    ).toBeVisible();

    await expect(
      secondPage.getByRole('button', { name: 'Clear Numbers' })
    ).not.toBeVisible();
  });
});

test.describe('User list', () => {
  test('renders a list of all the users input and the average', async ({
    browser,
  }) => {
    // Create two isolated browser contexts
    const firstContext = await browser.newContext();
    const secondContext = await browser.newContext();

    // Create pages and interact with contexts independently
    const firstPage = await firstContext.newPage();
    const secondPage = await secondContext.newPage();

    await firstPage.goto('/');

    await secondPage.goto(firstPage.url());
    await new Promise((r) => setTimeout(r, 150));

    await firstPage.getByLabel('Name').fill('Peter');
    await firstPage.getByLabel('Number').fill('7');

    await secondPage.getByLabel('Name').fill('Suzie');
    await secondPage.getByLabel('Number').fill('10');

    await expect(secondPage.getByText('Peter')).toBeVisible();
    await expect(secondPage.getByText('7')).toBeVisible();
    await expect(firstPage.getByText('Suzie')).toBeVisible();
    await expect(firstPage.getByText('10')).toBeVisible();
    await expect(firstPage.getByText('Average:')).toBeVisible();
    await expect(firstPage.getByText('8.5')).toBeVisible();
  });
});
