'use client';

import Image from 'next/image';
import { useState } from 'react';

interface UserAvatarProps {
  src?: string;
  alt: string;
  className?: string;
  size?: number;
  isOnline?: boolean;
}

export const UserAvatar = ({
  src,
  alt,
  className = '',
  size = 48,
  isOnline = false, 
}: UserAvatarProps) => {
  const [imgSrc, setImgSrc] = useState(src || '/default-avatar.png');

  return (
    <div className="relative inline-block">
  <Image
    src={imgSrc}
    alt={alt}
    width={size}
    height={size}
    className={`rounded-full object-cover ${className}`}
    onError={() => setImgSrc('/default-avatar.png')}
  />
  {isOnline && (
    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
  )}
</div>

  );
};
