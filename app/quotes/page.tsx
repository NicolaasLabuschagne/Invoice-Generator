'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, FileText, Calendar, Briefcase, Download, Trash2, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

interface Quote {
  id: string
  quoteNumber: string
  totalAmount: number
  discount: number
  createdAt: string
  client: {
    name: string
  }
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [currency, setCurrency] = useState('$')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    const [quotesRes, profileRes] = await Promise.all([
      fetch('/api/quotes'),
      fetch('/api/settings/profile')
    ])
    const quotesData = await quotesRes.json()
    const profileData = await profileRes.json()
    setQuotes(quotesData)
    setCurrency(profileData?.currency || '$')
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return
    await fetch(`/api/quotes/${id}`, { method: 'DELETE' })
    fetchQuotes()
  }

  const convertToInvoice = async (id: string) => {
    if (!confirm('Convert this quote to an invoice?')) return
    const res = await fetch(`/api/quotes/${id}/convert`, { method: 'POST' })
    if (res.ok) {
      router.push('/invoices')
    } else {
      alert('Failed to convert quote to invoice')
    }
  }

  const filteredQuotes = (Array.isArray(quotes) ? quotes : []).filter(quote =>
    quote.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
    quote.client.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quotes</h1>
          <p className="mt-1 text-slate-600">Create and manage your service quotes.</p>
        </div>
        <Link
          href="/quotes/new"
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Quote
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by quote number or client..."
              className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading quotes...</div>
        ) : filteredQuotes.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No quotes found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Quote Number</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Date Created</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-600">
                      {quote.quoteNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{quote.client.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm flex items-center text-slate-600">
                        <Calendar className="h-3 w-3 mr-1" /> {format(new Date(quote.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {currency}{(quote.totalAmount * (1 - (quote.discount || 0) / 100)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => convertToInvoice(quote.id)}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Convert to Invoice"
                        >
                          <ArrowRight className="h-5 w-5" />
                        </button>
                        <a
                          href={`/api/pdf/quote/${quote.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Download PDF"
                        >
                          <Download className="h-5 w-5" />
                        </a>
                        <button
                          onClick={() => handleDelete(quote.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Quote"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
