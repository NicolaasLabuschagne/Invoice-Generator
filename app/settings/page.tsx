'use client'

import { useEffect, useState, useRef } from 'react'
import { Plus, Trash2, Save, Settings as SettingsIcon, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

interface Setting {
  id: string
  name: string
  value: number
}

interface Profile {
  logoUrl: string | null
  themeColor: string | null
  companyName: string | null
  companyAddress: string | null
  companyEmail: string | null
  companyPhone: string | null
  invoiceTemplate: string | null
  quoteTemplate: string | null
  bankInfo: string | null
  licenceInfo: string | null
  currency: string | null
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [profile, setProfile] = useState<Profile>({
    logoUrl: '',
    themeColor: '#2563eb',
    companyName: '',
    companyAddress: '',
    companyEmail: '',
    companyPhone: '',
    invoiceTemplate: '',
    quoteTemplate: '',
    bankInfo: '',
    licenceInfo: '',
    currency: '$',
  })
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newValue, setNewValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [settingsRes, profileRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/settings/profile')
      ])

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        setSettings(Array.isArray(settingsData) ? settingsData : [])
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        if (profileData) {
          setProfile(profileData)
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `logos/${fileName}`

      const { data, error } = await supabase.storage
        .from('public-img')
        .upload(filePath, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('public-img')
        .getPublicUrl(filePath)

      setProfile({ ...profile, logoUrl: publicUrl })
    } catch (err: any) {
      console.error('Error uploading logo:', err)
      alert(`Failed to upload logo: ${err.message || 'Unknown error'}. \n\nPlease make sure you have a "public-img" bucket in Supabase storage and have set up RLS policies to allow uploads.`)
    } finally {
      setUploading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      if (res.ok) {
        alert('Profile updated successfully!')
      } else {
        alert('Failed to update profile.')
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      alert('An error occurred while updating the profile.')
    } finally {
      setSavingProfile(false)
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
        fetchData()
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
        fetchData()
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
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center">
          <SettingsIcon className="mr-3 h-8 w-8 text-blue-600" />
          Settings & Customization
        </h1>
        <p className="mt-2 text-slate-600">
          Configure your company profile, branding, and system items.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Company Profile & Branding</h2>

        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input
                id="companyName"
                type="text"
                placeholder="Service SaaS Corp"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={profile.companyName || ''}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-slate-700 mb-1">Currency Symbol</label>
              <select
                id="currency"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={profile.currency || '$'}
                onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
              >
                <option value="$">USD ($)</option>
                <option value="R">ZAR (R)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="A$">AUD (A$)</option>
              </select>
            </div>
            <div>
              <label htmlFor="themeColor" className="block text-sm font-medium text-slate-700 mb-1">Theme Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  className="h-10 w-20 border border-slate-200 rounded-lg focus:outline-none"
                  value={profile.themeColor || '#2563eb'}
                  onChange={(e) => setProfile({ ...profile, themeColor: e.target.value })}
                />
                <input
                  id="themeColor"
                  type="text"
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={profile.themeColor || '#2563eb'}
                  onChange={(e) => setProfile({ ...profile, themeColor: e.target.value })}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="logoUrl" className="block text-sm font-medium text-slate-700 mb-1">Company Logo</label>
              <div className="flex items-center gap-4">
                {profile.logoUrl && (
                  <div className="h-16 w-16 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                    <img src={profile.logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    id="logoUrl"
                    type="text"
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-2"
                    value={profile.logoUrl || ''}
                    onChange={(e) => setProfile({ ...profile, logoUrl: e.target.value })}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="companyEmail" className="block text-sm font-medium text-slate-700 mb-1">Company Email</label>
              <input
                id="companyEmail"
                type="email"
                placeholder="contact@company.com"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={profile.companyEmail || ''}
                onChange={(e) => setProfile({ ...profile, companyEmail: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="companyPhone" className="block text-sm font-medium text-slate-700 mb-1">Company Phone</label>
              <input
                id="companyPhone"
                type="text"
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={profile.companyPhone || ''}
                onChange={(e) => setProfile({ ...profile, companyPhone: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="companyAddress" className="block text-sm font-medium text-slate-700 mb-1">Company Address</label>
              <textarea
                id="companyAddress"
                placeholder="123 Business St, City, Country"
                rows={2}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={profile.companyAddress || ''}
                onChange={(e) => setProfile({ ...profile, companyAddress: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="bankInfo" className="block text-sm font-medium text-slate-700 mb-1">Bank / Payment Info</label>
              <textarea
                id="bankInfo"
                placeholder="Account Name: ...&#10;Bank: ...&#10;Account Number: ...&#10;Branch Code: ..."
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={profile.bankInfo || ''}
                onChange={(e) => setProfile({ ...profile, bankInfo: e.target.value })}
              />
              <p className="mt-1 text-xs text-slate-500 italic">This will appear in the 'Payment Info' section of your documents.</p>
            </div>
            <div>
              <label htmlFor="licenceInfo" className="block text-sm font-medium text-slate-700 mb-1">Licence / Footer Info</label>
              <textarea
                id="licenceInfo"
                placeholder="Licence nr, Registration info..."
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={profile.licenceInfo || ''}
                onChange={(e) => setProfile({ ...profile, licenceInfo: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label htmlFor="quoteTemplate" className="block text-sm font-medium text-slate-700 mb-1">Custom Quote Terms/Template</label>
              <textarea
                id="quoteTemplate"
                placeholder="Default quote terms and conditions..."
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={profile.quoteTemplate || ''}
                onChange={(e) => setProfile({ ...profile, quoteTemplate: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="invoiceTemplate" className="block text-sm font-medium text-slate-700 mb-1">Custom Invoice Terms/Template</label>
              <textarea
                id="invoiceTemplate"
                placeholder="Default invoice terms and conditions..."
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={profile.invoiceTemplate || ''}
                onChange={(e) => setProfile({ ...profile, invoiceTemplate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center justify-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
            >
              <Save className="h-5 w-5 mr-2" />
              {savingProfile ? 'Saving...' : 'Save Profile Settings'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Selectable Items & Rates</h2>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
          <div>
            <label htmlFor="newItemName" className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
            <input
              id="newItemName"
              type="text"
              placeholder="e.g. Basic Life Support"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="newItemRate" className="block text-sm font-medium text-slate-700 mb-1">Rate ({profile.currency || '$'})</label>
            <input
              id="newItemRate"
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
              {(!settings || settings.length === 0) ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                    No selectable items configured yet.
                  </td>
                </tr>
              ) : (
                settings.map((setting) => (
                  <tr key={setting?.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{setting?.name}</td>
                    <td className="px-6 py-4">{profile.currency || '$'}{setting?.value?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(setting?.id)}
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
