'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getTenantUrl } from '@/lib/utils'

const tenantSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Please enter at least two characters')
    .max(64, 'Tenant name must not exceed 64 characters')
})

interface Tenant {
  id: string
  name: string
  slug: string
  status: string
  createdAt: string
}

interface CreateTenantResponse {
  tenant: Tenant
  urlHint: string
}

interface ApiError {
  error: string
}

export default function AdminDashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createdTenant, setCreatedTenant] = useState<CreateTenantResponse | null>(null)
  const queryClient = useQueryClient()
  const router = useRouter()

  // Fetch all tenants
  const { data: tenantsData, isLoading, error } = useQuery({
    queryKey: ['tenants'],
    queryFn: async (): Promise<{ tenants: Tenant[] }> => {
      const response = await fetch('/api/admin/tenants')
      if (!response.ok) {
        throw new Error('Failed to fetch tenants')
      }
      return response.json()
    }
  })

  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: async (data: { name: string }): Promise<CreateTenantResponse> => {
      const response = await fetch('/api/admin/tenants', {
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
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      setCreatedTenant(data)
      form.reset()
      setShowCreateForm(false)
    },
  })

  // Update tenant status mutation
  const updateTenantStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/admin/tenants/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorData: ApiError = await response.json()
        throw new Error(errorData.error || 'Internal server error')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
  })

  // Delete tenant mutation
  const deleteTenantMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/tenants/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData: ApiError = await response.json()
        throw new Error(errorData.error || 'Internal server error')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
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

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Logout failed')
      }
      return response.json()
    },
    onSuccess: () => {
      router.push('/login')
    },
  })

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-3 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Super Admin Dashboard
                  </h1>
                  <p className="text-gray-400">Manage all tenants and system settings</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {showCreateForm ? 'Cancel' : 'Add Tenant'}
                  </span>
                </button>
                
                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center">
                    {logoutMutation.isPending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing out...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-3 mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Tenants</p>
                  <p className="text-2xl font-bold text-white">{tenantsData?.tenants?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-3 mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Active</p>
                  <p className="text-2xl font-bold text-white">
                    {tenantsData?.tenants?.filter(t => t.status === 'active').length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-3 mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Inactive</p>
                  <p className="text-2xl font-bold text-white">
                    {tenantsData?.tenants?.filter(t => t.status === 'inactive').length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-3 mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Suspended</p>
                  <p className="text-2xl font-bold text-white">
                    {tenantsData?.tenants?.filter(t => t.status === 'suspended').length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Create Tenant Form */}
          {showCreateForm && (
            <div className="mb-8 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Create New Tenant</h2>
              
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
                          placeholder="Enter organization name"
                        />
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
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center">
                    {createTenantMutation.isPending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </div>
          )}

          {/* Tenants List */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20">
              <h2 className="text-2xl font-semibold text-white">All Tenants</h2>
              <p className="text-gray-400 mt-1">
                {tenantsData?.tenants?.length || 0} tenant{tenantsData?.tenants?.length !== 1 ? 's' : ''} total
              </p>
            </div>

            {isLoading && (
              <div className="p-8 text-center">
                <div className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-white text-lg">Loading tenants...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-8 text-center">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-400">Failed to load tenants</span>
                  </div>
                </div>
              </div>
            )}

            {tenantsData?.tenants && tenantsData.tenants.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Tenant
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {tenantsData.tenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-white font-medium">{tenant.name}</div>
                            <div className="text-gray-400 text-sm">{tenant.id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <code className="bg-slate-900/50 text-emerald-400 px-2 py-1 rounded text-sm font-mono">
                              {tenant.slug}
                            </code>
                            <button
                              onClick={() => copyToClipboard(tenant.slug)}
                              className="text-gray-400 hover:text-white transition-colors"
                              title="Copy slug"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <select
                              value={tenant.status}
                              onChange={(e) => updateTenantStatusMutation.mutate({ id: tenant.id, status: e.target.value })}
                              disabled={updateTenantStatusMutation.isPending}
                              className={`appearance-none inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border border-transparent cursor-pointer transition-all duration-200 ${
                                tenant.status === 'active' 
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30' 
                                  : tenant.status === 'inactive'
                                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30'
                                  : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                              } ${updateTenantStatusMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <option value="active" className="bg-slate-800 text-green-400">🟢 Active</option>
                              <option value="inactive" className="bg-slate-800 text-yellow-400">🟡 Inactive</option>
                              <option value="suspended" className="bg-slate-800 text-red-400">🔴 Suspended</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-sm">
                          {formatDate(tenant.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <a
                              href={getTenantUrl(tenant.slug)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Visit tenant"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                            <button
                              onClick={() => copyToClipboard(getTenantUrl(tenant.slug))}
                              className="text-gray-400 hover:text-white transition-colors"
                              title="Copy URL"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete tenant "${tenant.name}"? This action cannot be undone.`)) {
                                  deleteTenantMutation.mutate(tenant.id)
                                }
                              }}
                              disabled={deleteTenantMutation.isPending}
                              className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                              title="Delete tenant"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tenantsData?.tenants && tenantsData.tenants.length === 0 && (
              <div className="p-8 text-center">
                <div className="bg-white/5 rounded-xl p-6">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-lg font-medium text-white mb-2">No tenants yet</h3>
                  <p className="text-gray-400 mb-4">Get started by creating your first tenant</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Create First Tenant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
