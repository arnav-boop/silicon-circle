'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          router.push('/')
        }
      } else {
        if (!username) {
          setError('Username is required')
          setLoading(false)
          return
        }
        const { error } = await signUp(email, password, username)
        if (error) {
          setError(error.message)
        } else {
          setError('Account created. Check your email for verification, then log in.')
          setIsLogin(true)
        }
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-8">
      <div className="card p-6 sm:p-8 w-full max-w-md">
        <p className="text-sm text-[var(--muted)] mb-1">{'>'} auth_module</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 glow">
          {isLogin ? 'login_' : 'register_'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm sm:text-base mb-1 text-[var(--muted)]">username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input text-base"
                placeholder="username"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm sm:text-base mb-1 text-[var(--muted)]">email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input text-base"
              placeholder="email@domain.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm sm:text-base mb-1 text-[var(--muted)]">password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input text-base"
              placeholder="********"
              required
            />
          </div>

          {error && (
            <p className="text-[var(--foreground)] text-base">! {error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-base py-3"
          >
            {loading ? 'processing...' : isLogin ? '[ login ]' : '[ register ]'}
          </button>
        </form>

        <p className="text-center mt-5 text-sm sm:text-base text-[var(--muted)]">
          {isLogin ? "no account? " : "has account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="link font-bold ml-1"
          >
            {isLogin ? 'register' : 'login'}
          </button>
        </p>
      </div>
    </div>
  )
}