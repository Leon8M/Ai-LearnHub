// app/api/user/route.jsx
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  // Assuming the request body contains Clerk user data:
  // { id: clerkUserId, fullName: "User Name", emailAddresses: [{ emailAddress: "user@example.com" }] }
  const { id: clerkId, fullName, emailAddresses } = await req.json();

  const email = emailAddresses && emailAddresses.length > 0 ? emailAddresses[0].emailAddress : null;

  // Basic validation
  if (!clerkId || !email || !fullName) {
    console.error('API /api/user: Missing required user data for sync:', { clerkId, fullName, email });
    return NextResponse.json({ success: false, error: 'Missing required user data for synchronization.' }, { status: 400 });
  }

  try {
    // 1. **Primary Check: Find user by Clerk's subID.**
    //    This is the most reliable way to identify an existing user synced from Clerk.
    let [dbUser] = await db.select().from(usersTable).where(eq(usersTable.subID, clerkId));

    if (dbUser) {
      // User found by Clerk's subID. They are already in our database.
      // Optional: Update name/email if they've changed in Clerk
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
      // User NOT found by Clerk's subID. Now, try by email.
      // 2. **Fallback Check: Try to find user by email.**
      [dbUser] = await db.select().from(usersTable).where(eq(usersTable.email, email));

      if (dbUser) {
        // User found by email but not by their current Clerk subID.
        // This implies their subID needs to be updated in our database.
        console.log('API /api/user: User found by email, updating subID:', { oldUser: dbUser, newClerkId: clerkId });
        const [updatedUser] = await db
          .update(usersTable)
          .set({
            subID: clerkId, // Update with the new Clerk subID
            name: fullName, // Also update name in case it changed
            // email: email, // Email should already be correct if found by email
          })
          .where(eq(usersTable.email, email)) // Update based on email
          .returning();

        console.log('API /api/user: Existing user updated with new subID:', updatedUser);
        return NextResponse.json({ success: true, user: updatedUser, message: 'User subID updated.' }, { status: 200 });
      } else {
        // 3. **If still not found by subID or email, then it's a truly new user.**
        console.log('API /api/user: Creating new user:', { name: fullName, email, subID: clerkId });
        const [newUser] = await db
          .insert(usersTable)
          .values({
            name: fullName,
            email: email,
            subID: clerkId, // **CRUCIAL: Explicitly pass Clerk's ID here**
            tokens: 3, // Default tokens
            lastWeeklyClaimDate: null, // As per schema's nullable varchar
          })
          .returning(); // Return the newly inserted row

        console.log('API /api/user: New user created successfully:', newUser);
        return NextResponse.json({ success: true, user: newUser, message: 'New user created.' }, { status: 201 }); // 201 Created
      }
    }
  } catch (error) {
    console.error('API /api/user POST (user sync) failed:', error);

    // Provide more specific error messages for unique constraint violations
    if (error.code === '23505') { // PostgreSQL unique violation error code
      if (error.constraint_name === 'users_email_unique') {
        console.error('API /api/user: Duplicate email attempt:', email);
        return NextResponse.json({ success: false, error: 'A user with this email already exists. Try logging in.' }, { status: 409 }); // 409 Conflict
      }
      if (error.constraint_name === 'users_subID_unique') {
        console.error('API /api/user: Duplicate subID attempt (unexpected):', clerkId);
        return NextResponse.json({ success: false, error: 'A user with this ID already exists (unexpected). Please contact support.' }, { status: 409 }); // 409 Conflict
      }
    }
    return NextResponse.json({ success: false, error: 'Failed to synchronize user data due to a server error.' }, { status: 500 });
  }
}
