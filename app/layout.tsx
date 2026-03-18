import type { Metadata } from 'next'
import './globals.css'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import Script from 'next/script'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://soccer-stats-five.vercel.app'
const adsensePubId = 'ca-pub-8020256593365450'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'FootballStats – Live Soccer Standings, Scores & Stats',
    template: '%s | FootballStats',
  },
  description:
    'Free football stats: Premier League standings, La Liga top scorers, team histories, head-to-head records, and more. Updated daily.',
  keywords: [
    'football stats', 'soccer statistics', 'premier league standings',
    'la liga standings', 'bundesliga standings', 'serie a standings',
    'top scorers', 'head to head football', 'team history football',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'FootballStats',
    title: 'FootballStats – Live Soccer Standings, Scores & Stats',
    description: 'Free football stats for every major league. Standings, scorers, team histories & H2H records.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FootballStats – Live Soccer Standings, Scores & Stats',
    description: 'Free football stats for every major league.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePubId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Navigation />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
