import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { name, email, password, role, class_level } = await request.json();

    // Validate required fields
    if (!name || !email || !password || !role) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate role
    if (!['student', 'teacher'].includes(role)) {
      return Response.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Validate class level for students
    if (role === 'student' && (!class_level || ![10, 12].includes(class_level))) {
      return Response.json({ error: 'Students must select class 10 or 12' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return Response.json({ error: 'User already exists with this email' }, { status: 400 });
    }

    // Create new user
    const newUser = await sql`
      INSERT INTO users (name, email, password, role, class_level)
      VALUES (${name}, ${email}, ${password}, ${role}, ${role === 'teacher' ? null : class_level})
      RETURNING id, name, email, role, class_level, progress
    `;

    return Response.json({ 
      message: 'User registered successfully',
      user: newUser[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}