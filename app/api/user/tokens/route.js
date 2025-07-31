// /api/user/tokens/route.js
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [dbUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.subID, user.id)); // match Clerk subID

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ tokens: dbUser.tokens });
  } catch (error) {
    console.error("Token fetch failed:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
