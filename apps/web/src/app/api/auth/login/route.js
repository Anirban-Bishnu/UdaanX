import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user by email and password
    const user = await sql`
      SELECT id, name, email, role, class_level, progress
      FROM users 
      WHERE email = ${email} AND password = ${password}
    `;

    if (user.length === 0) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    return Response.json({ 
      message: 'Login successful',
      user: user[0]
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}