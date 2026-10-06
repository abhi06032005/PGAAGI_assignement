import { NextRequest, NextResponse } from "next/server";
import { getAggregatedFeed } from "@/server/services/feedAggregator";
const categories = new Set([
  "all",
  "technology",
  "finance",
  "sports",
  "entertainment",
  "health",
  "science",
  "space",
]);
const types = new Set([
  "all",
  "news",
  "recommendation",
  "music",
  "social",
  "apod",
]);
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const category = p.get("category") || "all";
  const type = p.get("types") || p.get("type") || "all";
  const page = Number(p.get("page") || 1),
    limit = Number(p.get("limit") || 12);
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 50 ||
    category.split(",").some((c) => !categories.has(c)) ||
    type.split(",").some((t) => !types.has(t))
  )
    return NextResponse.json(
      { error: "Invalid feed filters or pagination" },
      { status: 400 },
    );
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
  } catch {
    return NextResponse.json(
      { error: "Content is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
}
