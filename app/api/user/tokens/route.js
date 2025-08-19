// app/api/user/tokens/route.js
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request) { // Added 'request' parameter for consistency, though not strictly used here
  const user = await currentUser();

  // Scenario 1: User is not authenticated via Clerk.
  if (!user) {
    console.warn("API /api/user/tokens: Unauthorized access attempt - no Clerk user found.");
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Attempt to find the user in your database using their Clerk subID.
    const [dbUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.subID, user.id)); // match Clerk subID

    // Scenario 2: User is authenticated but not found in your database.
    // This can happen for new users before their first sync or if user data was manually deleted.
    if (!dbUser) {
      console.warn(`API /api/user/tokens: User with subID ${user.id} not found in database.`);
      // It's often good practice to return 0 tokens for a new user not yet in DB,
      // rather than a 404, depending on your app's flow.
      return NextResponse.json({ success: true, tokens: 0, message: "User not yet synchronized to database." }, { status: 200 });
      // Alternatively, if a 404 is truly desired for 'not in DB':
      // return NextResponse.json({ success: false, error: "User not found in database" }, { status: 404 });
    }

    // Scenario 3: User found, return their token balance.
    console.log(`API /api/user/tokens: User ${user.id} found, tokens: ${dbUser.tokens}`);
    return NextResponse.json({ success: true, tokens: dbUser.tokens }, { status: 200 });

  } catch (error) {
    // Scenario 4: A server-side error occurred during database query.
    console.error("API /api/user/tokens: Token fetch failed due to server error:", error);
    return NextResponse.json({ success: false, error: "Server error fetching tokens." }, { status: 500 });
  }
}
