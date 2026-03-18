import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getTeam,
  getTeamMatches,
  getLeagueTeams,
  LEAGUES,
  Match,
  Team,
  formatScore,
  formatDate,
} from '@/lib/api'
import TeamCrest from '@/app/components/TeamCrest'
import AdSenseSlot from '@/app/components/AdSenseSlot'

interface Props {
  params: { leagueCode: string; teamId: string; opponentId: string }
}

export async function generateStaticParams() {
  const leagues = ['PL', 'PD', 'BL1', 'SA', 'FL1']
  const params: { leagueCode: string; teamId: string; opponentId: string }[] = []

  for (const code of leagues) {
    try {
      const { teams } = await getLeagueTeams(code)
      for (const teamA of teams) {
        for (const teamB of teams) {
          if (teamA.id !== teamB.id) {
            params.push({
              leagueCode: code,
              teamId: String(teamA.id),
              opponentId: String(teamB.id),
            })
          }
        }
      }
    } catch {
      // skip
    }
  }
  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { leagueCode, teamId, opponentId } = params
  const league = LEAGUES[leagueCode.toUpperCase()]

  try {
    const [teamA, teamB] = await Promise.all([getTeam(teamId), getTeam(opponentId)])
    const title = `${teamA.name} vs ${teamB.name} – Head-to-Head Record | ${league?.name ?? leagueCode}`
    const description = `Full head-to-head record between ${teamA.name} and ${teamB.name}. All H2H results, scores, and statistics in ${league?.name ?? leagueCode} and other competitions.`
    return {
      title,
      description,
      openGraph: { title, description },
      alternates: { canonical: `/leagues/${leagueCode}/teams/${teamId}/vs/${opponentId}` },
    }
  } catch {
    return {}
  }
}

function computeH2HStats(matches: Match[], teamAId: number, teamBId: number) {
  const finished = matches.filter(
    (m) =>
      m.status === 'FINISHED' &&
      ((m.homeTeam.id === teamAId && m.awayTeam.id === teamBId) ||
       (m.homeTeam.id === teamBId && m.awayTeam.id === teamAId))
  )

  let aWins = 0, bWins = 0, draws = 0, aGoals = 0, bGoals = 0

  for (const m of finished) {
    const aIsHome = m.homeTeam.id === teamAId
    const aG = (aIsHome ? m.score.fullTime.home : m.score.fullTime.away) ?? 0
    const bG = (aIsHome ? m.score.fullTime.away : m.score.fullTime.home) ?? 0
    aGoals += aG
    bGoals += bG
    if (aG > bG) aWins++
    else if (aG < bG) bWins++
    else draws++
  }

  return { finished, aWins, bWins, draws, aGoals, bGoals }
}

