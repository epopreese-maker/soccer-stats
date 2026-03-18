import { MetadataRoute } from 'next'
import { LEAGUES, getLeagueTeams } from '@/lib/api'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://footballstats.vercel.app'

export const revalidate = 86400 // regenerate sitemap daily

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = []

  // Home page
  urls.push({
    url: siteUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  })

  const leagueCodes = Object.keys(LEAGUES)

  // League standings + scorers pages
  for (const code of leagueCodes) {
    urls.push({
      url: `${siteUrl}/leagues/${code}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    })
    urls.push({
      url: `${siteUrl}/leagues/${code}/scorers`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    })
  }

  // Team pages + H2H pages (fetch once per league, batch carefully for rate limit)
  const mainLeagues = ['PL', 'PD', 'BL1', 'SA', 'FL1']

  for (const code of mainLeagues) {
    let teams: { id: number }[] = []
    try {
      const data = await getLeagueTeams(code)
      teams = data.teams
    } catch {
      continue
    }

    // Team history pages
    for (const team of teams) {
      urls.push({
        url: `${siteUrl}/leagues/${code}/teams/${team.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }

    // Head-to-head pages (every permutation)
    for (const teamA of teams) {
      for (const teamB of teams) {
        if (teamA.id !== teamB.id) {
          urls.push({
            url: `${siteUrl}/leagues/${code}/teams/${teamA.id}/vs/${teamB.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          })
        }
      }
    }
  }

  return urls
}
