import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("https://quickaverage.com/automate");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/QuickAverage/);
});

test.describe("Input form", () => {
  test("renders form", async ({ page }) => {
    page.goto("https://quickaverage.com/automate");

    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Number")).toBeVisible();
    await expect(page.getByLabel("Only Viewing")).toBeVisible();
  });

  test("hides number input when only viewing", async ({ page }) => {
    await page.goto("https://quickaverage.com/automate");

    page.on("websocket", (ws) => {
      // ws.on("framesent", (event) => console.log(JSON.parse(event.payload)));
      expect(ws.isClosed()).toBeFalsy();
    });

    await new Promise((r) => setTimeout(r, 100));

    await page.getByLabel("Only Viewing").check();

    expect(await page.getByLabel("Only Viewing").isChecked()).toBeTruthy();

    await expect(page.getByLabel("Number")).not.toBeVisible();
  });
});
