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
  params: { leagueCode: string; teamId: string }
}

export async function generateStaticParams() {
  const leagues = ['PL', 'PD', 'BL1', 'SA', 'FL1']
  const params: { leagueCode: string; teamId: string }[] = []

  for (const code of leagues) {
    try {
      const { teams } = await getLeagueTeams(code)
      for (const t of teams) {
        params.push({ leagueCode: code, teamId: String(t.id) })
      }
    } catch {
      // skip on build errors
    }
  }
  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { leagueCode, teamId } = params
  const league = LEAGUES[leagueCode.toUpperCase()]

  try {
    const team = await getTeam(teamId)
    const title = `${team.name} – History, Stats & Results | ${league?.name ?? leagueCode}`
    const description = `${team.name} full match history, results, and statistics in the ${league?.name ?? leagueCode}. Founded ${team.founded}. Home ground: ${team.venue}.`
    return {
      title,
      description,
      openGraph: { title, description, images: [{ url: team.crest, alt: team.name }] },
      alternates: { canonical: `/leagues/${leagueCode}/teams/${teamId}` },
    }
  } catch {
    return {}
  }
}

function MatchRow({ match, teamId }: { match: Match; teamId: number }) {
  const isHome = match.homeTeam.id === teamId
  const opponent = isHome ? match.awayTeam : match.homeTeam
  const score = formatScore(match)
  const finished = match.status === 'FINISHED'

  let resultBg = ''
  let resultLabel = ''
  let resultColor = 'text-gray-400'
  if (finished) {
    const myGoals = isHome ? match.score.fullTime.home ?? 0 : match.score.fullTime.away ?? 0
    const theirGoals = isHome ? match.score.fullTime.away ?? 0 : match.score.fullTime.home ?? 0
    if (myGoals > theirGoals) {
      resultBg = 'bg-green-500'
      resultLabel = 'W'
      resultColor = 'text-white'
    } else if (myGoals === theirGoals) {
      resultBg = 'bg-orange-400'
      resultLabel = 'D'
      resultColor = 'text-white'
    } else {
      resultBg = 'bg-red-500'
      resultLabel = 'L'
      resultColor = 'text-white'
    }
  }

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors text-sm">
      <td className="px-3 py-2.5 text-gray-400 whitespace-nowrap text-xs hidden sm:table-cell">
        {formatDate(match.utcDate)}
      </td>
      <td className="px-3 py-2.5 text-gray-400 text-xs whitespace-nowrap">
        {match.competition.name}
      </td>
      <td className="px-3 py-2.5">
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${isHome ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
          {isHome ? 'H' : 'A'}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <TeamCrest src={opponent.crest} alt={opponent.name} size={20} />
          <span className="font-medium text-gray-800 text-sm">{opponent.name}</span>
        </div>
      </td>
      <td className={`px-3 py-2.5 text-center font-mono font-semibold ${finished ? 'text-gray-900' : 'text-gray-400'}`}>
        {finished ? (isHome ? score : score.split(' - ').reverse().join(' - ')) : match.status}
      </td>
      <td className="px-3 py-2.5 text-center">
        {resultLabel && (
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${resultBg} ${resultColor}`}>
            {resultLabel}
          </span>
        )}
      </td>
    </tr>
  )
}

export default async function TeamPage({ params }: Props) {
  const { leagueCode, teamId } = params
  const code = leagueCode.toUpperCase()
  const league = LEAGUES[code]

  let team: Team | null = null
  let matches: Match[] = []
  let error: string | null = null

  try {
    ;[team, matches] = await Promise.all([
      getTeam(teamId),
      getTeamMatches(teamId, { limit: 50 }),
    ])
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load team data'
  }

  if (!team && !error) notFound()

  const finished = matches.filter((m) => m.status === 'FINISHED')
  const wins = finished.filter((m) => {
    const isHome = m.homeTeam.id === Number(teamId)
    const myG = isHome ? (m.score.fullTime.home ?? 0) : (m.score.fullTime.away ?? 0)
    const thG = isHome ? (m.score.fullTime.away ?? 0) : (m.score.fullTime.home ?? 0)
    return myG > thG
  }).length
  const draws = finished.filter((m) => m.score.fullTime.home === m.score.fullTime.away).length
  const losses = finished.length - wins - draws

  let leagueTeammates: { id: number; name: string; crest: string; shortName: string }[] = []
  try {
    const { teams } = await getLeagueTeams(code)
    leagueTeammates = teams
      .filter((t) => t.id !== Number(teamId))
      .slice(0, 12)
      .map((t) => ({ id: t.id, name: t.name, crest: t.crest, shortName: t.shortName || t.name }))
  } catch { /* skip */ }

  const jsonLd = team ? {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: team.name,
    sport: 'Soccer',
    foundingDate: team.founded,
    location: { '@type': 'Place', name: team.venue },
    url: team.website,
    logo: team.crest,
  } : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/leagues/${code}`} className="hover:text-blue-600 transition-colors">{league?.name ?? code}</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{team?.name ?? `Team ${teamId}`}</span>
      </nav>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          <p className="font-medium">Unable to load team data</p>
          <p className="text-sm mt-1 text-red-500">{error}</p>
        </div>
      ) : team ? (
        <>
          {/* Team hero card */}
          <div className="apple-card p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-shrink-0">
                <TeamCrest src={team.crest} alt={team.name} size={88} />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1">{team.name}</h1>
                <p className="text-sm text-gray-400">
                  {team.area?.name} &bull; Founded {team.founded} &bull; {team.venue}
                </p>
                {team.tla && (
                  <span className="inline-block mt-2 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {team.tla}
                  </span>
                )}
                {team.website && (
                  <a
                    href={team.website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-blue-600 text-sm hover:underline mt-2 inline-block ml-2"
                  >
                    Official site ↗
                  </a>
                )}
              </div>
              {/* Quick stats */}
              <div className="flex gap-3 text-center flex-shrink-0">
                <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                  <div className="text-2xl font-black text-green-600">{wins}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Wins</div>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                  <div className="text-2xl font-black text-orange-500">{draws}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Draws</div>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <div className="text-2xl font-black text-red-500">{losses}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Losses</div>
                </div>
              </div>
            </div>
          </div>

          <AdSenseSlot format="leaderboard" label="Top Ad" />

          {/* H2H quick-links */}
          {leagueTeammates.length > 0 && (
            <div className="mb-6">
              <h2 className="text-base font-semibold text-gray-800 mb-3">
                Head-to-Head vs Other {league?.name ?? code} Teams
              </h2>
              <div className="flex flex-wrap gap-2">
                {leagueTeammates.map((opp) => (
                  <Link
                    key={opp.id}
                    href={`/leagues/${code}/teams/${teamId}/vs/${opp.id}`}
                    className="flex items-center gap-2 bg-white border border-gray-200/80 rounded-full px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm transition-all"
                  >
                    <TeamCrest src={opp.crest} alt={opp.name} size={16} />
                    {opp.shortName}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Match history */}
          <div className="apple-card overflow-x-auto">
            <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 text-sm">Recent Match History</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{matches.length} matches</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest">
                  <th className="px-3 py-2.5 text-left hidden sm:table-cell">Date</th>
                  <th className="px-3 py-2.5 text-left">Competition</th>
                  <th className="px-3 py-2.5 text-center">H/A</th>
                  <th className="px-3 py-2.5 text-left">Opponent</th>
                  <th className="px-3 py-2.5 text-center">Score</th>
                  <th className="px-3 py-2.5 text-center">Result</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <MatchRow key={m.id} match={m} teamId={Number(teamId)} />
                ))}
              </tbody>
            </table>
            {matches.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">No match data available.</div>
            )}
          </div>

          <AdSenseSlot format="rectangle" label="Mid-page Ad" className="mt-6" />

          <section className="mt-8 bg-white rounded-2xl border border-gray-200/80 p-6 text-gray-500 text-sm leading-relaxed">
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              {team.name} – Club History &amp; Statistics
            </h2>
            <p>
              {team.name} ({team.tla}) is a football club based in {team.area?.name},
              founded in {team.founded}. They play home matches at {team.venue}.
              This page tracks their full match history including results against all opponents in
              the {league?.name ?? code} and other competitions. Use the head-to-head links above
              to compare {team.name} against any rival.
            </p>
          </section>
        </>
      ) : null}

      <AdSenseSlot format="leaderboard" label="Bottom Ad" className="mt-6" />
    </>
  )
}
