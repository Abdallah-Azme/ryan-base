import React, { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const FALLBACK_URL = 'https://raiyansoft.com/wp-content/uploads/2025/12/1.jpg';

export default function SafeImage({
  src,
  alt,
  className,
  fallbackSrc = FALLBACK_URL,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <div className={`relative ${className || ''}`} style={{ overflow: 'hidden' }}>
      <Image
        src={(imgSrc as string) || fallbackSrc}
        alt={alt || 'Image'}
        fill
        className="object-cover"
        onError={handleError}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}
