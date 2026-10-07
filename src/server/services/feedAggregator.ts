import "server-only";
import { Category, ContentItem, ContentType, NewsRegion, VibeLabel } from "@/types";
import { fetchNewsArticles } from "./newsService";
import { fetchTmdbRecommendations } from "./tmdbService";
import { fetchSocialPosts } from "./socialService";
import { fetchMusicRecommendations } from "./spotifyService";
import { computeItemVibeScore } from "./vibeService";
interface Options {
  category?: string;
  type?: string;
  search?: string;
  region?: NewsRegion;
  customTopic?: string;
  socialPlatform?: string;
  page?: number;
  limit?: number;
  activeVibe?: VibeLabel;
  spotifyAccessToken?: string;
  trending?: boolean;
}
export async function getAggregatedFeed({
  category = "all",
  type = "all",
  search = "",
  region = "all",
  customTopic = "",
  socialPlatform = "all",
  page = 1,
  limit = 12,
  activeVibe = "Chill",
  spotifyAccessToken,
  trending = false,
}: Options = {}) {
  const categories = category
    .split(",")
    .filter((c) => c !== "all") as Category[];
  const types = type.split(",").filter((t) => t !== "all") as ContentType[];
  const results = await Promise.allSettled([
    Promise.all(
      (categories.length ? categories : [undefined]).map((c) =>
        fetchNewsArticles(c, region, customTopic),
      ),
    ).then((groups) => groups.flat()),
    fetchTmdbRecommendations(),
    fetchSocialPosts(categories[0] || "technology"),
    fetchMusicRecommendations(spotifyAccessToken),
  ]);
  if (results.every((r) => r.status === "rejected"))
    throw new Error("All content sources are unavailable");
  const combined = results.flatMap<ContentItem>((r) =>
    r.status === "fulfilled" ? r.value : [],
  );
  const unique = Array.from(new Map(combined.map((i) => [i.id, i])).values());
  const q = search.trim().toLowerCase();
  let filtered = unique.filter(
    (i) =>
      (!categories.length || categories.includes(i.category)) &&
      (!types.length || types.includes(i.type)) &&
      (!q ||
        [i.title, i.summary, i.source, ...(i.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(q)),
  );
  if (socialPlatform && socialPlatform !== "all") {
    filtered = filtered.filter((i) => {
      if (i.type !== "social") return true;
      return (i as any).platform === socialPlatform;
    });
  }
  filtered.sort((a, b) =>
    trending
      ? Number(!!b.isTrending) - Number(!!a.isTrending)
      : computeItemVibeScore(b, activeVibe) -
        computeItemVibeScore(a, activeVibe),
  );
  return {
    items: filtered.slice((page - 1) * limit, page * limit),
    total: filtered.length,
    page,
    hasMore: page * limit < filtered.length,
  };
}
