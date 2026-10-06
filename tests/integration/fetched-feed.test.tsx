import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, it, expect, vi, afterEach } from "vitest";
import { makeStore } from "@/store/store";
import { FeedSection } from "@/features/feed/components/FeedSection";
import { apiClient } from "@/lib/api/client";
import { mockNewsArticles } from "@/server/mocks/news";
import { fetchFeed } from "@/features/feed/feedThunks";
import { setDebouncedQuery } from "@/features/search/searchSlice";
import { loadPersistedState } from "@/store/persistMiddleware";
vi.mock("@/lib/api/client", () => ({ apiClient: { get: vi.fn() } }));
vi.mock("@/features/feed/useInfiniteFeed", () => ({
  useInfiniteFeed: () => ({
    sentinelRef: { current: null },
    hasMore: false,
    loadMore: vi.fn(),
  }),
}));
afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});
function setup() {
  const store = makeStore({});
  render(
    <Provider store={store}>
      <FeedSection />
    </Provider>,
  );
  return store;
}
describe("Fetched feed integration", () => {
  it("renders fetched content and pagination metadata", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      items: [mockNewsArticles[0]],
      nextPage: 2,
    });
    const store = setup();
    expect(await screen.findByText(mockNewsArticles[0].title)).toBeVisible();
    expect(store.getState().feed.hasMore).toBe(true);
  });
  it("renders a genuine empty response", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ items: [], nextPage: null });
    setup();
    expect(
      await screen.findByText("No stories found matching your current filter."),
    ).toBeVisible();
  });
  it("renders an API error without also showing empty state", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error("Provider offline"));
    setup();
    expect(await screen.findByText("Provider offline")).toBeVisible();
    expect(
      screen.queryByText("No stories found matching your current filter."),
    ).toBeNull();
  });
  it("ignores stale responses when search changes quickly", async () => {
    let finish!: (value: unknown) => void;
    vi.mocked(apiClient.get)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      )
      .mockResolvedValueOnce({ items: [], nextPage: null });
    const store = makeStore({});
    const old = store.dispatch(fetchFeed({ resetPage: true }));
    store.dispatch(setDebouncedQuery("missing"));
    await store.dispatch(fetchFeed({ resetPage: true }));
    finish({ items: [mockNewsArticles[0]], nextPage: null });
    await old;
    expect(store.getState().feed.items).toEqual([]);
  });
  it("recovers from malformed persisted data", () => {
    localStorage.setItem("pulse_favorites_v2", "{}");
    localStorage.setItem("pulse_preferences_v2", "broken");
    expect(loadPersistedState().favorites?.favoriteIds).toEqual([]);
    expect(loadPersistedState().preferences?.theme).toBe("light");
  });
  it("sends category and content type preferences in the API request", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ items: [], nextPage: null });
    setup();
    await waitFor(() =>
      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/feed",
        expect.objectContaining({
          category: expect.stringContaining("technology"),
          types: expect.stringContaining("music"),
        }),
      ),
    );
  });
});
