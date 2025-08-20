import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { id: clerkId, fullName, emailAddresses } = await req.json();

  const email = emailAddresses && emailAddresses.length > 0 ? emailAddresses[0].emailAddress : null;

  if (!clerkId || !email || !fullName) {
    console.error('API /api/user: Missing required user data for sync:', { clerkId, fullName, email });
    return NextResponse.json({ success: false, error: 'Missing required user data for synchronization.' }, { status: 400 });
  }

  try {
    let [dbUser] = await db.select().from(usersTable).where(eq(usersTable.subID, clerkId));

    if (dbUser) {
      if (dbUser.name !== fullName || dbUser.email !== email) {
        console.log('API /api/user: User found by subID, updating name/email:', { old: dbUser.name, new: fullName });
        const [updatedUser] = await db
          .update(usersTable)
          .set({ name: fullName, email: email })
          .where(eq(usersTable.subID, clerkId))
          .returning();
        return NextResponse.json({ success: true, user: updatedUser, message: 'User updated (name/email).' }, { status: 200 });
      } else {
        console.log('API /api/user: User already exists by subID, no update needed.', dbUser);
        return NextResponse.json({ success: true, user: dbUser, message: 'User already synchronized.' }, { status: 200 });
      }
    } else {
      [dbUser] = await db.select().from(usersTable).where(eq(usersTable.email, email));

      if (dbUser) {
        console.log('API /api/user: User found by email, updating subID:', { oldUser: dbUser, newClerkId: clerkId });
        const [updatedUser] = await db
          .update(usersTable)
          .set({
            subID: clerkId,
            name: fullName,
          })
          .where(eq(usersTable.email, email))
          .returning();

        console.log('API /api/user: Existing user updated with new subID:', updatedUser);
        return NextResponse.json({ success: true, user: updatedUser, message: 'User subID updated.' }, { status: 200 });
      } else {
        console.log('API /api/user: Creating new user:', { name: fullName, email, subID: clerkId });
        const [newUser] = await db
          .insert(usersTable)
          .values({
            name: fullName,
            email: email,
            subID: clerkId,
            tokens: 3, 
            lastWeeklyClaimDate: null,
          })
          .returning();

        console.log('API /api/user: New user created successfully:', newUser);
        return NextResponse.json({ success: true, user: newUser, message: 'New user created.' }, { status: 201 }); 
      }
    }
  } catch (error) {
    console.error('API /api/user POST (user sync) failed:', error);

    if (error.code === '23505') {
      if (error.constraint_name === 'users_email_unique') {
        console.error('API /api/user: Duplicate email attempt:', email);
        return NextResponse.json({ success: false, error: 'A user with this email already exists. Try logging in.' }, { status: 409 }); 
      }
      if (error.constraint_name === 'users_subID_unique') {
        console.error('API /api/user: Duplicate subID attempt (unexpected):', clerkId);
        return NextResponse.json({ success: false, error: 'A user with this ID already exists (unexpected). Please contact support.' }, { status: 409 }); 
      }
    }
    return NextResponse.json({ success: false, error: 'Failed to synchronize user data due to a server error.' }, { status: 500 });
  }
}
