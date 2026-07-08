import { neon } from '@neondatabase/serverless';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('DATABASE_URL is not set');
      return new Response(JSON.stringify({ error: 'Database connection configuration missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const sql = neon(databaseUrl);

    // Insert answers into canopy_ground_check table
    await sql`
      INSERT INTO canopy_ground_check (
        email, role, domains, powers, first_look, barriers, build_call, matching, blog, launch, pay, wish
      ) VALUES (
        ${body.email},
        ${body.role},
        ${body.domains || []},
        ${body.powers || []},
        ${body.firstLook},
        ${body.barriers || []},
        ${body.buildCall},
        ${body.matching},
        ${body.blog},
        ${body.launch},
        ${body.pay},
        ${body.wish}
      )
    `;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Submission failed:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to submit' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
