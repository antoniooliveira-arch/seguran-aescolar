import { NextResponse } from 'next/server';
import { db } from '@/db';
import { calls, schools, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateCallNumber } from '@/lib/utils';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await db
      .select()
      .from(calls)
      .leftJoin(schools, eq(calls.schoolId, schools.id))
      .leftJoin(users, eq(calls.createdBy, users.id))
      .orderBy(desc(calls.createdAt));

    const formatted = result.map((row: any) => ({
      ...row.calls,
      school: row.schools || undefined,
      creator: row.users || undefined,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const callNumber = generateCallNumber();

    const [newCall] = await db.insert(calls).values({
      number: callNumber,
      date: new Date(),
      schoolId: body.schoolId ? Number(body.schoolId) : null,
      requester: body.requester,
      phone: body.phone || null,
      type: body.type,
      priority: body.priority || 'Média',
      description: body.description,
      team: body.team || null,
      status: 'Aberto',
      responsible: body.responsible || null,
      createdBy: body.createdBy ? Number(body.createdBy) : null,
    }).returning();

    return NextResponse.json({ success: true, call: newCall });
  } catch (error) {
    console.error('Error creating call:', error);
    return NextResponse.json({ error: 'Failed to create call' }, { status: 500 });
  }
}