export default async function H2HPage({ params }: Props) {
  const { leagueCode, teamId, opponentId } = params
  const code = leagueCode.toUpperCase()
  const league = LEAGUES[code]

  let teamA: Team | null = null
  let teamB: Team | null = null
  let allMatchesA: Match[] = []
  let error: string | null = null

  try {
    ;[teamA, teamB, allMatchesA] = await Promise.all([
      getTeam(teamId),
      getTeam(opponentId),
      getTeamMatches(teamId, { limit: 100 }),
    ])
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load H2H data'
  }

  if (!teamA || !teamB) {
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          <p className="font-medium">Unable to load H2H data</p>
          <p className="text-sm mt-1 text-red-500">{error}</p>
        </div>
      )
    }
    notFound()
  }

  const { finished, aWins, bWins, draws, aGoals, bGoals } = computeH2HStats(
    allMatchesA,
    Number(teamId),
    Number(opponentId)
  )

  const total = aWins + bWins + draws
  const aWinPct = total > 0 ? Math.round((aWins / total) * 100) : 0
  const bWinPct = total > 0 ? Math.round((bWins / total) * 100) : 0
  const drawPct = total > 0 ? 100 - aWinPct - bWinPct : 0

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${teamA.name} vs ${teamB.name} Head-to-Head`,
    description: `Historical H2H record: ${teamA.name} ${aWins}W ${draws}D ${bWins}L vs ${teamB.name}`,
    sport: 'Soccer',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/leagues/${code}`} className="hover:text-blue-600 transition-colors">{league?.name ?? code}</Link>
        <span>/</span>
        <Link href={`/leagues/${code}/teams/${teamId}`} className="hover:text-blue-600 transition-colors">{teamA.name}</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">vs {teamB.name}</span>
      </nav>

      {/* H2H Hero card */}
      <div className="apple-card p-6 mb-6">
        <h1 className="text-xl font-bold text-gray-900 text-center mb-8 tracking-tight">
          Head-to-Head Record
        </h1>

        {/* Teams row */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/leagues/${code}/teams/${teamId}`}
            className="flex flex-col items-center gap-2.5 hover:opacity-75 transition-opacity flex-1 min-w-0"
          >
            <TeamCrest src={teamA.crest} alt={teamA.name} size={72} />
            <span className="font-bold text-gray-900 text-center text-sm sm:text-base leading-tight">{teamA.name}</span>
          </Link>

          <div className="flex-shrink-0 text-center px-4">
            <div className="text-4xl font-black text-gray-900 tabular-nums">
              {aWins}<span className="text-gray-300 mx-1 font-light">–</span>{bWins}
            </div>
            <div className="text-sm text-gray-400 mt-1.5 font-medium">{draws} draw{draws !== 1 ? 's' : ''}</div>
            <div className="text-xs text-gray-300 mt-1">
              {aGoals} – {bGoals} goals
            </div>
          </div>

          <Link
            href={`/leagues/${code}/teams/${opponentId}`}
            className="flex flex-col items-center gap-2.5 hover:opacity-75 transition-opacity flex-1 min-w-0"
          >
            <TeamCrest src={teamB.crest} alt={teamB.name} size={72} />
            <span className="font-bold text-gray-900 text-center text-sm sm:text-base leading-tight">{teamB.name}</span>
          </Link>
        </div>

        {/* Win % bar */}
        {total > 0 && (
          <div className="mt-8">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5 font-medium">
              <span>{aWinPct}%</span>
              <span className="text-gray-300">{drawPct}% draws</span>
              <span>{bWinPct}%</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden flex bg-gray-100">
              <div className="bg-blue-500 transition-all" style={{ width: `${aWinPct}%` }} />
              <div className="bg-orange-300 transition-all" style={{ width: `${drawPct}%` }} />
              <div className="bg-red-400 transition-all" style={{ width: `${bWinPct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1.5">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
                {teamA.shortName || teamA.name}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-orange-300 rounded-full" />
                Draw
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-red-400 rounded-full" />
                {teamB.shortName || teamB.name}
              </span>
            </div>
          </div>
        )}
      </div>

      <AdSenseSlot format="leaderboard" label="Top Ad" />

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: `${teamA.shortName || teamA.name} Wins`, value: aWins, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
          { label: 'Draws', value: draws, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-100' },
          { label: `${teamB.shortName || teamB.name} Wins`, value: bWins, color: 'text-red-500', bg: 'bg-red-50 border-red-100' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-4 text-center`}>
            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1.5 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Match-by-match table */}
      <div className="apple-card overflow-x-auto mb-6">
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 text-sm">
            All H2H Matches
          </h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{finished.length} found</span>
        </div>

        {finished.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            No head-to-head matches found in available data.
            <p className="text-xs mt-2 text-gray-300">The free API tier may not include all historical matches.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest">
                <th className="px-3 py-2.5 text-left hidden sm:table-cell">Date</th>
                <th className="px-3 py-2.5 text-left">Competition</th>
                <th className="px-3 py-2.5 text-right">Home</th>
                <th className="px-3 py-2.5 text-center font-bold text-gray-600">Score</th>
                <th className="px-3 py-2.5 text-left">Away</th>
              </tr>
            </thead>
            <tbody>
              {finished.map((m) => {
                const aIsHome = m.homeTeam.id === Number(teamId)
                const aGoal = (aIsHome ? m.score.fullTime.home : m.score.fullTime.away) ?? 0
                const bGoal = (aIsHome ? m.score.fullTime.away : m.score.fullTime.home) ?? 0
                const winner = aGoal > bGoal ? 'A' : aGoal < bGoal ? 'B' : 'D'
                return (
                  <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
                    <td className="px-3 py-2.5 text-gray-400 text-xs whitespace-nowrap hidden sm:table-cell">
                      {formatDate(m.utcDate)}
                    </td>
                    <td className="px-3 py-2.5 text-gray-400 text-xs">{m.competition.name}</td>
                    <td className={`px-3 py-2.5 text-right font-medium text-sm ${winner === (m.homeTeam.id === Number(teamId) ? 'A' : 'B') ? 'text-blue-700 font-semibold' : 'text-gray-500'}`}>
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="hidden sm:inline">{m.homeTeam.shortName || m.homeTeam.name}</span>
                        <TeamCrest src={m.homeTeam.crest} alt={m.homeTeam.name} size={18} />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-gray-900 font-mono whitespace-nowrap">
                      {m.score.fullTime.home} – {m.score.fullTime.away}
                    </td>
                    <td className={`px-3 py-2.5 text-left font-medium text-sm ${winner === (m.awayTeam.id === Number(teamId) ? 'A' : 'B') ? 'text-blue-700 font-semibold' : 'text-gray-500'}`}>
                      <div className="flex items-center gap-1.5">
                        <TeamCrest src={m.awayTeam.crest} alt={m.awayTeam.name} size={18} />
                        <span className="hidden sm:inline">{m.awayTeam.shortName || m.awayTeam.name}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <AdSenseSlot format="rectangle" label="Mid-page Ad" />

      {/* Reverse link */}
      <div className="mt-5 text-center">
        <Link
          href={`/leagues/${code}/teams/${opponentId}/vs/${teamId}`}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 bg-white border border-blue-200 rounded-full px-4 py-2 hover:shadow-sm transition-all"
        >
          ↔ View {teamB.shortName || teamB.name} vs {teamA.shortName || teamA.name} (reversed)
        </Link>
      </div>

      {/* SEO text */}
      <section className="mt-10 bg-white rounded-2xl border border-gray-200/80 p-6 text-gray-500 text-sm leading-relaxed">
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          {teamA.name} vs {teamB.name}: Full Head-to-Head History
        </h2>
        <p>
          This page shows the complete head-to-head record between {teamA.name} and {teamB.name}
          based on available match data. Out of {total} recorded meetings,{' '}
          {teamA.name} have won {aWins} times, {teamB.name} have won {bWins} times,
          and {draws} matches have ended in a draw.
          {aGoals + bGoals > 0 && ` A total of ${aGoals + bGoals} goals have been scored across these fixtures (${aGoals} for ${teamA.name}, ${bGoals} for ${teamB.name}).`}
        </p>
      </section>

      <AdSenseSlot format="leaderboard" label="Bottom Ad" className="mt-6" />
    </>
  )
}
