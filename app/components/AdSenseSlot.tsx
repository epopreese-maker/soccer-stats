'use client'

/**
 * AdSense placeholder component.
 * Once approved, replace the placeholder div with the real AdSense <ins> tag.
 * Set NEXT_PUBLIC_ADSENSE_PUB_ID in your Vercel env vars after approval.
 */

interface AdSenseSlotProps {
  slot?: string
  format?: 'auto' | 'rectangle' | 'leaderboard' | 'skyscraper'
  className?: string
  label?: string
}

const FORMAT_CLASSES: Record<string, string> = {
  auto:        'min-h-[90px]',
  leaderboard: 'h-[90px]',
  rectangle:   'h-[250px]',
  skyscraper:  'h-[600px]',
}

export default function AdSenseSlot({
  slot,
  format = 'auto',
  className = '',
  label = 'Advertisement',
}: AdSenseSlotProps) {
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID

  // When AdSense is approved, render the real unit
  if (pubId && slot) {
    return (
      <div className={`ad-container my-4 ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={pubId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    )
  }

  // Placeholder shown before AdSense approval
  return (
    <div
      className={`ad-slot my-4 ${FORMAT_CLASSES[format] ?? 'min-h-[90px]'} ${className}`}
      aria-label={label}
    >
      <span>📢 {label} — AdSense placeholder</span>
    </div>
  )
}
