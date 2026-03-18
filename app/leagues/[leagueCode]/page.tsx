import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getStandings, LEAGUES, StandingsTable, Standing } from '@/lib/api'
import TeamCrest from '@/app/components/TeamCrest'
import AdSenseSlot from '@/app/components/AdSenseSlot'

interface Props {
  params: { leagueCode: string }
}

export async function generateStaticParams() {
  return ['PL', 'PD', 'BL1', 'SA', 'FL1', 'CL'].map((code) => ({ leagueCode: code }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { leagueCode } = params
  const league = LEAGUES[leagueCode.toUpperCase()]
  if (!league) return {}

  const title = `${league.name} Standings 2026 – Latest Table`
  const description = `Full ${league.name} standings table with points, wins, losses, goals scored and goal difference. Updated after every matchday.`

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `/leagues/${leagueCode}` },
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
      className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${
        isTop4 ? 'border-l-[3px] border-l-blue-500' :
        isRelegation ? 'border-l-[3px] border-l-red-400' : 'border-l-[3px] border-l-transparent'
      }`}
    >
      <td className="px-3 py-3 text-center text-sm font-semibold text-gray-400 w-10">{standing.position}</td>
      <td className="px-3 py-3">
        <Link
          href={`/leagues/${leagueCode}/teams/${standing.team.id}`}
          className="flex items-center gap-2.5 hover:text-blue-600 group"
        >
          <TeamCrest src={standing.team.crest} alt={standing.team.name} size={24} />
          <span className="font-medium text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{standing.team.name}</span>
        </Link>
      </td>
      <td className="px-3 py-3 text-center text-sm text-gray-500">{standing.playedGames}</td>
      <td className="px-3 py-3 text-center text-sm font-medium text-green-700">{standing.won}</td>
      <td className="px-3 py-3 text-center text-sm text-gray-500">{standing.draw}</td>
      <td className="px-3 py-3 text-center text-sm text-red-500">{standing.lost}</td>
      <td className="px-3 py-3 text-center text-sm text-gray-600">{standing.goalsFor}</td>
      <td className="px-3 py-3 text-center text-sm text-gray-600">{standing.goalsAgainst}</td>
      <td className={`px-3 py-3 text-center text-sm font-medium ${standing.goalDifference > 0 ? 'text-green-700' : standing.goalDifference < 0 ? 'text-red-500' : 'text-gray-400'}`}>
        {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
      </td>
      <td className="px-3 py-3 text-center text-sm font-bold text-gray-900">{standing.points}</td>
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
        <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{league.name}</span>
        </nav>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{league.flag}</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{league.name} Standings</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {league.country} &bull;{' '}
                {season ? `Season ${season.startDate?.slice(0, 4)}/${season.endDate?.slice(2, 4)}` : 'Current Season'}
              </p>
            </div>
          </div>
          <Link
            href={`/leagues/${code}/scorers`}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
          >
            <span>🥅</span> Top Scorers
          </Link>
        </div>
      </div>

      <AdSenseSlot format="leaderboard" label="Top Leaderboard Ad" />

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          <p className="font-medium">Unable to load standings</p>
          <p className="text-sm mt-1 text-red-500">{error}</p>
        </div>
      ) : (
        <>
          {tables.map((table, idx) => (
            <div key={idx} className="mb-10">
              {table.group && (
                <h2 className="text-base font-semibold text-gray-600 mb-3 px-1">
                  {table.group.replace(/_/g, ' ')}
                </h2>
              )}
              <div className="apple-card overflow-x-auto">
                <table className="w-full text-sm table-hover">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest">
                      <th className="px-3 py-3 text-center w-10">#</th>
                      <th className="px-3 py-3 text-left">Club</th>
                      <th className="px-3 py-3 text-center" title="Played">P</th>
                      <th className="px-3 py-3 text-center" title="Won">W</th>
                      <th className="px-3 py-3 text-center" title="Drawn">D</th>
                      <th className="px-3 py-3 text-center" title="Lost">L</th>
                      <th className="px-3 py-3 text-center" title="Goals For">GF</th>
                      <th className="px-3 py-3 text-center" title="Goals Against">GA</th>
                      <th className="px-3 py-3 text-center" title="Goal Difference">GD</th>
                      <th className="px-3 py-3 text-center font-bold text-gray-700" title="Points">Pts</th>
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

              <div className="flex flex-wrap gap-5 mt-3 text-xs text-gray-400 px-1">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-sm" />
                  Champions League places
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 bg-red-400 rounded-sm" />
                  Relegation zone
                </span>
              </div>
            </div>
          ))}

          <AdSenseSlot format="rectangle" label="Mid-page Rectangle Ad" />

          {totalTable && (
            <section className="mt-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">
                {league.name} Teams
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {totalTable.table.map((s) => (
                  <Link
                    key={s.team.id}
                    href={`/leagues/${code}/teams/${s.team.id}`}
                    className="apple-card p-3 flex flex-col items-center gap-2 hover:border-blue-400 hover:shadow-md transition-all text-center group"
                  >
                    <TeamCrest src={s.team.crest} alt={s.team.name} size={40} />
                    <span className="text-xs font-medium text-gray-700 leading-tight group-hover:text-blue-600 transition-colors">
                      {s.team.shortName || s.team.name}
                    </span>
                    <span className="text-xs text-gray-400">#{s.position} &bull; {s.points} pts</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <AdSenseSlot format="leaderboard" label="Bottom Leaderboard Ad" className="mt-8" />

      <section className="mt-10 bg-white rounded-2xl border border-gray-200/80 p-6 text-gray-500 text-sm leading-relaxed">
        <h2 className="text-base font-semibold text-gray-800 mb-3">About the {league.name} Table</h2>
        <p>
          The {league.name} is one of {league.country === 'Europe' ? "Europe's" : `${league.country}'s`} most prestigious football competitions.
          This page shows the full {league.name} standings including points, wins, draws, losses, goals scored, goals against,
          and goal difference for all teams in the current season. Updated after every matchday.
          Click any team to view their full match history and statistics.
        </p>
      </section>
    </>
  )
}
