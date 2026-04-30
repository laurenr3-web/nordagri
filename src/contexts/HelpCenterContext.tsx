import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { logger } from '@/utils/logger';

interface HelpCenterContextValue {
  isOpen: boolean;
  activeArticleId: string | null;
  searchQuery: string;
  activeTags: string[];
  open: (articleId?: string) => void;
  close: () => void;
  setActiveArticle: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
}

const HelpCenterContext = createContext<HelpCenterContextValue | null>(null);

export const HelpCenterProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const open = useCallback((articleId?: string) => {
    logger.info('[Help] Open center', { articleId: articleId ?? null });
    setActiveArticleId(articleId ?? null);
    setSearchQuery('');
    setActiveTags([]);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const clearTags = useCallback(() => setActiveTags([]), []);

  return (
    <HelpCenterContext.Provider
      value={{
        isOpen,
        activeArticleId,
        searchQuery,
        activeTags,
        open,
        close,
        setActiveArticle: setActiveArticleId,
        setSearchQuery,
        toggleTag,
        clearTags,
      }}
    >
      {children}
    </HelpCenterContext.Provider>
  );
};

export const useHelpCenter = (): HelpCenterContextValue => {
  const ctx = useContext(HelpCenterContext);
  if (!ctx) throw new Error('useHelpCenter must be used within HelpCenterProvider');
  return ctx;
};