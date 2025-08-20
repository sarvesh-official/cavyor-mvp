'use client'

import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { useState } from 'react'

const tenantSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Please enter at least two characters')
    .max(64, 'Tenant name must not exceed 64 characters')
})

interface CreateTenantResponse {
  tenant: {
    id: string
    name: string
    slug: string
    status: string
    createdAt: string
  }
  urlHint: string
}

interface ApiError {
  error: string
}

export default function Home() {
  const [createdTenant, setCreatedTenant] = useState<CreateTenantResponse | null>(null)

  const createTenantMutation = useMutation({
    mutationFn: async (data: { name: string }): Promise<CreateTenantResponse> => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData: ApiError = await response.json()
        throw new Error(errorData.error || 'Internal server error')
      }

      return response.json()
    },
    onSuccess: (data) => {
      setCreatedTenant(data)
      form.reset()
    },
  })

  const form = useForm({
    defaultValues: {
      name: '',
    },
    onSubmit: async ({ value }) => {
      const validation = tenantSchema.safeParse(value)
      if (!validation.success) {
        return
      }
      
      createTenantMutation.mutate(value)
    },
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="relative max-w-lg mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Cavyor
          </h1>
          <p className="text-gray-400 text-lg">Multi-Tenant Architecture</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Create New Tenant</h2>
            <p className="text-gray-300">Set up your isolated workspace in seconds</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <form.Field
              name="name"
              validators={{
                onChange: tenantSchema.shape.name,
              }}
            >
              {(field) => (
                <div className="mb-6">
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-300 mb-3">
                    Tenant Name
                  </label>
                  <div className="relative">
                    <input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter your organization name"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                    <div className="mt-2 flex items-center space-x-2">
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-400">
                        {typeof field.state.meta.errors[0] === 'string' 
                          ? field.state.meta.errors[0] 
                          : field.state.meta.errors[0]?.message || 'Validation error'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </form.Field>

            <button
              type="submit"
              disabled={createTenantMutation.isPending}
              className="group relative w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center">
                {createTenantMutation.isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Tenant...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Tenant
                  </>
                )}
              </span>
            </button>

            {createTenantMutation.error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-400">
                    {createTenantMutation.error.message}
                  </p>
                </div>
              </div>
            )}
          </form>

          {createdTenant && (
            <div className="mt-8 p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl shadow-2xl backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-3 mr-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Tenant Created! 🎉
                  </h2>
                  <p className="text-emerald-300">Your workspace is ready to use</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-300 uppercase tracking-wide flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Tenant Slug
                    </span>
                    <button
                      onClick={() => copyToClipboard(createdTenant.tenant.slug)}
                      className="px-3 py-1.5 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg transition-colors font-medium border border-emerald-500/30"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <code className="block px-4 py-3 bg-slate-900/50 text-emerald-400 rounded-lg text-lg font-mono font-bold border border-emerald-500/20">
                    {createdTenant.tenant.slug}
                  </code>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-300 uppercase tracking-wide flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Local Access
                    </span>
                    <button
                      onClick={() => copyToClipboard(`http://${createdTenant.tenant.slug}.localhost:3001`)}
                      className="px-3 py-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors font-medium border border-blue-500/30"
                    >
                      🔗 Copy URL
                    </button>
                  </div>
                  <code className="block px-4 py-3 bg-slate-900/50 text-blue-400 rounded-lg text-sm font-mono break-all border border-blue-500/20">
                    http://{createdTenant.tenant.slug}.localhost:3001
                  </code>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-300 uppercase tracking-wide flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                      Production URL
                    </span>
                    <button
                      onClick={() => copyToClipboard(`https://${createdTenant.urlHint}`)}
                      className="px-3 py-1.5 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors font-medium border border-purple-500/30"
                    >
                      🌐 Copy
                    </button>
                  </div>
                  <code className="block px-4 py-3 bg-slate-900/50 text-purple-400 rounded-lg text-sm font-mono break-all border border-purple-500/20">
                    https://{createdTenant.urlHint}
                  </code>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-start">
                  <div className="bg-amber-500/20 rounded-lg p-2 mr-3">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-300 mb-2">Ready to Launch!</p>
                    <p className="text-xs text-amber-200/80 mb-3">
                      Your tenant workspace is live and ready. Click below to visit your dashboard.
                    </p>
                    <a 
                      href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') 
                        ? `http://${createdTenant.tenant.slug}.localhost:3001` 
                        : `https://${createdTenant.tenant.slug}-${window.location.hostname.split('.')[0]}.vercel.app`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Visit Dashboard
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setCreatedTenant(null)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 font-medium border border-white/20 hover:border-white/30 backdrop-blur-sm"
                >
                  Create Another Tenant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
