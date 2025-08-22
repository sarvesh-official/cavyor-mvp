'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
})

interface LoginResponse {
  message: string
  user: {
    id: string
    email: string
    role: string
  }
}

interface ApiError {
  error: string
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      email: '',
      password: ''
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true)
      setError(null)

      try {
        const validation = loginSchema.safeParse(value)
        if (!validation.success) {
          setError('Please check your input')
          return
        }

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(value),
        })

        if (response.ok) {
          const data: LoginResponse = await response.json()
          router.push('/')
        } else {
          const errorData: ApiError = await response.json()
          setError(errorData.error || 'Login failed')
        }
      } catch (err) {
        setError('An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-gray-300">Enter your credentials to access the admin dashboard</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-6"
          >
            <form.Field
              name="email"
              validators={{
                onChange: loginSchema.shape.email,
              }}
            >
              {(field) => (
                <div>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="admin@cavyor.in"
                    disabled={isLoading}
                  />
                  {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-red-400">
                      {typeof field.state.meta.errors[0] === 'string' 
                        ? field.state.meta.errors[0] 
                        : field.state.meta.errors[0]?.message || 'Validation error'}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: loginSchema.shape.password,
              }}
            >
              {(field) => (
                <div>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-red-400">
                      {typeof field.state.meta.errors[0] === 'string' 
                        ? field.state.meta.errors[0] 
                        : field.state.meta.errors[0]?.message || 'Validation error'}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            {/* <p className="text-sm text-gray-400">
              Default credentials: admin@cavyor.in / cavyorkapass
            </p> */}
          </div>
        </div>
      </div>
    </div>
  )
}
