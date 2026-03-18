import Link from 'next/link'
import { LEAGUES } from '@/lib/api'

export default function Navigation() {
  const primaryLeagues = ['PL', 'PD', 'BL1', 'SA', 'FL1', 'CL']

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-gray-900 text-lg tracking-tight hover:opacity-70 transition-opacity"
          >
            <span className="text-xl">⚽</span>
            <span>FootballStats</span>
          </Link>

          {/* Desktop league links */}
          <div className="hidden md:flex items-center gap-0.5">
            {primaryLeagues.map((code) => (
              <Link
                key={code}
                href={`/leagues/${code}`}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap"
              >
                {LEAGUES[code]?.flag} {code === 'CL' ? 'UCL' : LEAGUES[code]?.name}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger hint */}
          <div className="md:hidden text-gray-600 text-sm font-medium">
            ☰
          </div>
        </div>

        {/* Mobile leagues scrollbar */}
        <div className="md:hidden flex gap-1.5 pb-2.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {primaryLeagues.map((code) => (
            <Link
              key={code}
              href={`/leagues/${code}`}
              className="flex-shrink-0 text-gray-600 hover:text-gray-900 text-xs border border-gray-200 rounded-full px-3 py-1 bg-white whitespace-nowrap transition-colors"
            >
              {LEAGUES[code]?.flag} {code === 'CL' ? 'UCL' : code}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
