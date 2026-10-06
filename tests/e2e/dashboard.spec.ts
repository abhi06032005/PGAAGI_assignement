import { test, expect } from "@playwright/test";
const stories = Array.from({ length: 16 }, (_, i) => ({
  id: `story-${i}`,
  type: i % 3 === 0 ? "recommendation" : "news",
  title: i % 3 === 0 ? `Cinema discovery ${i}` : `Technology story ${i}`,
  summary: "A thoughtful look at the ideas shaping tomorrow.",
  category: i % 3 === 0 ? "entertainment" : "technology",
  source: "Pulse Test",
  timestamp: "Today",
  publishedAt: "2026-10-06",
  url: "https://example.com",
  rating: 8.2,
  genre: ["Drama"],
  creator: "Studio",
  subType: "movie",
  releaseYear: 2026,
}));
test.beforeEach(async ({ page }) => {
  await page.route("**/api/feed?**", (route) => {
    const p = new URL(route.request().url()).searchParams;
    const query = p.get("search")?.toLowerCase() || "";
    const types = p.get("types")?.split(",") || [];
    const filtered = stories.filter(
      (i) =>
        i.title.toLowerCase().includes(query) &&
        (!types.length || types.includes(i.type)),
    );
    const n = Number(p.get("page") || 1),
      size = Number(p.get("limit") || 12);
    return route.fulfill({
      json: {
        items: filtered.slice((n - 1) * size, n * size),
        nextPage: n * size < filtered.length ? n + 1 : null,
        total: filtered.length,
      },
    });
  });
});
test("search, empty state, reset, type filter, and pagination", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("content-card")).toHaveCount(12);
  await page.getByLabel("Search content").fill("Technology story 1");
  await expect(page.getByTestId("content-card")).toHaveCount(5);
  await page.getByLabel("Search content").fill("no-match-xyz");
  await expect(
    page.getByText("No stories found matching your current filter."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset Filters" }).click();
  await expect(page.getByTestId("content-card")).toHaveCount(12);
  await page.getByTestId("content-card").last().scrollIntoViewIfNeeded();
  await expect(page.getByTestId("content-card")).toHaveCount(16);
  await page
    .locator("#feed-start")
    .getByRole("button", { name: "Movies & Shows", exact: true })
    .click();
  await expect(page.getByTestId("content-card")).toHaveCount(6);
});
test("favorites, theme, language and order survive reload", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("content-card")).toHaveCount(12);
  await page.getByLabel("Toggle favorite").first().click();
  await page
    .getByRole("button", { name: "Move Cinema discovery 0 down", exact: true })
    .click();
  await expect(page.getByTestId("content-card").first()).toHaveAttribute(
    "data-item-id",
    "story-1",
  );
  await page.getByLabel("Switch to dark mode").click();
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByTestId("content-card").first()).toHaveAttribute(
    "data-item-id",
    "story-1",
  );
  await expect(
    page.locator('[data-item-id="story-0"]').getByLabel("Toggle favorite"),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Switch language").click();
  await expect(page.getByText("आपकी दैनिक फ़ीड")).toBeVisible();
  await page.reload();
  await expect(page.getByText("आपकी दैनिक फ़ीड")).toBeVisible();
});
test("pointer dragging reorders cards", async ({ page }) => {
  await page.goto("/");
  const handle = page.getByRole("button", {
    name: "Drag Cinema discovery 0",
    exact: true,
  });
  await handle.scrollIntoViewIfNeeded();
  const from = await handle.boundingBox();
  const next = await page.getByTestId("content-card").nth(1).boundingBox();
  if (!from || !next) throw new Error("Missing card geometry");
  await page.mouse.move(from.x + 8, from.y + 8);
  await page.mouse.down();
  await page.mouse.move(from.x + 8, next.y + next.height - 10, { steps: 24 });
  await page.mouse.up();
  await expect(page.getByTestId("content-card").first()).toHaveAttribute(
    "data-item-id",
    "story-1",
  );
});
test("mock signup and profile editing work", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("button", { name: "New here? Create an account" })
    .click();
  await page.getByLabel("Your name").fill("Taylor Reader");
  await page.getByLabel("Email Address").fill("taylor@example.com");
  await page.getByLabel("Password").fill("demo123");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Welcome back, Taylor." }),
  ).toBeVisible();
  await page.getByLabel("Open profile").click();
  await page.getByLabel("Full Name").fill("Taylor Curious");
  await page.getByRole("button", { name: "Save Changes" }).click();
  await page.reload();
  await page.getByLabel("Open profile").click();
  await expect(page.getByLabel("Full Name")).toHaveValue("Taylor Curious");
});
test("mobile fits viewport and detail opens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Read more about Cinema discovery 0" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Close details").click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("errors can be retried", async ({ page }) => {
  await page.route("**/api/feed?**", (route) =>
    route.fulfill({ status: 503, json: { error: "Temporarily unavailable" } }),
  );
  await page.goto("/");
  await expect(page.getByText("Feed Loading Error")).toBeVisible();
  await expect(page.getByRole("button", { name: /try again/i })).toBeVisible();
});
