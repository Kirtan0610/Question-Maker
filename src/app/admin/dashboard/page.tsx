"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"

interface User {
  id: string
  email: string
  createdAt: string
}

interface Quiz {
  id: string
  topic: string
  createdAt: string
  userId: string
  feedback: string | null
  feedbackAt: string | null
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      
    fetch('/api/admin/quizzes')
      .then(res => res.json())
      .then(data => setQuizzes(data))
  }, [])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email?.split('@')[0] || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quizzes</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Topic</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead>User ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell>{quiz.topic}</TableCell>
                <TableCell>
                  {quiz.feedback || 'No feedback yet'}
                  {quiz.feedbackAt && (
                    <span className="text-xs text-gray-500 block">
                      {new Date(quiz.feedbackAt).toLocaleString()}
                    </span>
                  )}
                </TableCell>
                <TableCell>{quiz.userId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
