// /api/user/transactions/route.jsx
import { db } from "@/config/db";
import { usersTable, tokensTransactionsTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!user.length) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const transactions = await db
    .select()
    .from(tokensTransactionsTable)
    .where(eq(tokensTransactionsTable.userId, user[0].id));

  return NextResponse.json({ transactions });
}
