'use client'

import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl mb-4">🔴</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-500 mb-2 max-w-md">
        Could not load data. This is usually a temporary API issue or rate limit.
      </p>
      <p className="text-xs text-gray-400 mb-6">{error.message}</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Home
        </Link>
      </div>
    </div>
  )
}
