import Link from 'next/link'
import { LEAGUES } from '@/lib/api'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-3">⚽ FootballStats</h3>
            <p className="text-sm">
              Live standings, top scorers, team history, and head-to-head stats for the world&apos;s top football leagues.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Top Leagues</h3>
            <ul className="space-y-1 text-sm">
              {['PL', 'PD', 'BL1', 'SA', 'FL1'].map((code) => (
                <li key={code}>
                  <Link href={`/leagues/${code}`} className="hover:text-white transition-colors">
                    {LEAGUES[code]?.flag} {LEAGUES[code]?.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Stats</h3>
            <ul className="space-y-1 text-sm">
              {['PL', 'PD', 'BL1'].map((code) => (
                <li key={code}>
                  <Link href={`/leagues/${code}/scorers`} className="hover:text-white transition-colors">
                    {LEAGUES[code]?.name} Top Scorers
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">More</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/leagues/CL" className="hover:text-white transition-colors">🇪🇺 Champions League</Link></li>
              <li><Link href="/leagues/EL" className="hover:text-white transition-colors">🇪🇺 Europa League</Link></li>
              <li><Link href="/leagues/DED" className="hover:text-white transition-colors">🇳🇱 Eredivisie</Link></li>
              <li><Link href="/leagues/PPL" className="hover:text-white transition-colors">🇵🇹 Primeira Liga</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} FootballStats. Data from football-data.org.</p>
          <p>For entertainment purposes. Not affiliated with any football organization.</p>
        </div>
      </div>
    </footer>
  )
}
