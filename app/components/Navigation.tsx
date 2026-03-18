import Link from 'next/link'
import { LEAGUES } from '@/lib/api'

export default function Navigation() {
  const primaryLeagues = ['PL', 'PD', 'BL1', 'SA', 'FL1', 'CL']

  return (
    <nav className="bg-pitch shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl hover:opacity-90 transition-opacity">
            <span className="text-2xl">⚽</span>
            <span>FootballStats</span>
          </Link>

          {/* League links */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto">
            {primaryLeagues.map((code) => (
              <Link
                key={code}
                href={`/leagues/${code}`}
                className="text-green-100 hover:text-white hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
              >
                {LEAGUES[code]?.flag} {code === 'CL' ? 'UCL' : LEAGUES[code]?.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button placeholder */}
          <div className="md:hidden">
            <span className="text-white text-sm">☰ Leagues</span>
          </div>
        </div>

        {/* Mobile leagues bar */}
        <div className="md:hidden flex gap-2 pb-2 overflow-x-auto scrollbar-hide">
          {primaryLeagues.map((code) => (
            <Link
              key={code}
              href={`/leagues/${code}`}
              className="text-green-100 hover:text-white text-xs whitespace-nowrap border border-green-600 rounded px-2 py-1"
            >
              {LEAGUES[code]?.flag} {code === 'CL' ? 'UCL' : code}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
