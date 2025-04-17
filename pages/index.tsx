import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function Home() {
  const { data: session } = useSession()
  const [schedule, setSchedule] = useState<any[]>([])
  const [currentWeek, setCurrentWeek] = useState('')

  useEffect(() => {
    fetch('/api/schedule')
      .then((res) => res.json())
      .then((data) => {
        setSchedule(data.schedule)
        setCurrentWeek(data.currentWeek)
      })
  }, [])

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: 'auto' }}>
      <h1>🗓️ BinBuddy Schedule</h1>
      {!session && (
        <div>
          <p>Login to request swaps.</p>
          <button onClick={() => signIn()}>Sign in with Google</button>
        </div>
      )}
      <ul>
        {schedule.map((item, index) => (
          <li
            key={index}
            style={{
              marginBottom: 8,
              fontWeight: item.week === currentWeek ? 'bold' : 'normal',
              backgroundColor:
                item.week === currentWeek ? '#d9f9d9' : undefined,
              padding: 10,
              border: '1px solid #ccc',
              borderRadius: 5,
            }}>
            Week {item.week}: {item.family}
            {session?.user?.email === item.email &&
              item.week === currentWeek && (
                <SwapRequestForm
                  currentWeek={item.week}
                  requester={item.family}
                />
              )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function SwapRequestForm({
  currentWeek,
  requester,
}: {
  currentWeek: string
  requester: string
}) {
  const [target, setTarget] = useState('')
  const [status, setStatus] = useState('')

  const submitSwap = async () => {
    const res = await fetch('/api/swap-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetEmail: target,
        requester,
        week: currentWeek,
      }),
    })
    if (res.ok) setStatus('Request sent!')
    else setStatus('Failed to send')
  }

  return (
    <div style={{ marginTop: 10 }}>
      <input
        placeholder="Target email"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        style={{ padding: 4, marginRight: 6 }}
      />
      <button onClick={submitSwap}>Request Swap</button>
      <p>{status}</p>
    </div>
  )
}
