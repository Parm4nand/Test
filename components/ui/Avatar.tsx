'use client';

import Image from 'next/image';
import { getInitials } from '@/lib/utils';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 64,
  xl: 96,
  '2xl': 128,
};

export default function Avatar({ src, alt, size = 'md', className = '' }: AvatarProps) {
  const px = sizeMap[size];
  const textSize =
    px <= 24 ? 'text-[9px]' : px <= 32 ? 'text-xs' : px <= 40 ? 'text-sm' : px <= 64 ? 'text-lg' : 'text-2xl';

  if (src) {
    return (
      <div
        className={`relative shrink-0 rounded-full overflow-hidden ${className}`}
        style={{ width: px, height: px }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${px}px`}
          className="object-cover"
          unoptimized={src.startsWith('http')}
        />
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center ${className}`}
      style={{ width: px, height: px }}
    >
      <span className={`font-semibold text-white select-none ${textSize}`}>
        {getInitials(alt)}
      </span>
    </div>
  );
}
