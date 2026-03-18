import Image from 'next/image'

interface TeamCrestProps {
  src: string
  alt: string
  size?: number
  className?: string
}

export default function TeamCrest({ src, alt, size = 32, className = '' }: TeamCrestProps) {
  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="object-contain"
          unoptimized // SVGs from football-data.org work better unoptimized
        />
      ) : (
        <div
          className="rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs"
          style={{ width: size, height: size }}
        >
          {alt.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  )
}
