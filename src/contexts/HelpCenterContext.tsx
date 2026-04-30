import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { logger } from '@/utils/logger';

interface HelpCenterContextValue {
  isOpen: boolean;
  activeArticleId: string | null;
  searchQuery: string;
  open: (articleId?: string) => void;
  close: () => void;
  setActiveArticle: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
}

const HelpCenterContext = createContext<HelpCenterContextValue | null>(null);

export const HelpCenterProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const open = useCallback((articleId?: string) => {
    logger.info('[Help] Open center', { articleId: articleId ?? null });
    setActiveArticleId(articleId ?? null);
    setSearchQuery('');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <HelpCenterContext.Provider
      value={{
        isOpen,
        activeArticleId,
        searchQuery,
        open,
        close,
        setActiveArticle: setActiveArticleId,
        setSearchQuery,
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