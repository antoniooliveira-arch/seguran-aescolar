import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, schools, calls } from '@/db/schema';
import { SCHOOLS_SEED } from '@/types';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Check if schools already exist
    const existingSchools = await db.select().from(schools).limit(1);
    
    if (existingSchools.length > 0) {
      return NextResponse.json({ message: 'Database already seeded' });
    }

    // Seed schools
    await db.insert(schools).values(SCHOOLS_SEED);
    console.log('Schools seeded');

    // Create demo users with bcrypt hash for '123456'
    const hashedPassword = await bcrypt.hash('123456', 10);

    await db.insert(users).values([
      {
        name: 'Admin SME',
        email: 'admin@sme.gov.br',
        passwordHash: hashedPassword,
        role: 'admin' as const,
      },
    ]);
    console.log('Users seeded');

    // Get first school and user
    const firstSchool = await db.select().from(schools).limit(1);
    const firstUser = await db.select().from(users).limit(1);

    if (firstSchool.length > 0 && firstUser.length > 0) {
      // Create a demo call
      await db.insert(calls).values({
        number: 'NISE-250001',
        date: new Date(),
        schoolId: firstSchool[0].id,
        requester: 'João Silva',
        phone: '(11) 98765-4321',
        type: 'Vandalismo',
        priority: 'Alta',
        description: 'Pichação e quebra de vidros na fachada da escola durante a madrugada.',
        team: 'Equipe Tática Alpha',
        status: 'Aberto',
        responsible: 'Admin SME',
        createdBy: firstUser[0].id,
      });
      console.log('Demo call created');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully with demo data. Use emails above with password 123456' 
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
