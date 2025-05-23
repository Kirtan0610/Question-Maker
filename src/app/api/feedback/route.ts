import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { gameId, feedback } = await req.json()
    
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        feedback,
        feedbackAt: new Date()
      }
    })
    
    return NextResponse.json(updatedGame)
    
  } catch (error) {
    console.error('Feedback submission failed:', error)
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    )
  }
}
