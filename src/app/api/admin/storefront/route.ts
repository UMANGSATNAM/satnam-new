import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { getStorefront, saveStorefront } from "@/lib/storefront";

export const dynamic = "force-dynamic";

/** Admin: all banners (incl. inactive/scheduled) + config. */
export async function GET() {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getStorefront());
}

/** Admin: save banners and/or config. Body: { banners?: Banner[], config?: HomeConfig } */
export async function PUT(req: NextRequest) {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    return NextResponse.json(await saveStorefront(body));
  } catch (e) {
    console.error("[admin/storefront] save failed", e);
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
}
