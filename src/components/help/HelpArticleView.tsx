import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { helpArticles } from './articles';

interface HelpArticleViewProps {
  articleId: string;
  onBack: () => void;
}

export const HelpArticleView = ({ articleId, onBack }: HelpArticleViewProps) => {
  const article = helpArticles[articleId];

  if (!article) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
        <div className="p-6 text-sm text-muted-foreground">
          Article introuvable.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <h2 className="text-lg font-semibold text-foreground">{article.title}</h2>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {article.readTime} min de lecture
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div
          className={
            'p-4 sm:p-6 ' +
            '[&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-foreground ' +
            '[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-foreground ' +
            '[&_p]:text-sm [&_p]:mb-3 [&_p]:text-muted-foreground [&_p]:leading-relaxed ' +
            '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:space-y-1 ' +
            '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:space-y-1 ' +
            '[&_li]:text-sm [&_li]:text-muted-foreground [&_li]:leading-relaxed ' +
            '[&_strong]:text-foreground [&_strong]:font-semibold ' +
            '[&_em]:italic'
          }
        >
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>
      </ScrollArea>
    </div>
  );
};

export default HelpArticleView;