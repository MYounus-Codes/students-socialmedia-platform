import { expect, test } from "@playwright/test";

test("redirects unauthenticated users away from protected home", async ({ page }) => {
  await page.goto("/home");
  await expect(page).toHaveURL(/\/login\?next=%2Fhome/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("keeps signup available to unauthenticated users", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
});
