import { NextResponse } from "next/server";
import { getPublicStorefront } from "@/lib/storefront";

export const dynamic = "force-dynamic";

/** Public: live banners + homepage config. */
export async function GET() {
  return NextResponse.json(await getPublicStorefront());
}
