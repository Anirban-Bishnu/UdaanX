import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user progress
    const progress = await sql`
      SELECT 
        up.*,
        l.title as lesson_title,
        c.title as course_title
      FROM user_progress up
      JOIN lessons l ON up.lesson_id = l.id
      JOIN courses c ON l.course_id = c.id
      WHERE up.user_id = ${userId}
      ORDER BY up.completed_at DESC
    `;

    // Get quiz results
    const quizResults = await sql`
      SELECT 
        qr.*,
        cq.question,
        l.title as lesson_title,
        c.title as course_title
      FROM quiz_results qr
      JOIN course_quizzes cq ON qr.quiz_id = cq.id
      JOIN lessons l ON cq.lesson_id = l.id
      JOIN courses c ON l.course_id = c.id
      WHERE qr.user_id = ${userId}
      ORDER BY qr.completed_at DESC
    `;

    // Get career quiz result
    const careerQuizResult = await sql`
      SELECT 
        cqr.*,
        s.name as stream_name,
        s.description as stream_description
      FROM career_quiz_results cqr
      JOIN streams s ON cqr.recommended_stream_id = s.id
      WHERE cqr.user_id = ${userId}
      ORDER BY cqr.completed_at DESC
      LIMIT 1
    `;

    return Response.json({ 
      progress,
      quizResults,
      careerQuizResult: careerQuizResult[0] || null
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching user progress:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, lessonId } = await request.json();

    if (!userId || !lessonId) {
      return Response.json({ error: 'User ID and Lesson ID are required' }, { status: 400 });
    }

    // Mark lesson as completed
    await sql`
      INSERT INTO user_progress (user_id, lesson_id, completed, completed_at)
      VALUES (${userId}, ${lessonId}, true, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, lesson_id) 
      DO UPDATE SET completed = true, completed_at = CURRENT_TIMESTAMP
    `;

    return Response.json({ message: 'Progress updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error updating progress:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}