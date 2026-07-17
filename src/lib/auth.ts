import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./db";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const COOKIE_NAME = "ssc_admin_token";
const TOKEN_TTL = 60 * 60 * 24 * 7; // 7 days

export async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL || "admin@satnamsinghchana.com";
  const password = process.env.ADMIN_PASSWORD || "satnam@2026";
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return existing;
  const passwordHash = await bcrypt.hash(password, 10);
  return db.user.create({
    data: {
      email,
      name: "Store Admin",
      passwordHash,
      role: "ADMIN",
    },
  });
}

export async function verifyAdmin(email: string, password: string) {
  await ensureAdminUser();
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return user;
}

export function createAdminToken(userId: string, email: string) {
  return jwt.sign({ sub: userId, email, role: "ADMIN" }, JWT_SECRET, {
    expiresIn: TOKEN_TTL,
  });
}

export async function getAdminFromRequest(): Promise<{ sub: string; email: string; role: string } | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      sub: string;
      email: string;
      role: string;
    };
    return payload;
  } catch {
    return null;
  }
}

export async function setAdminCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_TTL,
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
