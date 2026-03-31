'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, FileText, Check, Plus, Minus } from 'lucide-react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
}

interface Job {
  id: string
  eventName: string
  totalCost: number
  date: string
  clientId: string
}

export default function NewQuotePage() {
  const [clientId, setClientId] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [availableJobs, setAvailableJobs] = useState<Job[]>([])
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([])
  const [currency, setCurrency] = useState('$')
  const [discount, setDiscount] = useState('0')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => setClients(data))

    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => setAvailableJobs(data))

    fetch('/api/settings/profile')
      .then(res => res.json())
      .then(data => setCurrency(data?.currency || '$'))
  }, [])

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDiscount(e.target.value)
  }

  const filteredJobs = availableJobs.filter(job => job.clientId === clientId)

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobIds(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    )
  }

  const invoiceTotal = availableJobs
    .filter(job => selectedJobIds.includes(job.id))
    .reduce((sum, job) => sum + job.totalCost, 0)

  const discountAmount = (parseFloat(discount) / 100) * invoiceTotal
  const totalAmount = invoiceTotal - discountAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || selectedJobIds.length === 0) {
      alert('Please select a client and at least one job')
      return
    }

    setLoading(true)
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        totalAmount: invoiceTotal, // Send gross total, consumers apply discount
        discount: parseFloat(discount),
        jobIds: selectedJobIds,
      }),
    })

    if (res.ok) {
      router.push('/quotes')
      router.refresh()
    } else {
      alert('Failed to create quote')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4">
        <Link href="/quotes" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Create New Quote</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">1. Select Client</label>
            <select
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-theme focus:outline-none"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value)
                setSelectedJobIds([])
              }}
              required
            >
              <option value="">Select a client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-medium text-slate-700 mb-4">2. Select Jobs to Include</h2>
            {clientId === '' ? (
              <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
                Please select a client first.
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
                No jobs found for this client.{' '}
                <Link href="/jobs/new" className="text-theme hover:underline">Create a job</Link> first.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map(job => (
                  <div
                    key={job.id}
                    onClick={() => toggleJobSelection(job.id)}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedJobIds.includes(job.id)
                        ? 'bg-slate-50 border-theme ring-2 ring-theme/10'
                        : 'bg-white border-slate-200 hover:border-theme'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-4 ${
                        selectedJobIds.includes(job.id) ? 'bg-theme text-white' : 'border border-slate-300'
                      }`}>
                        {selectedJobIds.includes(job.id) && <Check className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{job.eventName}</div>
                        <div className="text-xs text-slate-500">{new Date(job.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900">{currency}{job.totalCost.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 sticky top-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Quote Summary</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-600">
                <span>Items:</span>
                <span className="font-medium text-slate-900">{selectedJobIds.length}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Client:</span>
                <span className="font-medium text-slate-900 text-right truncate ml-4">
                  {clients.find(c => c.id === clientId)?.name || 'None'}
                </span>
              </div>
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-medium text-slate-900">{currency}{invoiceTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-600 whitespace-nowrap">Discount (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-20 px-2 py-1 border border-slate-200 rounded text-right focus:ring-1 focus:ring-theme focus:outline-none"
                    value={discount}
                    onChange={handleDiscountChange}
                  />
                </div>
                <div className="flex justify-between items-end pt-2">
                  <span className="font-bold text-slate-700">Total</span>
                  <span className="text-2xl font-black text-theme">{currency}{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !clientId || selectedJobIds.length === 0}
              className="w-full flex items-center justify-center bg-theme opacity-90 hover:opacity-100 text-white px-6 py-4 rounded-xl transition-all font-bold shadow-lg disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? 'Creating...' : (
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  Generate Quote
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
