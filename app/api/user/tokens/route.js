import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request) {
  const user = await currentUser();

  if (!user) {
    console.warn("API /api/user/tokens: Unauthorized access attempt - no Clerk user found.");
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [dbUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.subID, user.id));

    if (!dbUser) {
      console.warn(`API /api/user/tokens: User with subID ${user.id} not found in database.`);

      return NextResponse.json({ success: true, tokens: 0, message: "User not yet synchronized to database." }, { status: 200 });

    }

    console.log(`API /api/user/tokens: User ${user.id} found, tokens: ${dbUser.tokens}`);
    return NextResponse.json({ success: true, tokens: dbUser.tokens }, { status: 200 });

  } catch (error) {
    console.error("API /api/user/tokens: Token fetch failed due to server error:", error);
    return NextResponse.json({ success: false, error: "Server error fetching tokens." }, { status: 500 });
  }
}
