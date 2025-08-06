import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, ne, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams?.get('courseId');
    const user = await currentUser();

    if (courseId === 'all') {
        // --- FIX START ---
        // Removed the .where() clause to display all courses,
        // regardless of whether their content is fully generated yet.
        const result = await db.select().from(coursesTable);
        // --- FIX END ---
        
        console.log("Course details for 'all' courses:", result); // Updated log for clarity
        return NextResponse.json(result);
    }

    if (courseId) {
        const result = await db.select().from(coursesTable).where(eq(coursesTable.cid, courseId));
        console.log("Course details for specific course:", result); // Updated log for clarity
        // Ensure result[0] is handled gracefully if not found
        return NextResponse.json(result[0] ? JSON.parse(JSON.stringify(result[0])) : null); 
    } else {
        // This branch is for "Your Courses" on the dashboard, showing only user's courses
        const result = await db.select().from(coursesTable)
            .where(eq(coursesTable.userEmail, user?.primaryEmailAddress?.emailAddress))
            .orderBy(coursesTable.id);
        console.log("Course details for user's courses:", result); // Updated log for clarity
        return NextResponse.json(result);
    }
}
