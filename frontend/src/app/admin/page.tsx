'use client'

import { useState } from 'react'

interface Feedback {
  id: number;
  feedback_type: string;
  content: string;
}

export default function Admin() {
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('http://localhost:8000/admin/feedback', {
      headers: {
        'Authorization': 'Basic ' + btoa(`admin:${password}`),
      },
    });
    if (response.ok) {
      const data = await response.json();
      setFeedback(data);
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold">Admin Login</h1>
        <form onSubmit={handleLogin} className="mt-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-700 rounded-lg p-2"
          />
          <button type="submit" className="ml-4 px-4 py-2 bg-primary rounded-lg">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Feedback</h1>
      <div className="space-y-4">
        {feedback.map((item) => (
          <div key={item.id} className="border-b border-gray-700 pb-4">
            <p className="font-bold">{item.feedback_type}</p>
            <p>{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
