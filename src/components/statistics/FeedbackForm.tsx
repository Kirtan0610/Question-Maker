"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function FeedbackForm({ gameId }: { gameId: string }) {
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback.trim()) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId, feedback }),
      })

      if (!response.ok) throw new Error('Failed to submit feedback')
      
      toast({
        title: "Feedback submitted!",
        description: "Thank you for your input!",
      })
      setFeedback('')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6 mt-8">
      <h3 className="text-lg font-semibold mb-4">Share your feedback</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={feedback}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
          placeholder="How was your quiz experience? What can we improve?"
          className="min-h-[100px]"
        />
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </form>
    </Card>
  )
}
