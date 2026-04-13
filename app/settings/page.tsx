'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Save, Settings as SettingsIcon } from 'lucide-react'

interface ServiceRate {
  id: string
  name: string
  value: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ServiceRate[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newValue, setNewValue] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      } else {
        console.error('Failed to fetch settings')
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newValue) return
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, value: newValue }),
      })
      if (res.ok) {
        setNewName('')
        setNewValue('')
        fetchSettings()
      } else {
        alert('Failed to add setting. Please try again.')
      }
    } catch (err) {
      console.error('Error adding setting:', err)
      alert('An error occurred while adding the setting.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this setting?')) return
    try {
      const res = await fetch(`/api/settings?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchSettings()
      } else {
        alert('Failed to delete setting.')
      }
    } catch (err) {
      console.error('Error deleting setting:', err)
      alert('An error occurred while deleting the setting.')
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center">
          <SettingsIcon className="mr-3 h-8 w-8 text-blue-600" />
          System Setup
        </h1>
        <p className="mt-2 text-slate-600">
          Configure selectable items and their default rates for job creation.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Selectable Items & Rates</h2>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
            <input
              type="text"
              placeholder="e.g. Basic Life Support"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rate ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Item
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Rate</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {settings.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                    No selectable items configured yet.
                  </td>
                </tr>
              ) : (
                settings.map((setting) => (
                  <tr key={setting.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{setting.name}</td>
                    <td className="px-6 py-4">${setting.value.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(setting.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Setting"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
