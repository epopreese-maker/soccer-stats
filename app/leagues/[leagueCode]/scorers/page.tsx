import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getScorers, LEAGUES } from '@/lib/api'
import TeamCrest from '@/app/components/TeamCrest'
import AdSenseSlot from '@/app/components/AdSenseSlot'

interface Props {
  params: { leagueCode: string }
}

export async function generateStaticParams() {
  return Object.keys(LEAGUES).map((code) => ({ leagueCode: code }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const code = params.leagueCode.toUpperCase()
  const league = LEAGUES[code]
  if (!league) return {}

  const year = new Date().getFullYear()
  const title = `${league.name} Top Scorers ${year} – Golden Boot Race`
  const description = `Full ${league.name} top scorers list for ${year}. Goals, assists, and penalties for every player. Who is winning the golden boot?`

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
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-2">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href={`/leagues/${code}`} className="hover:text-blue-600">{league.name}</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Top Scorers</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{league.flag}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{league.name} Top Scorers</h1>
            <p className="text-gray-500 mt-1">
              Golden Boot Race —{' '}
              {season
                ? `Season ${season.startDate?.slice(0, 4)}/${season.endDate?.slice(2, 4)}`
                : 'Current Season'}
            </p>
          </div>
        </div>
      </div>

      <AdSenseSlot format="leaderboard" label="Top Leaderboard Ad" />

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
          <p className="font-medium">Unable to load top scorers</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-center w-10">#</th>
                <th className="px-4 py-3 text-left">Player</th>
                <th className="px-4 py-3 text-left">Club</th>
                <th className="px-4 py-3 text-center" title="Goals">⚽ Goals</th>
                <th className="px-4 py-3 text-center" title="Assists">🎯 Assists</th>
                <th className="px-4 py-3 text-center" title="Penalties scored">🎯 Pens</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell" title="Matches played">MP</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell" title="Goals per game">G/G</th>
              </tr>
            </thead>
            <tbody>
              {scorers.map((s, idx) => {
                const gpg = s.playedMatches > 0 ? (s.goals / s.playedMatches).toFixed(2) : '—'
                return (
                  <tr key={s.player.id} className={`border-b hover:bg-blue-50 transition-colors ${idx < 3 ? 'bg-amber-50' : ''}`}>
                    <td className="px-4 py-3 text-center">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : (
                        <span className="font-semibold text-gray-500">{idx + 1}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{s.player.name}</div>
                      <div className="text-xs text-gray-400">{s.player.nationality}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/leagues/${code}/teams/${s.team.id}`}
                        className="flex items-center gap-2 hover:text-blue-600"
                      >
                        <TeamCrest src={s.team.crest} alt={s.team.name} size={20} />
                        <span className="text-sm">{s.team.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-lg text-gray-900">{s.goals}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{s.assists ?? '—'}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{s.penalties ?? '—'}</td>
                    <td className="px-4 py-3 text-center text-gray-500 hidden sm:table-cell">{s.playedMatches}</td>
                    <td className="px-4 py-3 text-center text-gray-500 hidden sm:table-cell">{gpg}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <AdSenseSlot format="rectangle" label="Mid-page Rectangle Ad" className="mt-6" />

      {/* Back link */}
      <div className="mt-6">
        <Link
          href={`/leagues/${code}`}
          className="text-blue-600 hover:underline text-sm flex items-center gap-1"
        >
          ← Back to {league.name} Standings
        </Link>
      </div>

      {/* SEO content */}
      <section className="mt-10 text-gray-600 text-sm leading-relaxed">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          {league.name} Golden Boot Race {new Date().getFullYear()}
        </h2>
        <p>
          Follow the {league.name} top scorers leaderboard and track who is leading the golden boot race this season.
          The table above shows every player&apos;s goals, assists, and penalty contributions along with their goals-per-game ratio.
          Click any club name to explore the full team history and all matches.
        </p>
      </section>

      <AdSenseSlot format="leaderboard" label="Bottom Leaderboard Ad" className="mt-6" />
    </>
  )
}
