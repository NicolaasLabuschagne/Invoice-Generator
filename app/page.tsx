import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
          Service SaaS
        </h1>
        <p className="mt-4 text-xl text-slate-600">
          The all-in-one platform for managing quotes, invoices, and service jobs.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/signup"
            className="rounded-md bg-theme px-6 py-3 text-lg font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-theme transition-all"
          >
            Get Started
          </Link>
          <Link href="/login" className="text-lg font-semibold leading-6 text-slate-900 hover:text-theme transition-colors">
            Log in <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
