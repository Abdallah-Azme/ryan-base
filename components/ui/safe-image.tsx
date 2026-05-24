import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const FALLBACK_URL = 'https://raiyansoft.com/wp-content/uploads/2025/12/1.jpg';

const isValidImageUrl = (url: any): boolean => {
  if (!url || typeof url !== 'string') return false;
  try {
    if (url.startsWith('/')) return true;
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default function SafeImage({
  src,
  alt,
  className,
  fallbackSrc = FALLBACK_URL,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const handleError = () => {
    setHasError(true);
  };

  const initialSrc = hasError ? fallbackSrc : src;
  const finalSrc = isValidImageUrl(initialSrc)
    ? initialSrc
    : (isValidImageUrl(fallbackSrc) ? fallbackSrc : FALLBACK_URL);

  return (
    <div className={`relative ${className || ''}`} style={{ overflow: 'hidden' }}>
      <Image
        src={finalSrc}
        alt={alt || 'Image'}
        fill
        className="object-cover"
        onError={handleError}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}

