import Link from 'next/link'
import { LEAGUES } from '@/lib/api'

export default function Footer() {
  return (
    <footer className="bg-white/80 border-t border-gray-200/60 mt-16 text-sm text-gray-500">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">⚽</span>
              <span className="font-bold text-gray-900 tracking-tight">FootballStats</span>
            </div>
            <p className="text-xs leading-relaxed text-gray-400">
              Live standings, top scorers, team histories, and head-to-head records for every major European league.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-3">Top Leagues</h3>
            <ul className="space-y-2">
              {['PL', 'PD', 'BL1', 'SA', 'FL1'].map((code) => (
                <li key={code}>
                  <Link
                    href={`/leagues/${code}`}
                    className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {LEAGUES[code]?.flag} {LEAGUES[code]?.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-3">Top Scorers</h3>
            <ul className="space-y-2">
              {['PL', 'PD', 'BL1', 'SA', 'FL1'].map((code) => (
                <li key={code}>
                  <Link
                    href={`/leagues/${code}/scorers`}
                    className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {LEAGUES[code]?.name} Scorers
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-3">More Leagues</h3>
            <ul className="space-y-2">
              <li><Link href="/leagues/CL" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">🇪🇺 Champions League</Link></li>
              <li><Link href="/leagues/EL" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">🇪🇺 Europa League</Link></li>
              <li><Link href="/leagues/DED" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">🇳🇱 Eredivisie</Link></li>
              <li><Link href="/leagues/PPL" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">🇵🇹 Primeira Liga</Link></li>
              <li><Link href="/leagues/BSA" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">🇧🇷 Brasileirão</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200/60 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-400">
          <p>© 2026 FootballStats. Data provided by <a href="https://www.football-data.org" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 underline underline-offset-2">football-data.org</a>.</p>
          <p>For entertainment purposes only. Not affiliated with any football organization.</p>
        </div>
      </div>
    </footer>
  )
}
