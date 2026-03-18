import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getScorers, LEAGUES } from '@/lib/api'
import TeamCrest from '@/app/components/TeamCrest'
import AdSenseSlot from '@/app/components/AdSenseSlot'

interface Props {
  params: { leagueCode: string }
}

export async function generateStaticParams() {
  return ['PL', 'PD', 'BL1', 'SA', 'FL1', 'CL'].map((code) => ({ leagueCode: code }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const code = params.leagueCode.toUpperCase()
  const league = LEAGUES[code]
  if (!league) return {}

  const title = `${league.name} Top Scorers 2026 – Golden Boot Race`
  const description = `Full ${league.name} top scorers list for 2026. Goals, assists, and penalties for every player. Who is winning the golden boot?`

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `/leagues/${params.leagueCode}/scorers` },
  }
}

export default async function TopScorersPage({ params }: Props) {
  const code = params.leagueCode.toUpperCase()
  const league = LEAGUES[code]
  if (!league) notFound()

  let scorersData: Awaited<ReturnType<typeof getScorers>> | null = null
  let error: string | null = null

  try {
    scorersData = await getScorers(code, 30)
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load scorers'
  }

  const scorers = scorersData?.scorers ?? []
  const season = scorersData?.season

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${league.name} Top Scorers`,
    description: `Top goalscorers in the current ${league.name} season`,
    itemListElement: scorers.slice(0, 10).map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.player.name,
      description: `${s.goals} goals for ${s.team.name}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/leagues/${code}`} className="hover:text-blue-600 transition-colors">{league.name}</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Top Scorers</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{league.flag}</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{league.name} Top Scorers</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Golden Boot Race &bull;{' '}
              {season
                ? `Season ${season.startDate?.slice(0, 4)}/${season.endDate?.slice(2, 4)}`
                : 'Current Season'}
            </p>
          </div>
        </div>
        <Link
          href={`/leagues/${code}`}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors bg-white border border-gray-200 rounded-full px-4 py-2"
        >
          ← Standings
        </Link>
      </div>

      <AdSenseSlot format="leaderboard" label="Top Leaderboard Ad" />

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          <p className="font-medium">Unable to load top scorers</p>
          <p className="text-sm mt-1 text-red-500">{error}</p>
        </div>
      ) : (
        <div className="apple-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest">
                <th className="px-4 py-3 text-center w-12">#</th>
                <th className="px-4 py-3 text-left">Player</th>
                <th className="px-4 py-3 text-left">Club</th>
                <th className="px-4 py-3 text-center" title="Goals">Goals</th>
                <th className="px-4 py-3 text-center" title="Assists">Assists</th>
                <th className="px-4 py-3 text-center" title="Penalties">Pens</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell" title="Matches played">MP</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell" title="Goals per game">G/G</th>
              </tr>
            </thead>
            <tbody>
              {scorers.map((s, idx) => {
                const gpg = s.playedMatches > 0 ? (s.goals / s.playedMatches).toFixed(2) : '—'
                const isTopThree = idx < 3
                return (
                  <tr
                    key={s.player.id}
                    className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${isTopThree ? 'bg-amber-50/40' : ''}`}
                  >
                    <td className="px-4 py-3 text-center">
                      {idx === 0 ? (
                        <span className="text-lg">🥇</span>
                      ) : idx === 1 ? (
                        <span className="text-lg">🥈</span>
                      ) : idx === 2 ? (
                        <span className="text-lg">🥉</span>
                      ) : (
                        <span className="font-medium text-gray-400 text-sm">{idx + 1}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{s.player.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{s.player.nationality}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/leagues/${code}/teams/${s.team.id}`}
                        className="flex items-center gap-2 hover:text-blue-600 group transition-colors"
                      >
                        <TeamCrest src={s.team.crest} alt={s.team.name} size={20} />
                        <span className="text-sm text-gray-600 group-hover:text-blue-600">{s.team.shortName || s.team.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-xl text-gray-900">{s.goals}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{s.assists ?? '—'}</td>
                    <td className="px-4 py-3 text-center text-gray-400 text-sm">{s.penalties ?? '—'}</td>
                    <td className="px-4 py-3 text-center text-gray-400 text-sm hidden sm:table-cell">{s.playedMatches}</td>
                    <td className="px-4 py-3 text-center text-gray-400 text-sm hidden sm:table-cell">{gpg}</td>
                  </tr>
                )
              })}
              {scorers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    No scorer data available for this competition yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AdSenseSlot format="rectangle" label="Mid-page Rectangle Ad" className="mt-6" />

      <section className="mt-10 bg-white rounded-2xl border border-gray-200/80 p-6 text-gray-500 text-sm leading-relaxed">
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          {league.name} Golden Boot Race 2026
        </h2>
        <p>
          Follow the {league.name} top scorers leaderboard and track who is leading the golden boot race this season.
          The table shows every player&apos;s goals, assists, and penalty contributions along with their goals-per-game ratio.
          Click any club name to explore the full team history and all matches.
        </p>
      </section>

      <AdSenseSlot format="leaderboard" label="Bottom Leaderboard Ad" className="mt-6" />
    </>
  )
}
