'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Calculator, CheckSquare, Square } from 'lucide-react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
}

interface Setting {
  id: string
  name: string
  value: number
}

export default function NewJobPage() {
  const [formData, setFormData] = useState({
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    eventName: '',
    quantity: '1',
    hours: '1',
    startTime: '',
    endTime: '',
    hourlyRate: '0',
    isComplete: false,
  })
  const [clients, setClients] = useState<Client[]>([])
  const [settings, setSettings] = useState<Setting[]>([])
  const [currency, setCurrency] = useState('$')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const [clientsRes, settingsRes, profileRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/settings'),
        fetch('/api/settings/profile')
      ])
      const clientsData = await clientsRes.json()
      const settingsData = await settingsRes.json()
      const profileData = await profileRes.json()
      setClients(clientsData)
      setSettings(settingsData)
      setCurrency(profileData?.currency || '$')
      if (profileData?.defaultHourlyRate) {
        setFormData(prev => ({ ...prev, hourlyRate: profileData.defaultHourlyRate.toString() }))
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const res = await fetch('/api/jobs/new', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        selectedItems: selectedItems.map(id => {
          const item = settings.find(s => s.id === id)
          return { id: item?.id, name: item?.name, value: item?.value }
        }),
      }),
    })

    if (res.ok) {
      router.push('/jobs')
      router.refresh()
    } else {
      alert('Failed to create job')
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const newValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };

      // Auto-calculate hours if startTime or endTime changes
      if (name === 'startTime' || name === 'endTime') {
        const start = updated.startTime;
        const end = updated.endTime;
        if (start && end) {
          const [sH, sM] = start.split(':').map(Number);
          const [eH, eM] = end.split(':').map(Number);
          let diff = (eH * 60 + eM) - (sH * 60 + sM);
          if (diff < 0) diff += 24 * 60; // Handle overnight
          updated.hours = (diff / 60).toFixed(2);
        }
      }
      return updated;
    });
  }

  const toggleItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const itemsTotal = selectedItems.reduce((sum, id) => {
    const item = settings.find(s => s.id === id)
    return sum + (item?.value || 0)
  }, 0)

  const totalCost = (parseFloat(formData.quantity) * parseFloat(formData.hours) * parseFloat(formData.hourlyRate)) + itemsTotal

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4">
        <Link href="/jobs" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Create New Job</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Client</label>
              <select
                name="clientId"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-theme focus:outline-none"
                value={formData.clientId}
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
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-theme focus:outline-none"
                value={formData.eventName || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                id="date"
                type="date"
                name="date"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-theme focus:outline-none"
                value={formData.date || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                <input
                  id="startTime"
                  type="time"
                  name="startTime"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-theme focus:outline-none"
                  value={formData.startTime || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                <input
                  id="endTime"
                  type="time"
                  name="endTime"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-theme focus:outline-none"
                  value={formData.endTime || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="isComplete"
                name="isComplete"
                className="w-5 h-5 rounded border-slate-300 text-theme focus:ring-theme"
                checked={formData.isComplete}
                onChange={handleChange}
              />
              <label htmlFor="isComplete" className="text-sm font-medium text-slate-700">Mark as Completed</label>
            </div>

            <div className="border-t border-slate-100 pt-6 col-span-full">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Base Billing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input
                    id="quantity"
                    type="number"
                    name="quantity"
                    min="1"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-theme focus:outline-none"
                    value={formData.quantity || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="hours" className="block text-sm font-medium text-slate-700 mb-1">Hours</label>
                  <input
                    id="hours"
                    type="number"
                    name="hours"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-theme focus:outline-none"
                    value={formData.hours || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-medium text-slate-700 mb-1">Hourly Rate</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">{currency}</span>
                    <input
                      id="hourlyRate"
                      type="number"
                      name="hourlyRate"
                      min="0"
                      className="pl-8 w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-theme focus:outline-none"
                      value={formData.hourlyRate || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 col-span-full">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Additional Items (from Settings)</h3>
              {settings.length === 0 ? (
                <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg">
                  No additional items configured. Go to <Link href="/settings" className="text-theme hover:underline">Settings</Link> to add some.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {settings.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedItems.includes(item.id)
                          ? 'bg-slate-50 border-theme ring-2 ring-theme/10'
                          : 'bg-white border-slate-200 hover:border-theme'
                      }`}
                    >
                      <div className="flex items-center">
                        {selectedItems.includes(item.id) ? (
                          <CheckSquare className="h-5 w-5 mr-3 text-theme" />
                        ) : (
                          <Square className="h-5 w-5 mr-3 text-slate-300" />
                        )}
                        <span className="font-medium text-slate-700">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">{currency}{item.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 p-6 bg-slate-900 rounded-xl text-white flex items-center justify-between">
            <div className="flex items-center">
              <Calculator className="h-6 w-6 mr-3 text-theme" />
              <div>
                <p className="text-sm text-slate-400 font-medium">Estimated Total</p>
                <p className="text-xs text-slate-500">Base: {currency}{(parseFloat(formData.quantity) * parseFloat(formData.hours) * parseFloat(formData.hourlyRate)).toFixed(2)} + Items: {currency}{itemsTotal.toFixed(2)}</p>
              </div>
            </div>
            <div className="text-3xl font-black text-theme">
              {currency}{isNaN(totalCost) ? '0.00' : totalCost.toFixed(2)}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center bg-theme opacity-90 hover:opacity-100 text-white px-8 py-4 rounded-xl transition-all font-bold shadow-lg disabled:opacity-50"
            >
              {saving ? 'Creating...' : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Create Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
