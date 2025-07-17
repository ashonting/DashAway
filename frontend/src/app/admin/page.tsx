'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Feedback {
  id: number
  feedback_type: string
  content: string
}

export default function Admin() {
  const router = useRouter()
  const [feedback, setFeedback] = useState<Feedback[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetch('http://localhost:8000/admin/feedback', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(async res => {
      if (res.ok) {
        setFeedback(await res.json())
      } else {
        router.push('/login')
      }
    })
  }, [router])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Feedback</h1>
      <div className="space-y-4">
        {feedback.map(item => (
          <div key={item.id} className="border-b border-gray-700 pb-4">
            <p className="font-bold">{item.feedback_type}</p>
            <p>{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
