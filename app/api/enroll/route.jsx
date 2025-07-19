import { db } from "@/config/db";
import { coursesTable, enrollmentsTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request) {
    const {courseId} = await request.json();
    const user = await currentUser();

    //checking course enrollment
    const enrollment = await db.select().from(enrollmentsTable).where(and(eq(
        enrollmentsTable.userEmail, user?.primaryEmailAddress?.emailAddress
    ), eq(        enrollmentsTable.cid, courseId
    )))

    if (enrollment.length == 0) {
        const result = await db.insert(enrollmentsTable).values({
            cid: courseId,
            userEmail: user?.primaryEmailAddress?.emailAddress,
        }).returning(enrollmentsTable);

        return NextResponse.json(result)
    }

    return NextResponse.json({ alreadyEnrolled: true });

}

export async function GET(request) {
    const user = await currentUser();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams?.get('courseId');
    if (courseId) {
        const result = await db.select().from(coursesTable)
            .innerJoin(enrollmentsTable, eq(coursesTable.cid, enrollmentsTable.cid))
            .where(and(eq(enrollmentsTable.cid, courseId), eq(enrollmentsTable.userEmail, user?.primaryEmailAddress?.emailAddress)));

        return NextResponse.json(result[0]);
    } else {
    // Fetching enrolled courses for the user
    const result = await db.select().from(coursesTable)
    .innerJoin(enrollmentsTable, eq(coursesTable.cid, enrollmentsTable.cid))
    .where(eq(enrollmentsTable.userEmail, user?.primaryEmailAddress?.emailAddress))
    .orderBy(desc(enrollmentsTable.id));

    return NextResponse.json(result);
     }
}

export async function PUT(request) 
{
   const {completedChapters, courseId} = await request.json();
   const user = await currentUser();

   const result = await db.update(enrollmentsTable)
   .set({
         completedChapters: completedChapters
   }).where(and(
       eq(enrollmentsTable.cid, courseId),
       eq(enrollmentsTable.userEmail, user?.primaryEmailAddress?.emailAddress)
   )).returning(enrollmentsTable);

   return NextResponse.json(result);
}