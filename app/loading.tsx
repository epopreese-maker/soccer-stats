export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="h-10 bg-gray-200 rounded-lg w-72 mb-3" />
      <div className="h-5 bg-gray-100 rounded w-48 mb-8" />

      {/* Table skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="h-10 bg-gray-50 border-b" />
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex gap-3 px-4 py-3 border-b">
            <div className="h-5 bg-gray-100 rounded w-6 flex-shrink-0" />
            <div className="h-5 bg-gray-100 rounded flex-1" />
            <div className="h-5 bg-gray-100 rounded w-8" />
            <div className="h-5 bg-gray-100 rounded w-8" />
            <div className="h-5 bg-gray-100 rounded w-8" />
            <div className="h-5 bg-gray-200 rounded w-10 font-bold" />
          </div>
        ))}
      </div>
    </div>
  )
}
