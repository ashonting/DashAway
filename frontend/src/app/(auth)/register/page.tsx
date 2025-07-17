'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('http://localhost:8000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (res.ok) {
      alert('Registration successful')
      router.push('/login')
    } else {
      const data = await res.json()
      alert(data.detail || 'Registration failed')
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 rounded-lg bg-gray-700"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 rounded-lg bg-gray-700"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" className="px-4 py-2 bg-primary rounded-lg">Register</button>
      </form>
    </div>
  )
}
