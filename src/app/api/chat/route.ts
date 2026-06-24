import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatMessages } from "@/lib/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

// GET /api/chat?phone=xxx&brand=xxx  → messages for a session
// GET /api/chat?all=1                → all sessions (admin)
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  const brand = req.nextUrl.searchParams.get("brand");
  const all = req.nextUrl.searchParams.get("all");

  if (all) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Return latest message per session
    const msgs = await db
      .select()
      .from(chatMessages)
      .orderBy(desc(chatMessages.createdAt));

    // Group by sessionId+brandSlug, keep latest
    const map = new Map<string, typeof msgs[0]>();
    for (const m of msgs) {
      const key = `${m.sessionId}__${m.brandSlug}`;
      if (!map.has(key)) map.set(key, m);
    }

    // Count unread per session
    const unread = await db
      .select()
      .from(chatMessages)
      .where(and(eq(chatMessages.sender, "customer"), eq(chatMessages.isRead, false)));

    const unreadCount: Record<string, number> = {};
    for (const m of unread) {
      const key = `${m.sessionId}__${m.brandSlug}`;
      unreadCount[key] = (unreadCount[key] ?? 0) + 1;
    }

    const sessions = Array.from(map.values()).map((m) => ({
      sessionId: m.sessionId,
      brandSlug: m.brandSlug,
      senderName: m.senderName,
      lastMessage: m.message,
      lastSender: m.sender,
      lastAt: m.createdAt,
      unread: unreadCount[`${m.sessionId}__${m.brandSlug}`] ?? 0,
    }));

    return NextResponse.json(sessions);
  }

  if (!phone || !brand) {
    return NextResponse.json({ error: "phone and brand required" }, { status: 400 });
  }

  const msgs = await db
    .select()
    .from(chatMessages)
    .where(and(eq(chatMessages.sessionId, phone), eq(chatMessages.brandSlug, brand)))
    .orderBy(asc(chatMessages.createdAt));

  return NextResponse.json(msgs);
}

// POST /api/chat  → send message
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { phone, brand, sender, senderName, message } = body;

  if (!phone || !brand || !sender || !message?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Admin must be authenticated
  if (sender === "admin") {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [msg] = await db
    .insert(chatMessages)
    .values({
      sessionId: phone,
      brandSlug: brand,
      sender,
      senderName: senderName ?? "",
      message: message.trim(),
    })
    .returning();

  return NextResponse.json(msg, { status: 201 });
}

// PATCH /api/chat?phone=xxx&brand=xxx  → mark all as read
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const phone = req.nextUrl.searchParams.get("phone");
  const brand = req.nextUrl.searchParams.get("brand");
  if (!phone || !brand) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  await db
    .update(chatMessages)
    .set({ isRead: true })
    .where(and(eq(chatMessages.sessionId, phone), eq(chatMessages.brandSlug, brand), eq(chatMessages.sender, "customer")));

  return NextResponse.json({ ok: true });
}
