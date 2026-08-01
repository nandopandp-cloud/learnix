import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { searchCourses } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ results: [] }, { status: 401 });
  }

  const term = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchCourses(term);

  return NextResponse.json({ results });
}
