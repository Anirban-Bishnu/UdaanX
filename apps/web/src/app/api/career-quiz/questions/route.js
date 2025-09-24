import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const questions = await sql`
      SELECT id, question, option_a, option_b, option_c, option_d
      FROM career_quiz_questions
      ORDER BY id
    `;

    return Response.json({ questions }, { status: 200 });

  } catch (error) {
    console.error('Error fetching career quiz questions:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}