import { useState } from 'react'

export default function JoinFamilyForm() {
  const [joinCode, setJoinCode] = useState('')
  const [message, setMessage] = useState('')

  const handleJoin = async () => {
    const res = await fetch('/api/join-family', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ joinCode }),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage('✅ Joined family!')
      // Optionally reload or redirect
    } else {
      setMessage(`❌ ${data.error}`)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: 'auto', textAlign: 'center' }}>
      <h2>Join Your Family</h2>
      <input
        type="text"
        placeholder="Enter code (e.g. oak-23)"
        value={joinCode}
        onChange={(e) => setJoinCode(e.target.value)}
        style={{ padding: '8px', width: '100%', marginBottom: '12px' }}
      />
      <button onClick={handleJoin} style={{ padding: '8px 16px' }}>
        Join
      </button>
      <p>{message}</p>
    </div>
  )
}
