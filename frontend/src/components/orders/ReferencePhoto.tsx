'use client';

import { useEffect, useState } from 'react';
import { apiFetchBlob } from '@/helpers/api';

interface ReferencePhotoProps {
  url: string;
  alt?: string;
  className?: string;
}

export function ReferencePhoto({ url, alt, className }: ReferencePhotoProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    setSrc(null);
    setMissing(false);

    apiFetchBlob(url)
      .then((blob) => {
        if (cancelled) return;
        if (!blob) {
          setMissing(true);
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  if (missing) return null;
  if (!src) {
    return (
      <div
        className="h-40 w-full animate-pulse rounded-xl bg-stone-100"
        aria-busy="true"
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt ?? ''}
      className={className ?? 'max-h-80 w-full rounded-xl border border-stone-200/80 object-contain'}
    />
  );
}