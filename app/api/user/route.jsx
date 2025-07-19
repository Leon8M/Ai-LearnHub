// /api/user/route.jsx
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { email, name, subID } = await req.json();

  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (users.length === 0) {
    const result = await db
      .insert(usersTable)
      .values({
        email,
        name,
        subID,
        tokens: 3
      })
      .returning();

    console.log("User created:", result);
    return NextResponse.json(result[0]);
  }

  return NextResponse.json(users[0]);
}
