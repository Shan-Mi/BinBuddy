// pages/auth/signin.tsx
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/router'

const SignInPage = () => {
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await signIn('email', { email, redirect: false })

    if (res?.error) {
      setError(res.error)
    } else {
      // You can handle redirection after sign-in success
      router.push('/dashboard') // Example redirection
    }

    setLoading(false)
  }

  return (
    <div className="container">
      <h1>Sign in to your account</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Magic Link'}
        </button>
      </form>

      <style jsx>{`
        .container {
          max-width: 400px;
          margin: 0 auto;
          padding: 2rem;
          background: #f9f9f9;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        label {
          font-size: 1rem;
        }

        input {
          padding: 0.8rem;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 5px;
        }

        button {
          padding: 1rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.2s;
        }

        button:disabled {
          background-color: #ccc;
        }

        button:hover:not(:disabled) {
          background-color: #005bb5;
        }
      `}</style>
    </div>
  )
}

export default SignInPage
