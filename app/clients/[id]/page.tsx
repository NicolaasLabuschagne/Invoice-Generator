'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchClient = async () => {
      const { id } = await params
      const res = await fetch(`/api/clients/${id}`)
      const data = await res.json()
      setFormData({
        name: data.name,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email,
        address: data.address,
      })
      setLoading(false)
    }
    fetchClient()
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { id } = await params

    const res = await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      router.push('/clients')
      router.refresh()
    } else {
      alert('Failed to update client')
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-4">
        <Link href="/clients" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Edit Client</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Company / Individual Name</label>
              <input
                type="text"
                name="name"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-theme focus:outline-none"
                value={formData.name || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                name="contactPerson"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-theme focus:outline-none"
                value={formData.contactPerson || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-theme focus:outline-none"
                value={formData.email || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-theme focus:outline-none"
                value={formData.phone || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <textarea
                name="address"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-theme focus:outline-none"
                value={formData.address || ''}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center bg-theme opacity-90 hover:opacity-100 text-white px-6 py-3 rounded-lg transition-all font-semibold"
            >
              {saving ? 'Saving...' : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
