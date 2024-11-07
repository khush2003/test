/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Confetti } from "./confetti"
import { useToast } from "@/hooks/use-toast"
import Markdown from 'react-markdown'
import { Toaster } from '@/components/ui/toaster'

const springTransition = { type: "spring", stiffness: 300, damping: 30 }

interface ExerciseContent {
  context?: string
  question?: string
  answerType: 'textarea' | 'input' | 'none'
}

interface Exercise {
  exercise_type: string
  exercise_content: ExerciseContent[]
  correct_answers: string[]
  is_instant_scored: boolean
  max_score: number
}

export default function TextWithInputViewer() {
  const [jsonInput, setJsonInput] = useState('')
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({})
  const [score, setScore] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [firstSubmission, setFirstSubmission] = useState<boolean>(true)
  const { toast } = useToast()

  const handleJsonSubmit = () => {
    try {
      const parsedExercise = JSON.parse(jsonInput)
      setExercise(parsedExercise)
      setUserAnswers({})
      setScore(null)
      setSubmitted(false)
      setFirstSubmission(true)
    } catch (error) {
      console.error("Invalid JSON:", error)
      alert("Invalid JSON. Please check your input.")
    }
  }

  const handleAnswerChange = (index: any, value: string) => {
    setUserAnswers(prev => ({ ...prev, [index]: value }))
    if (submitted) {
      setSubmitted(false)
    }
  }

  const handleSubmit = () => {
    if (exercise && exercise.exercise_type === 'text_with_input') {
      let correctCount = 0
      let answersString = ""

      exercise.exercise_content.forEach((content, index) => {
        const userAnswer = userAnswers[index] || ''
        const isCorrect = exercise.correct_answers[index] ? userAnswer.trim().toLowerCase() === exercise.correct_answers[index].trim().toLowerCase() : true

        if (isCorrect) correctCount++

        if (content.question) answersString += `**Question**: ${content.question} \n`
        if (content.context) answersString += `**Context**: ${content.context}\n`
        if (content.answerType != 'none') answersString += `**Student's Answer**: ${userAnswer}\n`
        if (exercise.is_instant_scored && content.answerType != 'none') answersString += `**Is Correct**: ${isCorrect}\n`
        answersString += "\n"
      })

      console.log("Student's Answers:\n", answersString)
      setSubmitted(true)
      if (exercise.is_instant_scored) {
        const scorePercentage = (correctCount / exercise.exercise_content.length) * 100
        const finalScore = Math.round((scorePercentage / 100) * exercise.max_score)
        setScore(finalScore)
        
        if (firstSubmission) {
          toast({
            title: "Answers Submitted!",
            description: `You've earned ${finalScore} out of ${exercise.max_score} points (${scorePercentage.toFixed(2)}%)!`,
            duration: 3000,
          })
          setFirstSubmission(false)
        }

        if (finalScore == exercise.max_score) {
          setShowConfetti(true)
          const timer = setTimeout(() => setShowConfetti(false), 5000)
          return () => clearTimeout(timer)
        }
      }
      
    }
  }

  const renderExerciseContent = () => {
    return (
      <div className="space-y-6">
        {exercise && exercise.exercise_content.map((content, index) => (
          <Card key={index} className="rounded-xl overflow-hidden">
            <CardContent className="p-6 bg-green-50">
              <div className="mb-4">
                {content.context && <Markdown className="text-lg flex flex-col gap-3 mt-2">{content.context}</Markdown>}
                {content.question && <h3 className="text-lg font-semibold mt-4">{content.question}</h3>}
              </div>
              {content.answerType !== 'none' && (
                <div className="space-y-2">
                  <Label htmlFor={`answer-${index}`}>Your Answer</Label>
                  {content.answerType === 'textarea' ? (
                    <Textarea
                      id={`answer-${index}`}
                      value={userAnswers[index] || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      className="bg-white dark:bg-gray-800"
                    />
                  ) : (
                    <Input
                      id={`answer-${index}`}
                      value={userAnswers[index] || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      className="bg-white dark:bg-gray-800"
                    />
                  )}
                </div>
              )}
              {submitted && exercise.is_instant_scored && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={springTransition}
                  className="mt-4"
                >
                  {exercise.correct_answers[index] && userAnswers[index]?.trim().toLowerCase() === exercise.correct_answers[index].trim().toLowerCase() ? (
                    <Alert className="bg-green-100 border-green-500 text-green-800">
                      <AlertTitle>Correct!</AlertTitle>
                      <AlertDescription>Great job!</AlertDescription>
                    </Alert>
                  ) : exercise.correct_answers[index] ? (
                    <Alert className="bg-red-100 border-red-500 text-red-800">
                      <AlertTitle>Incorrect</AlertTitle>
                      <AlertDescription>Try again!</AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="bg-blue-100 border-blue-500 text-blue-800">
                      <AlertTitle>Answer Submitted</AlertTitle>
                      <AlertDescription>Your answer has been recorded.</AlertDescription>
                    </Alert>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="container mx-auto p-4"
    >
      {!exercise && (
        <Card className="w-full max-w-4xl mx-auto mb-8 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
          <CardContent className="p-6">
            <Textarea
              placeholder="Paste your exercise JSON here"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="min-h-[200px] mb-4 bg-white dark:bg-gray-800 rounded-lg"
            />
            <Button onClick={handleJsonSubmit} className="w-full text-lg py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transition-all duration-300 rounded-lg">
              Start the Exercise
            </Button>
          </CardContent>
        </Card>
      )}

      <AnimatePresence>
        <Toaster />
        {exercise && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={springTransition}
          >
            <div>
              <CardContent className="p-6">
                {renderExerciseContent()}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={springTransition}
                  className="mt-6"
                >
                  <Button onClick={handleSubmit} className="w-full text-lg py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 rounded-lg">
                    {submitted ? "Resubmit Answers" : "Submit Answers"}
                  </Button>
                </motion.div>
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={springTransition}
                    className="mt-4"
                  >
                    <Alert className="bg-blue-100 border-blue-500 text-blue-800 rounded-lg">
                      <AlertTitle className="text-xl font-bold">
                        {exercise.is_instant_scored ? "Your Score" : "Answers Submitted"}
                      </AlertTitle>
                      <AlertDescription className="text-lg">
                        {exercise.is_instant_scored
                          ? `You scored ${score ?? 0} out of ${exercise.max_score} (${(((score ?? 0) / exercise.max_score) * 100).toFixed(2)}%)`
                          : "Your answers have been recorded. Your teacher will review and score them."}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </CardContent>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {showConfetti && <Confetti />}
    </motion.div>
  )
}