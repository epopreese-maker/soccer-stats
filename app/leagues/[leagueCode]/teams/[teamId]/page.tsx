import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  getTeam,
  getTeamMatches,
  getLeagueTeams,
  LEAGUES,
  Match,
  Team,
  formatScore,
  formatDate,
  teamSlug,
} from '@/lib/api'
import TeamCrest from '@/app/components/TeamCrest'
import AdSenseSlot from '@/app/components/AdSenseSlot'

interface Props {
  params: { leagueCode: string; teamId: string }
}

// Build static pages for all teams at build time
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

  let resultClass = 'text-gray-400'
  let resultLabel = ''
  if (finished) {
    const myGoals = isHome ? match.score.fullTime.home ?? 0 : match.score.fullTime.away ?? 0
    const theirGoals = isHome ? match.score.fullTime.away ?? 0 : match.score.fullTime.home ?? 0
    if (myGoals > theirGoals) { resultClass = 'text-green-600 font-bold'; resultLabel = 'W' }
    else if (myGoals === theirGoals) { resultClass = 'text-yellow-500 font-bold'; resultLabel = 'D' }
    else { resultClass = 'text-red-500 font-bold'; resultLabel = 'L' }
  }

  return (
    <tr className="border-b hover:bg-gray-50 transition-colors text-sm">
      <td className="px-3 py-2 text-gray-500 whitespace-nowrap hidden sm:table-cell">
        {formatDate(match.utcDate)}
      </td>
      <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">
        {match.competition.name}
      </td>
      <td className="px-3 py-2">
        <span className="text-xs text-gray-400 mr-1">{isHome ? 'H' : 'A'}</span>
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <TeamCrest src={opponent.crest} alt={opponent.name} size={20} />
          <span className="font-medium text-gray-800">{opponent.name}</span>
        </div>
      </td>
      <td className={`px-3 py-2 text-center font-mono ${finished ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
        {finished ? (isHome ? score : score.split(' - ').reverse().join(' - ')) : match.status}
      </td>
      <td className={`px-3 py-2 text-center ${resultClass}`}>{resultLabel}</td>
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
    [team, matches] = await Promise.all([
      getTeam(teamId),
      getTeamMatches(teamId, { limit: 50 }),
    ])
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load team data'
  }

  if (!team && !error) notFound()

  // Stats from match history
  const finished = matches.filter((m) => m.status === 'FINISHED')
  const wins = finished.filter((m) => {
    const isHome = m.homeTeam.id === Number(teamId)
    const myG = isHome ? (m.score.fullTime.home ?? 0) : (m.score.fullTime.away ?? 0)
    const thG = isHome ? (m.score.fullTime.away ?? 0) : (m.score.fullTime.home ?? 0)
    return myG > thG
  }).length
  const draws = finished.filter((m) => m.score.fullTime.home === m.score.fullTime.away).length
  const losses = finished.length - wins - draws

  // Get league teammates for H2H links
  let leagueTeammates: { id: number; name: string; crest: string }[] = []
  try {
    const { teams } = await getLeagueTeams(code)
    leagueTeammates = teams
      .filter((t) => t.id !== Number(teamId))
      .slice(0, 10)
      .map((t) => ({ id: t.id, name: t.name, crest: t.crest }))
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
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href={`/leagues/${code}`} className="hover:text-blue-600">{league?.name ?? code}</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{team?.name ?? `Team ${teamId}`}</span>
      </nav>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
          <p className="font-medium">Unable to load team data</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : team ? (
        <>
          {/* Team hero */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <TeamCrest src={team.crest} alt={team.name} size={80} />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{team.name}</h1>
                <p className="text-gray-500 text-sm">
                  {team.area?.name} • Founded {team.founded} • {team.venue}
                </p>
                {team.website && (
                  <a
                    href={team.website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-blue-600 text-sm hover:underline mt-1 inline-block"
                  >
                    Official Website ↗
                  </a>
                )}
              </div>
              {/* Quick stats */}
              <div className="flex gap-4 text-center">
                <div className="bg-green-50 rounded-lg px-4 py-3">
                  <div className="text-2xl font-bold text-green-700">{wins}</div>
                  <div className="text-xs text-gray-500">Wins</div>
                </div>
                <div className="bg-yellow-50 rounded-lg px-4 py-3">
                  <div className="text-2xl font-bold text-yellow-600">{draws}</div>
                  <div className="text-xs text-gray-500">Draws</div>
                </div>
                <div className="bg-red-50 rounded-lg px-4 py-3">
                  <div className="text-2xl font-bold text-red-600">{losses}</div>
                  <div className="text-xs text-gray-500">Losses</div>
                </div>
              </div>
            </div>
          </div>

          <AdSenseSlot format="leaderboard" label="Top Ad" />

          {/* H2H quick-links */}
          {leagueTeammates.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Head-to-Head: {team.name} vs…
              </h2>
              <div className="flex flex-wrap gap-2">
                {leagueTeammates.map((opp) => (
                  <Link
                    key={opp.id}
                    href={`/leagues/${code}/teams/${teamId}/vs/${opp.id}`}
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-sm hover:border-blue-400 hover:text-blue-600 transition-all"
                  >
                    <TeamCrest src={opp.crest} alt={opp.name} size={16} />
                    {opp.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Match history */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Recent Match History</h2>
              <span className="text-xs text-gray-400">{matches.length} matches</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-3 py-2 text-left hidden sm:table-cell">Date</th>
                  <th className="px-3 py-2 text-left">Competition</th>
                  <th className="px-3 py-2 text-center">H/A</th>
                  <th className="px-3 py-2 text-left">Opponent</th>
                  <th className="px-3 py-2 text-center">Score</th>
                  <th className="px-3 py-2 text-center">Result</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <MatchRow key={m.id} match={m} teamId={Number(teamId)} />
                ))}
              </tbody>
            </table>
            {matches.length === 0 && (
              <div className="py-10 text-center text-gray-400">No match data available.</div>
            )}
          </div>

          <AdSenseSlot format="rectangle" label="Mid-page Ad" className="mt-6" />

          {/* SEO text */}
          <section className="mt-8 text-gray-600 text-sm leading-relaxed">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {team.name} – Club History &amp; Statistics
            </h2>
            <p>
              {team.name} (abbreviated as {team.tla}) is a football club based in {team.area?.name},
              founded in {team.founded}. They play their home matches at {team.venue}.
              This page tracks their full match history including results against all opponents in
              the {league?.name ?? code} and other competitions. Use the head-to-head links above
              to compare {team.name} against any rival club.
            </p>
          </section>
        </>
      ) : null}

      <AdSenseSlot format="leaderboard" label="Bottom Ad" className="mt-6" />
    </>
  )
}
