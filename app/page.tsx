import { Metadata } from 'next'
import Link from 'next/link'
import { LEAGUES } from '@/lib/api'
import AdSenseSlot from './components/AdSenseSlot'

export const metadata: Metadata = {
  title: 'FootballStats – Live Soccer Standings, Scores & Stats',
  description:
    'Free football statistics site. Premier League, La Liga, Bundesliga, Serie A, Ligue 1 and Champions League standings, top scorers, team histories, and head-to-head records.',
  alternates: { canonical: '/' },
}

const FEATURED_LEAGUES = [
  { code: 'PL',  bg: 'from-purple-600 to-purple-800',   emoji: '🏆' },
  { code: 'PD',  bg: 'from-red-600   to-red-800',       emoji: '🇪🇸' },
  { code: 'BL1', bg: 'from-gray-700  to-gray-900',       emoji: '🇩🇪' },
  { code: 'SA',  bg: 'from-blue-700  to-blue-900',       emoji: '🇮🇹' },
  { code: 'FL1', bg: 'from-indigo-600 to-indigo-800',    emoji: '🇫🇷' },
  { code: 'CL',  bg: 'from-sky-600   to-sky-900',        emoji: '⭐' },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="text-center py-12 mb-8">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 leading-tight">
          ⚽ FootballStats
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Standings, top scorers, team histories &amp; head-to-head records for every major league.
          Auto-updated daily. Free.
        </p>
      </section>

      <AdSenseSlot format="leaderboard" label="Homepage Top Ad" />

      {/* League cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">Featured Leagues</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED_LEAGUES.map(({ code, bg, emoji }) => {
            const league = LEAGUES[code]
            if (!league) return null
            return (
              <div key={code} className="group">
                <div className={`bg-gradient-to-br ${bg} rounded-xl p-5 text-white shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-white/70 text-xs font-medium uppercase tracking-wide">{league.country}</p>
                      <h3 className="text-xl font-bold mt-0.5">{league.name}</h3>
                    </div>
                    <span className="text-3xl">{emoji}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/leagues/${code}`}
                      className="flex-1 bg-white/20 hover:bw-white/30 text-white text-sm font-medium text-center py-2 rounded-lg transition-colors"
                    >
                      📊 Standings
                    </Link>
                    <Link
                      href={`/leagues/${code}/scorers`}
                      className="flex-1 bg-white/20 hover:bg-white/30 text-white text-sm font-medium text-center py-2 rounded-lg transition-colors"
                    >
                      🥅 Scorers
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">What You&apos;ll Find Here</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: '📊',
              title: 'League Standings',
              desc: 'Live tables with points, goal difference and form for every league.',
              links: [
                { label: 'Premier League', href: '/leagues/PL' },
                { label: 'La Liga', href: '/leagues/PD' },
                { label: 'Bundesliga', href: '/leagues/BL1' },
              ],
            },
            {
              icon: '🥅',
              title: 'Top Scorers',
              desc: 'Golden boot leaderboards with goals, assists and per-game ratios.',
              links: [
                { label: 'PL Scorers', href: '/leagues/PL/scorers' },
                { label: 'La Liga Scorers', href: '/leagues/PD/scorers' },
                { label: 'Serie A Scorers', href: '/leagues/SA/scorers' },
              ],
            },
            {
              icon: '🏟️',
              title: 'Team Histories',
              desc: 'Full match history, results and stats for every club.',
              links: [
                { label: 'PL Teams', href: '/leagues/PL' },
                { label: 'La Liga Teams', href: '/leagues/PD' },
                { label: 'Bundesliga Teams', href: '/leagues/BL1' },
              ],
            },
            {
              icon: '⚔️',
              title: 'Head-to-Head',
              desc: 'All-time H2H records between any two clubs with win % bars.',
              links: [
                { label: 'PL H2H', href: '/leagues/PL' },
                { label: 'UCL H2H', href: '/leagues/CL' },
                { label: 'Serie A H2H', href: '/leagues/SA' },
              ],
            },
          ].map((f) => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{f.desc}</p>
              <ul className="space-y-1">
                {f.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-blue-600 hover:underline">
                      {l.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <AdSenseSlot format="rectangle" label="Mid-page Ad" />

      {/* All leagues */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">All Available Leagues</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Object.entries(LEAGUES).map(([code, league]) => (
            <Link
              key={code}
              href={`/leagues/${code}`}
              className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <span className="text-xl">{league.flag}</span>
              <div className="min-w-0">
                <div className="font-medium text-sm text-gray-800 truncate">{league.name}</div>
                <div className="text-xs text-gray-400">{league.country}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SEO content */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 text-gray-600 text-sm leading-relaxed">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Free Football Stats — Premier League, La Liga, Bundesliga &amp; More
        </h2>
        <p className="mb-3">
          FootballStats is your free, ad-supported source for football statistics covering all major European leagues.
          Whether you want to check the latest Premier League table, see who is leading the La Liga golden boot race,
          or look up the head-to-head record between Manchester City and Liverpool — it&apos;s all here.
        </p>
        <p>
          Data is sourced from the football-data.org API and updated every hour via ISR (Incremental Static Regeneration),
          meaning pages load fast while staying fresh. Every team page, scorer list, and H2H matchup is a static page
          optimized for Google indexing.
        </p>
      </section>

      <AdSenseSlot format="leaderboard" label="Bottom Ad" className="mt-8" />
    </>
  )
}
