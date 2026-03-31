'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, User, Phone, Mail, MapPin, Edit, Trash2 } from 'lucide-react'

interface Client {
  id: string
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    const res = await fetch('/api/clients')
    const data = await res.json()
    setClients(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client? This will delete all associated jobs, quotes, and invoices.')) return
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    if (res.ok) {
      fetchClients()
    } else {
      alert('Failed to delete client')
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
          <p className="mt-1 text-slate-600">Manage your customer database.</p>
        </div>
        <Link
          href="/clients/new"
          className="flex items-center bg-theme opacity-90 hover:opacity-100 text-white px-4 py-2 rounded-lg transition-all shadow-md"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Client
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, contact or email..."
              className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-theme focus:outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading clients...</div>
        ) : filteredClients.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No clients found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredClients.map((client) => (
              <div key={client.id} className="bg-white border border-slate-100 rounded-xl p-6 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-theme/10 p-3 rounded-lg text-theme">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="flex space-x-1">
                    <Link
                      href={`/clients/${client.id}`}
                      className="p-2 text-slate-400 hover:text-theme hover:bg-theme/10 rounded-lg transition-all"
                      title="Edit Client"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete Client"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-1">{client.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{client.contactPerson}</p>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="h-4 w-4 mr-2 text-slate-400" />
                    {client.email}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Phone className="h-4 w-4 mr-2 text-slate-400" />
                    {client.phone}
                  </div>
                  <div className="flex items-start text-sm text-slate-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-slate-400 flex-shrink-0" />
                    <span className="line-clamp-2">{client.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
