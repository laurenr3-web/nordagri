import { useMemo } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { useHelpCenter } from '@/contexts/HelpCenterContext';
import { helpArticles } from './articles';
import { HELP_CATEGORIES, type HelpArticle, type HelpCategory } from './articles/types';
import { HelpArticleView } from './HelpArticleView';

const normalize = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const HelpCenter = () => {
  const {
    isOpen,
    activeArticleId,
    searchQuery,
    close,
    setActiveArticle,
    setSearchQuery,
  } = useHelpCenter();

  const filteredArticles = useMemo<HelpArticle[]>(() => {
    const articles = Object.values(helpArticles);
    if (!searchQuery.trim()) return articles;
    const q = normalize(searchQuery);
    return articles.filter(
      (a) =>
        normalize(a.title).includes(q) ||
        a.keywords.some((k) => normalize(k).includes(q)) ||
        normalize(a.content).includes(q),
    );
  }, [searchQuery]);

  const articlesByCategory = useMemo<Map<HelpCategory, HelpArticle[]>>(() => {
    const map = new Map<HelpCategory, HelpArticle[]>();
    for (const article of filteredArticles) {
      const list = map.get(article.category) ?? [];
      list.push(article);
      map.set(article.category, list);
    }
    return map;
  }, [filteredArticles]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] p-0 flex flex-col"
      >
        {activeArticleId ? (
          <HelpArticleView
            articleId={activeArticleId}
            onBack={() => setActiveArticle(null)}
          />
        ) : (
          <div className="flex h-full flex-col">
            <div className="border-b p-4 space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  Centre d'aide
                </h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher un article…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  aria-label="Rechercher dans le centre d'aide"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {filteredArticles.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Aucun article ne correspond à votre recherche.
                  </p>
                ) : (
                  HELP_CATEGORIES.filter((cat) => articlesByCategory.has(cat.id))
                    .sort((a, b) => a.order - b.order)
                    .map((cat) => {
                      const articles = articlesByCategory.get(cat.id) ?? [];
                      return (
                        <div key={cat.id}>
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                            {cat.label}
                          </h3>
                          <div className="space-y-1">
                            {articles.map((article) => (
                              <button
                                key={article.id}
                                type="button"
                                onClick={() => setActiveArticle(article.id)}
                                className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors flex items-start gap-3 group"
                              >
                                <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground">
                                    {article.title}
                                  </p>
                                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {article.readTime} min
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </ScrollArea>

            <div className="border-t p-4 text-xs text-muted-foreground text-center">
              Vous ne trouvez pas votre réponse ? Contactez-nous à{' '}
              <a
                href="mailto:support@nordagri.ca"
                className="underline text-primary"
              >
                support@nordagri.ca
              </a>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default HelpCenter;