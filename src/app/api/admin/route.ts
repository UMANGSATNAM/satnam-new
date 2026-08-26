import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, createAdminToken, setAdminCookie, clearAdminCookie, getAdminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  const user = await verifyAdmin(email, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const token = createAdminToken(user.id, user.email);
  await setAdminCookie(token);
  return NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}

export async function DELETE() {
  await clearAdminCookie();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: admin });
}
