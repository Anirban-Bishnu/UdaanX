import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Get course details
    const course = await sql`
      SELECT c.*, u.name as teacher_name
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.id = ${id}
    `;

    if (course.length === 0) {
      return Response.json({ error: 'Course not found' }, { status: 404 });
    }

    // Get lessons for this course
    const lessons = await sql`
      SELECT * FROM lessons 
      WHERE course_id = ${id}
      ORDER BY lesson_order
    `;

    return Response.json({ 
      course: course[0],
      lessons
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching course:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}