import { useEffect, useState } from 'react';
import { getSignedPointPhotoUrl } from './uploadPointPhoto';

export const PhotoThumb = ({ path, onClick }: { path: string; onClick?: () => void }) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    getSignedPointPhotoUrl(path).then((u) => {
      if (active) setUrl(u);
    });
    return () => {
      active = false;
    };
  }, [path]);
  if (!url) return <div className="w-16 h-16 rounded bg-muted animate-pulse" />;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-16 h-16 rounded overflow-hidden bg-muted/30 border"
    >
      <img src={url} alt="Photo" className="w-full h-full object-cover" />
    </button>
  );
};