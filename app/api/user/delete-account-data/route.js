// pages/api/user/delete-account-data/route.js (POST)
// Deletes all user-related data from your Drizzle database.
// This route is called by the frontend before Clerk's user.destroy()

import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/config/db';
import { usersTable, coursesTable, enrollmentsTable, tokenTransactionsTable } from '@/config/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const user = await currentUser(); // Get the current authenticated Clerk user

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await req.json(); // Get the userId from the request body (should be Clerk's user.id)

  // Ensure the user trying to delete is the authenticated user
  if (user.id !== userId) {
    console.warn(`Security Warning: User ${user.id} attempted to delete data for user ${userId}.`);
    return NextResponse.json({ error: 'Forbidden: You can only delete your own data.' }, { status: 403 });
  }

  try {
    // --- Start Transaction for Atomicity ---
    // This ensures either all deletions succeed, or none do.
    await db.transaction(async (tx) => {
      // 1. Delete Token Transactions related to the user
      await tx
        .delete(tokenTransactionsTable)
        .where(eq(tokenTransactionsTable.userId, user.id)); // Assuming userId in tokenTransactionsTable is Clerk's user.id

      // 2. Delete Enrollments related to the user
      await tx
        .delete(enrollmentsTable)
        .where(eq(enrollmentsTable.userEmail, user.emailAddresses[0].emailAddress)); // Assuming userEmail in enrollmentsTable matches Clerk's primary email

      // 3. Delete Courses created by the user
      // IMPORTANT: If other users can be enrolled in these courses, you might not want to delete the course itself.
      // This current logic deletes courses directly associated with the user's email.
      await tx
        .delete(coursesTable)
        .where(eq(coursesTable.userEmail, user.emailAddresses[0].emailAddress));

      // 4. Finally, delete the user from your local usersTable
      await tx
        .delete(usersTable)
        .where(eq(usersTable.subID, user.id)); // Delete by Clerk's subID
    });

    console.log(`Successfully deleted all database data for user: ${userId}`);
    return NextResponse.json({ success: true, message: 'User data deleted from database.' });

  } catch (error) {
    console.error(`Error deleting database data for user ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to delete user data from database.' }, { status: 500 });
  }
}
