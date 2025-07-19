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
        const result = await db.select().from(coursesTable)
        .where(sql`${coursesTable.courseContent}::jsonb != '{}' ::jsonb`);;
        console.log("Course details:", result);
        return NextResponse.json(result);
    }

    if (courseId) {
        const result = await db.select().from(coursesTable).where(eq(coursesTable.cid, courseId));
        console.log("Course details:", result);
        return NextResponse.json(JSON.parse(JSON.stringify(result[0])));
        
    } else{
        const result = await db.select().from(coursesTable).where(eq(coursesTable.userEmail, user?.primaryEmailAddress?.emailAddress)).orderBy(coursesTable.id);
        console.log("Course details:", result);
        return NextResponse.json(result)
    }

    
    

}