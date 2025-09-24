import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { userId, answers } = await request.json();

    if (!userId || !answers || !Array.isArray(answers)) {
      return Response.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Get all questions with their stream mappings
    const questions = await sql`
      SELECT id, stream_mapping FROM career_quiz_questions ORDER BY id
    `;

    // Calculate stream scores
    const streamScores = {};
    
    answers.forEach((answer, index) => {
      const question = questions[index];
      if (question && question.stream_mapping) {
        const mapping = question.stream_mapping[answer];
        if (mapping) {
          Object.entries(mapping).forEach(([streamId, points]) => {
            streamScores[streamId] = (streamScores[streamId] || 0) + points;
          });
        }
      }
    });

    // Find the stream with highest score
    let recommendedStreamId = null;
    let maxScore = 0;
    
    Object.entries(streamScores).forEach(([streamId, score]) => {
      if (score > maxScore) {
        maxScore = score;
        recommendedStreamId = parseInt(streamId);
      }
    });

    // Get stream details
    const streamDetails = await sql`
      SELECT * FROM streams WHERE id = ${recommendedStreamId}
    `;

    // Get colleges for this stream
    const colleges = await sql`
      SELECT name, location FROM colleges WHERE stream_id = ${recommendedStreamId}
      LIMIT 30
    `;

    // Get careers for this stream
    const careers = await sql`
      SELECT title, salary_range FROM careers WHERE stream_id = ${recommendedStreamId}
      LIMIT 30
    `;

    // Save quiz result
    await sql`
      INSERT INTO career_quiz_results (user_id, recommended_stream_id, quiz_data)
      VALUES (${userId}, ${recommendedStreamId}, ${JSON.stringify({ answers, streamScores })})
    `;

    return Response.json({
      recommendedStream: streamDetails[0],
      colleges,
      careers,
      streamScores
    }, { status: 200 });

  } catch (error) {
    console.error('Error submitting career quiz:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}