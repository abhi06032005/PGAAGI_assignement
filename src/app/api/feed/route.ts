import { NextRequest, NextResponse } from "next/server";
import { getAggregatedFeed } from "@/server/services/feedAggregator";

const VALID_CATEGORIES = new Set([
  "all",
  "technology",
  "finance",
  "sports",
  "entertainment",
  "health",
  "science",
  "space",
  "general",
]);

const TYPE_ALIAS_MAP: Record<string, string> = {
  movies: "recommendation",
  movie: "recommendation",
  recommendations: "recommendation",
  recommendation: "recommendation",
  news: "news",
  music: "music",
  social: "social",
  apod: "apod",
  all: "all",
};

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const rawCategory = p.get("category") || "all";
  const rawType = p.get("types") || p.get("type") || "all";

  const page = Math.max(1, parseInt(p.get("page") || "1", 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(p.get("limit") || "12", 10) || 12));

  // Normalize category
  const categoriesList = rawCategory
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter((c) => VALID_CATEGORIES.has(c));
  const category = categoriesList.length > 0 ? categoriesList.join(",") : "all";

  // Normalize type
  const typesList = rawType
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .map((t) => TYPE_ALIAS_MAP[t] || t)
    .filter((t) => Boolean(TYPE_ALIAS_MAP[t]));
  const type = typesList.length > 0 ? typesList.join(",") : "all";

  try {
    const result = await getAggregatedFeed({
      category,
      type,
      page,
      limit,
      search: (p.get("search") || "").slice(0, 200),
      trending: p.get("trending") === "true",
    });

    return NextResponse.json({
      ...result,
      nextPage: result.hasMore ? page + 1 : null,
    });
  } catch (error) {
    console.error("Feed error:", error);
    // Robust fallback to ensure user always receives feed content
    try {
      const fallback = await getAggregatedFeed({
        category: "all",
        type: "all",
        page: 1,
        limit: 12,
      });
      return NextResponse.json({
        ...fallback,
        nextPage: null,
      });
    } catch {
      return NextResponse.json(
        { error: "Content is temporarily unavailable. Please try again." },
        { status: 503 },
      );
    }
  }
}
