import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

// Next.js only serves files that were in /public at BUILD time. Images uploaded from the
// admin panel after deployment are served through this route instead (see next.config rewrite).
const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(_req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  const name = path.basename((parts || []).join("/"));
  const ext = path.extname(name).toLowerCase();
  if (!name || !TYPES[ext]) return new NextResponse("Not found", { status: 404 });
  const file = path.join(process.cwd(), "public", "uploads", name);
  try {
    const buf = await fs.readFile(file);
    const headers: Record<string, string> = {
      "Content-Type": TYPES[ext],
      "Cache-Control": "public, max-age=31536000, immutable",
    };
    if (ext === ".svg") headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'";
    return new NextResponse(new Uint8Array(buf), { headers });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
