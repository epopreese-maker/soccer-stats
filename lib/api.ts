/**
 * football-data.org v4 API wrapper
 * Free tier: 10 req/min, covers PL, PD, BL1, SA, FL1, CL and more
 */

const BASE_URL = 'https://api.football-data.org/v4'
const API_KEY = process.env.FOOTBALL_DATA_API_KEY!

// ---------- Types ----------

export interface Competition {
  id: number
  name: string
  code: string
  type: string
  emblem: string
  area: { name: string; flag: string }
  currentSeason: { id: number; startDate: string; endDate: string; currentMatchday: number }
}

export interface Team {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
  address: string
  website: string
  founded: number
  venue: string
  area: { name: string }
}

export interface Standing {
  position: number
  team: { id: number; name: string; shortName: string; crest: string }
  playedGames: number
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  form: string
}

export interface StandingsTable {
  stage: string
  type: string
  group: string | null
  table: Standing[]
}

export interface Scorer {
  player: { id: number; name: string; nationality: string; section: string }
  team: { id: number; name: string; shortName?: string; crest: string }
  goals: number
  assists: number | null
  penalties: number | null
  playedMatches: number
}

export interface Match {
  id: number
  utcDate: string
  status: string
  matchday: number
  stage: string
  homeTeam: { id: number; name: string; shortName: string; crest: string }
  awayTeam: { id: number; name: string; shortName: string; crest: string }
  score: {
    winner: string | null
    duration: string
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
  }
  competition: { id: number; name: string; code: string; emblem: string }
}

export interface H2HData {
  aggregates: {
    numberOfMatches: number
    totalGoals: number
    homeTeam: { id: number; name: string; wins: number; draws: number; losses: number }
    awayTeam: { id: number; name: string; wins: number; draws: number; losses: number }
  }
  matches: Match[]
}

// ---------- League catalogue ----------

export const LEAGUES: Record<string, { name: string; country: string; flag: string }> = {
  PL:  { name: 'Premier League',    country: 'England',  flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  PD:  { name: 'La Liga',           country: 'Spain',    flag: '🇪🇸' },
  BL1: { name: 'Bundesliga',        country: 'Germany',  flag: '🇩🇪' },
  SA:  { name: 'Serie A',           country: 'Italy',    flag: '🇮🇹' },
  FL1: { name: 'Ligue 1',           country: 'France',   flag: '🇫🇷' },
  CL:  { name: 'UEFA Champions League', country: 'Europe', flag: '🇪🇺' },
  EL:  { name: 'UEFA Europa League',   country: 'Europe', flag: '🇪🇺' },
  EC:  { name: 'European Championship', country: 'Europe', flag: '🇪🇺' },
  WC:  { name: 'FIFA World Cup',    country: 'World',    flag: '🌍' },
  DED: { name: 'Eredivisie',        country: 'Netherlands', flag: '🇳🇱' },
  PPL: { name: 'Primeira Liga',     country: 'Portugal', flag: '🇵🇹' },
}

// ---------- Fetcher ----------

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-Auth-Token': API_KEY },
    next: { revalidate: 3600 }, // ISR: revalidate every hour
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status} for ${path}: ${text}`)
  }

  return res.json() as Promise<T>
}

// ---------- API calls ----------

export async function getStandings(leagueCode: string) {
  const data = await apiFetch<{ standings: StandingsTable[]; competition: Competition; season: { startDate: string; endDate: string } }>(
    `/competitions/${leagueCode}/standings`
  )
  return data
}

export async function getScorers(leagueCode: string, limit = 20) {
  const data = await apiFetch<{ scorers: Scorer[]; competition: Competition; season: { startDate: string; endDate: string } }>(
    `/competitions/${leagueCode}/scorers?limit=${limit}`
  )
  return data
}

export async function getLeagueTeams(leagueCode: string) {
  const data = await apiFetch<{ teams: Team[]; competition: Competition; season: { startDate: string; endDate: string } }>(
    `/competitions/${leagueCode}/teams`
  )
  return data
}

export async function getTeam(teamId: number | string) {
  return apiFetch<Team>(`/teams/${teamId}`)
}

export async function getTeamMatches(
  teamId: number | string,
  options: { status?: string; limit?: number; competitions?: string } = {}
) {
  const params = new URLSearchParams()
  if (options.status) params.set('status', options.status)
  if (options.limit) params.set('limit', String(options.limit))
  if (options.competitions) params.set('competitions', options.competitions)

  const qs = params.toString() ? `?${params.toString()}` : ''
  const data = await apiFetch<{ matches: Match[] }>(`/teams/${teamId}/matches${qs}`)
  return data.matches
}

export async function getH2H(matchId: number | string) {
  const data = await apiFetch<{ head2head: H2HData; match: Match }>(`/matches/${matchId}/head2head`)
  return data
}

export async function getCompetitionMatches(leagueCode: string, options: { matchday?: number; status?: string } = {}) {
  const params = new URLSearchParams()
  if (options.matchday) params.set('matchday', String(options.matchday))
  if (options.status) params.set('status', options.status)
  const qs = params.toString() ? `?${params.toString()}` : ''
  const data = await apiFetch<{ matches: Match[]; competition: Competition }>(
    `/competitions/${leagueCode}/matches${qs}`
  )
  return data
}

// Utility: get all teams across main leagues for sitemap generation
export async function getAllTeamsForSitemap(): Promise<{ teamId: number; leagueCode: string }[]> {
  const results: { teamId: number; leagueCode: string }[] = []
  const mainLeagues = ['PL', 'PD', 'BL1', 'SA', 'FL1']

  for (const code of mainLeagues) {
    try {
      const { teams } = await getLeagueTeams(code)
      for (const t of teams) {
        results.push({ teamId: t.id, leagueCode: code })
      }
    } catch {
      // Skip failed leagues silently during build
    }
  }

  return results
}

// Utility: slugify team name for readable URLs
export function teamSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// Utility: format match score
export function formatScore(match: Match): string {
  const h = match.score.fullTime.home
  const a = match.score.fullTime.away
  if (h === null || a === null) return 'vs'
  return `${h} - ${a}`
}

// Utility: format date nicely
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
