'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Briefcase, Calendar, Users, DollarSign, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface Job {
  id: string
  eventName: string
  date: string
  totalCost: number
  client: {
    name: string
  }
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    const res = await fetch('/api/jobs')
    const data = await res.json()
    setJobs(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
    if (res.ok) {
      fetchJobs()
    } else {
      alert('Failed to delete job')
    }
  }

  const filteredJobs = jobs.filter(job =>
    job.eventName.toLowerCase().includes(search.toLowerCase()) ||
    job.client.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Jobs</h1>
          <p className="mt-1 text-slate-600">Track and manage your upcoming and completed service jobs.</p>
        </div>
        <Link
          href="/jobs/new"
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Job
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by event name or client..."
              className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No jobs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Event Name</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Cost</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{job.eventName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-slate-400" />
                        {job.client.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm flex items-center text-slate-600">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        {format(new Date(job.date), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${job.totalCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Job"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Job"
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
