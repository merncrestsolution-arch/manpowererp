import { expect, test } from "@playwright/test";

test.describe("JK Manpower ERP smoke", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();
  });

  test("unauthenticated users are redirected to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });
});
