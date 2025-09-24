import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const courses = await sql`
      SELECT c.*, u.name as teacher_name
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      ORDER BY c.created_at DESC
    `;

    return Response.json({ courses }, { status: 200 });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, description, teacherId } = await request.json();

    if (!title || !description || !teacherId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newCourse = await sql`
      INSERT INTO courses (title, description, teacher_id)
      VALUES (${title}, ${description}, ${teacherId})
      RETURNING *
    `;

    return Response.json({ 
      message: 'Course created successfully',
      course: newCourse[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating course:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}