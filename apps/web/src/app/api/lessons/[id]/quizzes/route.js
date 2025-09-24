import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const quizzes = await sql`
      SELECT * FROM course_quizzes 
      WHERE lesson_id = ${id}
      ORDER BY id
    `;

    return Response.json({ quizzes }, { status: 200 });

  } catch (error) {
    console.error('Error fetching lesson quizzes:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}