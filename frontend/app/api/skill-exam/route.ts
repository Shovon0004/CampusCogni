import { NextRequest, NextResponse } from "next/server"
// Use Groq API only for MCQ generation
async function getMCQQuestions(skill: string) {
  const prompt = `Generate 10 multiple-choice questions (MCQ) for the skill '${skill}'. Each question must have 4 options and specify the correct option index (0-based). Respond ONLY with a valid JSON array, no explanation, no markdown, no code block, no extra text. Example: [{"question":"...","options":["A","B","C","D"],"correctIndex":0}, ...]`;
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error("GROQ_API_KEY is not set in environment variables");
  const groqPrompt = prompt;
  const groqRes = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: groqPrompt }],
        max_tokens: 2048,
        temperature: 0.7
      })
    }
  );
  const groqData = await groqRes.json();
  let groqText = groqData.choices?.[0]?.message?.content || "";
  groqText = groqText.trim();
  console.log("Groq raw response:", groqText);
  if (groqText.startsWith('```')) {
    groqText = groqText.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
  }
  const groqMatch = groqText.match(/\[\s*{[\s\S]*?}\s*\]/);
  if (!groqMatch) {
    console.error("No JSON array found in Groq response.");
    throw new Error("No JSON array found in Groq");
  }
  const groqArray = groqMatch[0];
  console.log("Groq extracted JSON array:", groqArray);
  const groqQuestions = JSON.parse(groqArray);
  if (Array.isArray(groqQuestions) && groqQuestions.length === 10) return groqQuestions;
  throw new Error("Groq did not return 10 questions");
}



// Use Groq API to evaluate answers
async function evaluateGroqAnswers(skill: string, questions: any[], answers: number[]): Promise<boolean> {
  if (!Array.isArray(answers) || answers.length !== 10) return false;
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error("GROQ_API_KEY is not set in environment variables");
  const evalPrompt = `Given the following MCQ questions for the skill '${skill}' and the user's selected option indices, return true if at least 7 answers are correct, otherwise false.\nQuestions: ${JSON.stringify(questions)}\nUserAnswers: ${JSON.stringify(answers)}`;
  const groqRes = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: evalPrompt }],
        max_tokens: 256,
        temperature: 0.2
      })
    }
  );
  const groqData = await groqRes.json();
  let groqText = groqData.choices?.[0]?.message?.content || "";
  groqText = groqText.trim().toLowerCase();
  // Accepts 'true' anywhere in the response as pass
  return groqText.includes("true");
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { skill, answers } = body;

  if (!skill) {
    return NextResponse.json({ error: "Skill is required" }, { status: 400 });
  }

  if (!answers) {
    // Generate MCQs using Groq
    const questions = await getMCQQuestions(skill);
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Failed to generate questions. Please try again later." }, { status: 500 });
    }
    // Don't send correctIndex to frontend
    const questionsForUser = questions.map(({ question, options }) => ({ question, options }));
    return NextResponse.json({ questions: questionsForUser });
  } else {
    // Evaluate answers using Groq
    // The frontend must send back the same questions array for evaluation
    const { questions } = body;
    if (!questions || !Array.isArray(questions) || questions.length !== 10) {
      return NextResponse.json({ error: "Questions array required for evaluation" }, { status: 400 });
    }
    const passed = await evaluateGroqAnswers(skill, questions, answers);
    return NextResponse.json({ passed });
  }
}