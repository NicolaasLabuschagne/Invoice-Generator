'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface DashboardData {
  totalRevenue: number
  outstandingInvoices: number
  totalClients: number
  activeJobs: number
  recentActivity: Array<{
    id: string
    type: string
    description: string
    amount: number
    date: string
    status: string
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load dashboard data.</div>

  const stats = [
    { name: 'Total Revenue', value: `$${data.totalRevenue.toFixed(2)}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Outstanding Invoices', value: data.outstandingInvoices.toString(), icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Total Clients', value: data.totalClients.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Jobs', value: data.activeJobs.toString(), icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-slate-600">Overview of your service business performance.</p>
        </div>
        <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200">
          Last updated: {format(new Date(), 'MMM dd, HH:mm')}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center transition-all hover:shadow-md">
            <div className={`p-3 rounded-lg ${stat.bg} mr-4`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
            <Link href="/invoices" className="text-sm text-blue-600 hover:underline font-medium">View all</Link>
          </div>

          {data.recentActivity.length === 0 ? (
            <div className="text-slate-400 text-center py-20 flex flex-col items-center">
              <Clock className="h-12 w-12 mb-4 opacity-20" />
              No recent activity found.
            </div>
          ) : (
            <div className="space-y-4">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-4 ${activity.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {activity.status === 'paid' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{activity.description}</p>
                      <p className="text-xs text-slate-500">{format(new Date(activity.date), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">${activity.amount.toFixed(2)}</p>
                    <p className={`text-xs font-bold uppercase ${activity.status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                      {activity.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link
              href="/clients/new"
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-blue-200 transition-all group"
            >
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-3 text-slate-400 group-hover:text-blue-600" />
                <span className="font-medium text-slate-700">Add New Client</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />
            </Link>
            <Link
              href="/jobs/new"
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-blue-200 transition-all group"
            >
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 mr-3 text-slate-400 group-hover:text-blue-600" />
                <span className="font-medium text-slate-700">Create New Job</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />
            </Link>
            <Link
              href="/quotes/new"
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-blue-200 transition-all group"
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-3 text-slate-400 group-hover:text-blue-600" />
                <span className="font-medium text-slate-700">Generate Quote</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
