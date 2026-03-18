import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-6xl mb-4">⚽</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-8">
        That page doesn&apos;t exist or the API data may not be available for free-tier users.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/leagues/PL"
          className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Premier League
        </Link>
      </div>
    </div>
  )
}
