
import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        "fixed bottom-20 right-4 z-40 lg:hidden",
        "h-10 w-10 rounded-full shadow-lg",
        "bg-primary text-primary-foreground",
        "flex items-center justify-center",
        "transition-all duration-300 active:scale-90",
        "animate-in fade-in slide-in-from-bottom-4"
      )}
      aria-label="Retour en haut"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
};

export default ScrollToTopButton;
