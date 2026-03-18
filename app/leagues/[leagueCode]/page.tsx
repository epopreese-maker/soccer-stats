import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getStandings, LEAGUES, StandingsTable, Standing } from '@/lib/api'
import TeamCrest from '@/app/components/TeamCrest'
import AdSenseSlot from '@/app/components/AdSenseSlot'

interface Props {
  params: { leagueCode: string }
}

// Generate static pages at build time for all known leagues
export async function generateStaticParams() {
  return Object.keys(LEAGUES).map((code) => ({ leagueCode: code }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { leagueCode } = params
  const league = LEAGUES[leagueCode.toUpperCase()]
  if (!league) return {}

  const title = `${league.name} Standings ${new Date().getFullYear()} – Latest Table`
  const description = `Full ${league.name} standings table with points, wins, losses, goals scored and goal difference. Updated after every matchday.`

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: {
      canonical: `/leagues/${leagueCode}`,
    },
  }
}

function FormBadge({ result }: { result: string }) {
  const classes: Record<string, string> = {
    W: 'badge-win',
    D: 'badge-draw',
    L: 'badge-loss',
  }
  return <span className={classes[result] || 'inline-block w-5 h-5'}>{result}</span>
}

function StandingsRow({ standing, leagueCode }: { standing: Standing; leagueCode: string }) {
  const isTop4 = standing.position <= 4
  const isRelegation = standing.position >= 18

  return (
    <tr
      className={`border-b hover:bg-blue-50 transition-colors ${
        isTop4 ? 'border-l-4 border-l-blue-500' :
        isRelegation ? 'border-l-4 border-l-red-400' : ''
      }`}
    >
      <td className="px-3 py-3 text-center font-semibold text-gray-600 w-8">{standing.position}</td>
      <td className="px-3 py-3">
        <Link
          href={`/leagues/${leagueCode}/teams/${standing.team.id}`}
          className="flex items-center gap-2 hover:text-blue-600 font-medium group"
        >
          <TeamCrest src={standing.team.crest} alt={standing.team.name} size={24} />
          <span className="group-hover:underline">{standing.team.name}</span>
        </Link>
      </td>
      <td className="px-3 py-3 text-center text-gray-600">{standing.playedGames}</td>
      <td className="px-3 py-3 text-center text-green-700 font-medium">{standing.won}</td>
      <td className="px-3 py-3 text-center text-yellow-600">{standing.draw}</td>
      <td className="px-3 py-3 text-center text-red-600">{standing.lost}</td>
      <td className="px-3 py-3 text-center text-gray-700">{standing.goalsFor}</td>
      <td className="px-3 py-3 text-center text-gray-700">{standing.goalsAgainst}</td>
      <td className={`px-3 py-3 text-center font-medium ${standing.goalDifference > 0 ? 'text-green-700' : standing.goalDifference < 0 ? 'text-red-600' : 'text-gray-500'}`}>
        {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
      </td>
      <td className="px-3 py-3 text-center font-bold text-gray-900">{standing.points}</td>
      <td className="px-3 py-3 hidden lg:table-cell">
        <div className="flex gap-1">
          {standing.form?.split(',').filter(Boolean).slice(-5).map((r, i) => (
            <FormBadge key={i} result={r} />
          ))}
        </div>
      </td>
    </tr>
  )
}

export default async function LeagueStandingsPage({ params }: Props) {
  const code = params.leagueCode.toUpperCase()
  const league = LEAGUES[code]
  if (!league) notFound()

  let standingsData: Awaited<ReturnType<typeof getStandings>> | null = null
  let error: string | null = null

  try {
    standingsData = await getStandings(code)
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load standings'
  }

  const season = standingsData?.season
  const tables: StandingsTable[] = standingsData?.standings ?? []
  // Most leagues have a single TOTAL table; some (CL) have groups
  const totalTable = tables.find((t) => t.type === 'TOTAL') ?? tables[0]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Table',
    name: `${league.name} Standings`,
    description: `Current ${league.name} league table`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/leagues/${code}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{league.flag}</span>
          <h1 className="text-3xl font-bold text-gray-900">{league.name} Standings</h1>
        </div>
        <p className="text-gray-500">
          {league.country} •{' '}
          {season ? `Season ${season.startDate?.slice(0, 4)}/${season.endDate?.slice(2, 4)}` : 'Current Season'}
        </p>
      </div>

      {/* Quick-nav links */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link
          href={`/leagues/${code}/scorers`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          🥅 Top Scorers
        </Link>
        {tables.length > 1 && (
          <span className="text-sm text-gray-500 self-center">
            {tables.length} groups / stages
          </span>
        )}
      </div>

      {/* Top ad */}
      <AdSenseSlot format="leaderboard" label="Top Leaderboard Ad" />

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
          <p className="font-medium">Unable to load standings</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : (
        <>
          {/* Render each table (1 for most leagues, multiple for CL groups) */}
          {tables.map((table, idx) => (
            <div key={idx} className="mb-10">
              {table.group && (
                <h2 className="text-lg font-semibold text-gray-700 mb-3">
                  {table.group.replace(/_/g, ' ')}
                </h2>
              )}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm table-hover">
                  <thead>
                    <tr className="bg-gray-50 border-b text-gray-600 text-xs uppercase tracking-wide">
                      <th className="px-3 py-3 text-center w-8">#</th>
                      <th className="px-3 py-3 text-left">Club</th>
                      <th className="px-3 py-3 text-center" title="Played">P</th>
                      <th className="px-3 py-3 text-center" title="Won">W</th>
                      <th className="px-3 py-3 text-center" title="Drawn">D</th>
                      <th className="px-3 py-3 text-center" title="Lost">L</th>
                      <th className="px-3 py-3 text-center" title="Goals For">GF</th>
                      <th className="px-3 py-3 text-center" title="Goals Against">GA</th>
                      <th className="px-3 py-3 text-center" title="Goal Difference">GD</th>
                      <th className="px-3 py-3 text-center font-bold" title="Points">Pts</th>
                      <th className="px-3 py-3 text-left hidden lg:table-cell" title="Last 5 matches">Form</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.table.map((standing) => (
                      <StandingsRow key={standing.team.id} standing={standing} leagueCode={code} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-blue-500 rounded"></span> Champions League places</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-red-400 rounded"></span> Relegation zone</span>
              </div>
            </div>
          ))}

          {/* Mid-content ad */}
          <AdSenseSlot format="rectangle" label="Mid-page Rectangle Ad" />

          {/* Team quick-links */}
          {totalTable && (
            <section className="mt-10">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {league.name} Teams – Stats &amp; History
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {totalTable.table.map((s) => (
                  <Link
                    key={s.team.id}
                    href={`/leagues/${code}/teams/${s.team.id}`}
                    className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col items-center gap-2 hover:border-blue-400 hover:shadow-sm transition-all text-center"
                  >
                    <TeamCrest src={s.team.crest} alt={s.team.name} size={40} />
                    <span className="text-xs font-medium text-gray-700 leading-tight">{s.team.shortName || s.team.name}</span>
                    <span className="text-xs text-gray-400">#{s.position} · {s.points} pts</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Bottom ad */}
      <AdSenseSlot format="leaderboard" label="Bottom Leaderboard Ad" className="mt-8" />

      {/* SEO text block */}
      <section className="mt-10 prose prose-sm max-w-none text-gray-600">
        <h2 className="text-lg font-semibold text-gray-800">About the {league.name} Table</h2>
        <p>
          The {league.name} is one of {league.country === 'Europe' ? 'Europe&apos;s' : `${league.country}&apos;s`} most prestigious football competitions.
          This page shows the full {league.name} standings table including points, wins, draws, losses, goals scored, goals against,
          and goal difference for all teams in the current season. The table is updated after every matchday.
          Click on any team to view their full match history and detailed statistics.
        </p>
      </section>
    </>
  )
}
