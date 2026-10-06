import { test, expect } from "@playwright/test";

const stories = Array.from({ length: 4 }, (_, i) => ({
  id: `design-${i}`,
  type: "news",
  title: `A different perspective on discovery ${i + 1}`,
  summary: "The people and ideas changing the way we see the world.",
  category: "science",
  source: "Pulse Review",
  timestamp: "Today",
  url: "https://example.com",
  readTimeMinutes: 4,
}));
test.beforeEach(async ({ page }) => {
  await page.route("**/api/feed?**", (route) =>
    route.fulfill({ json: { items: stories, total: 4, nextPage: null } }),
  );
});
for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  test(`dashboard remains usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByTestId("content-card")).toHaveCount(4);
    await expect(
      page.getByRole("button", { name: "Add Custom Post", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Refresh", exact: true }),
    ).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    expect(overflow).toBe(false);
    await page
      .getByRole("button", { name: "Add Custom Post", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.getByLabel("Title *", { exact: true })).toBeVisible();
    await page
      .getByRole("button", { name: "Add to Feed", exact: true })
      .scrollIntoViewIfNeeded();
    const bounds = await dialog.boundingBox();
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add Custom Post", exact: true }),
    ).toBeFocused();
    if (width < 761) {
      const nav = page.getByRole("navigation", { name: "Main navigation" });
      const box = await nav.boundingBox();
      expect(box!.y).toBeGreaterThan(790);
      await nav.getByRole("link", { name: /Favorites/ }).click();
      await expect(
        page.getByRole("heading", { name: /Saved Favorites/ }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Settings", exact: true }).click();
      await expect(
        page.getByRole("dialog", { name: "Preferences" }),
      ).toBeVisible();
    }
  });
}
test("search shortcut, collection search recovery, and accessible playlist dialog", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("content-card")).toHaveCount(4);
  await page.keyboard.press("Control+k");
  await expect(page.getByLabel("Search content")).toBeFocused();
  await page.getByLabel("Toggle favorite").first().click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: /Favorites/ })
    .click();
  await expect(page.getByTestId("content-card")).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: /Open source for/ }),
  ).toHaveAttribute("href", "https://example.com");
  await page.getByLabel("Search content").fill("unmatched-query");
  await expect(
    page.getByText("No saved items match your search."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear search", exact: true })
    .last()
    .click();
  await expect(page.getByTestId("content-card")).toHaveCount(1);
  await page.getByLabel("Remove from favorites").click();
  await expect(page.getByText("Make room for a good read.")).toBeVisible();
  await page.getByTitle("Open AI Mood DJ & Playlist Architect").click();
  const dj = page.getByRole("dialog", { name: "AI Mood DJ Studio" });
  await expect(dj).toBeVisible();
  await expect(page.getByLabel("How are you feeling right now?")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dj).not.toBeVisible();
  await expect(
    page.getByTitle("Open AI Mood DJ & Playlist Architect"),
  ).toBeFocused();
});
test("loading and error recovery match the feed layout", async ({ page }) => {
  await page.route("**/api/feed?**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.fulfill({
      status: 503,
      json: { error: "Temporarily unavailable" },
    });
  });
  await page.goto("/");
  await expect(
    page.getByRole("status", { name: "Loading your feed" }),
  ).toBeVisible();
  await expect(
    page.getByRole("alert").filter({ hasText: "Feed Loading Error" }),
  ).toBeVisible();
  await page.route("**/api/feed?**", (route) =>
    route.fulfill({ json: { items: stories, total: 4, nextPage: null } }),
  );
  await page.getByRole("button", { name: "Try Again", exact: true }).click();
  await expect(page.getByTestId("content-card")).toHaveCount(4);
});
