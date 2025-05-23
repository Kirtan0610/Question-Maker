import { strict_output } from "@/lib/gpt";
import { getAuthSession } from "@/lib/nextauth";
import { getQuestionsSchema } from "@/schemas/questions";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const runtime = "nodejs";
export const maxDuration = 500;

export async function POST(req: Request, res: Response) {
  try {
    const session = await getAuthSession();
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: "You must be logged in to create a game." },
    //     {
    //       status: 401,
    //     }
    //   );
    // }
    
    const body = await req.json();
    const { amount, topic, type, difficulty } = getQuestionsSchema.parse(body);
    
    let questions: any;
    
    if (type === "open_ended") {
      questions = await strict_output(
        "You are a professional quiz creator specialized in generating accurate and clear question-answer pairs.",
        new Array(amount).fill(
          `Generate a challenging (${difficulty} difficulty level) open-ended question about ${topic}. The answer should be clear and concise (max 15 words).`
        ),
        {
          question: "question",
          answer: "answer with max length of 15 words",
        },
        "",
        false,
        "gemini-1.5-pro",
        0.5,
        1,
        true
      );
    } else if (type === "mcq") {

      let rawQuestions = await strict_output(
        "You are a professional quiz creator. Generate multiple-choice questions with exactly four options where: 1. Only one option is correct 2. The answer MUST appear as one of the four options 3. All options are concise (max 15 words)",
        new Array(amount).fill(
          `Create a challenging ${difficulty} difficulty level multiple-choice question about ${topic}. Include four options where:
            1. Only one correct answer exists
            2. All options are clear and concise (15 words max)
            3. The correct answer MUST appear as one of the options
            4. Options are diverse and plausible`
        ),
        {
            question: "question",
            option1: "option1 (max 15 words)",
            option2: "option2 (max 15 words)",
            option3: "option3 (max 15 words)",
            option4: "option4 (max 15 words)",
            answer: "exact text of the correct option (must match one of the options)"
        },
        "",
        false,
        "gemini-1.5-pro",
        0.4,  // Slightly higher temperature for creativity
        1,
        true
    );
      
      // Post-process to ensure the correct answer is one of the options
      questions = rawQuestions.map((q: any) => {
        // Create a copy of the question
        const processedQ = { ...q };
        
        // Check if the answer is already one of the options
        const options = [q.option1, q.option2, q.option3, q.option4];
        const answerIsAnOption = options.some(option => 
          option.toLowerCase().trim() === q.answer.toLowerCase().trim()
        );
        
        // If the answer is not one of the options, replace a random option with the answer
        if (!answerIsAnOption) {
          const randomOptionIndex = Math.floor(Math.random() * 4) + 1;
          processedQ[`option${randomOptionIndex}`] = q.answer;
        }
        
        return processedQ;
      });
    }
    
    // Safety check to ensure we have valid questions
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      console.error("Failed to generate valid questions");
      return NextResponse.json(
        { error: "Failed to generate questions. Please try again." },
        { status: 500 }
      );
    }
    
    // Log the successfully generated questions for debugging
    console.log("Successfully generated questions:", JSON.stringify(questions));
    
    return NextResponse.json(
      {
        questions: questions,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues },
        {
          status: 400,
        }
      );
    } else {
      console.error("Question generation error:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred while generating questions." },
        {
          status: 500,
        }
      );
    }
  }
}
