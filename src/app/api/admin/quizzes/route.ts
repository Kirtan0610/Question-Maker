import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const games = await prisma.game.findMany({
    select: {
      id: true,
      topic: true,
      timeStarted: true,
      userId: true,
      feedback: true,
      feedbackAt: true
    },
    orderBy: {
      timeStarted: 'desc'
    }
  })
  return NextResponse.json(games)
}
