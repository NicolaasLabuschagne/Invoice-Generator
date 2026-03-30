'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Calculator } from 'lucide-react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
}

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const [formData, setFormData] = useState({
    clientId: '',
    date: '',
    eventName: '',
    medics: '1',
    hours: '1',
    hourlyRate: '150',
  })
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params
      const [clientsRes, jobRes] = await Promise.all([
        fetch('/api/clients'),
        fetch(`/api/jobs/${id}`)
      ])

      const clientsData = await clientsRes.json()
      const jobData = await jobRes.json()

      setClients(clientsData)
      setFormData({
        clientId: jobData.clientId,
        date: jobData.date.split('T')[0],
        eventName: jobData.eventName,
        medics: jobData.medics.toString(),
        hours: jobData.hours.toString(),
        hourlyRate: jobData.hourlyRate.toString(),
      })
      setLoading(false)
    }

    fetchData()
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { id } = await params

    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      router.push('/jobs')
      router.refresh()
    } else {
      alert('Failed to update job')
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const totalCost = parseFloat(formData.medics) * parseFloat(formData.hours) * parseFloat(formData.hourlyRate)

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-4">
        <Link href="/jobs" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Edit Job</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Client</label>
              <select
                name="clientId"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.clientId || ''}
                onChange={handleChange}
                required
              >
                <option value="">Select a client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Event Name</label>
              <input
                type="text"
                name="eventName"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.eventName || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.date || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Medics (Count)</label>
              <input
                type="number"
                name="medics"
                min="1"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.medics || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hours</label>
              <input
                type="number"
                name="hours"
                step="0.5"
                min="1"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData.hours || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hourly Rate (per medic)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  name="hourlyRate"
                  min="0"
                  className="pl-8 w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.hourlyRate || ''}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
            <div className="flex items-center text-slate-600">
              <Calculator className="h-5 w-5 mr-2" />
              <span className="font-medium text-sm">Calculated Total</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              ${isNaN(totalCost) ? '0.00' : totalCost.toFixed(2)}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {saving ? 'Saving...' : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Update Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
