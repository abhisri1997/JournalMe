import { test, expect } from "@playwright/test";

// Helper to create unique emails per run
function uniqueEmail() {
  return `user+${Date.now()}@example.com`;
}

test.describe("Auth and journal flow", () => {
  test("register, login, and create a journal entry", async ({ page }) => {
    const email = uniqueEmail();
    const password = "password123";

    // Register
    await page.goto("/register");
    await page.getByPlaceholder(/Email/i).fill(email);
    await page.getByPlaceholder(/Password/i).fill(password);
    await page.getByRole("button", { name: /Register/i }).click();

    // Token should be stored in localStorage
    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem("jm_token")))
      .not.toBeNull();

    // Navigate to journal
    await page.goto("/journal");
    await page
      .getByRole("textbox", { name: /Journal text/i })
      .fill("My first entry");
    await page.getByRole("button", { name: /Save text entry/i }).click();

    // Entry appears
    await expect(page.getByText(/My first entry/i)).toBeVisible({
      timeout: 10_000,
    });
  });
});
