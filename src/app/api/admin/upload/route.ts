import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize extension
    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"];
    if (!allowed.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid image format. Allowed: JPG, PNG, WEBP, SVG, GIF" },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .slice(0, 40);
    const filename = `${safeName}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch (error) {
    console.error("[upload] Error saving image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
