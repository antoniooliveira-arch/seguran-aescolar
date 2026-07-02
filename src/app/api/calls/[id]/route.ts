import { NextResponse } from 'next/server';
import { db } from '@/db';
import { calls, schools } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, any> = {};
    if (body.status) updateData.status = body.status;
    if (body.report) updateData.report = body.report;
    if (body.opinion) updateData.opinion = body.opinion;
    if (body.closingDate) updateData.closingDate = new Date(body.closingDate);
    if (body.closingResponsible) updateData.closingResponsible = body.closingResponsible;
    if (body.responsible) updateData.responsible = body.responsible;
    if (body.team) updateData.team = body.team;
    updateData.updatedAt = new Date();

    const [updated] = await db.update(calls)
      .set(updateData)
      .where(eq(calls.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    const [withSchool] = await db
      .select()
      .from(calls)
      .leftJoin(schools, eq(calls.schoolId, schools.id))
      .where(eq(calls.id, Number(id)));

    const result = {
      ...withSchool.calls,
      school: withSchool.schools || undefined,
    };

    return NextResponse.json({ success: true, call: result });
  } catch (error) {
    console.error('Error updating call:', error);
    return NextResponse.json({ error: 'Failed to update call' }, { status: 500 });
  }
}
