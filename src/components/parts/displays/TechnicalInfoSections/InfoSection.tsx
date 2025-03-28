
import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InfoSectionProps {
  title: string;
  icon: ReactNode;
  content: string;
  partNumber?: string;
  searchQuery?: string;
}

export const InfoSection: React.FC<InfoSectionProps> = ({ 
  title, 
  icon, 
  content, 
  partNumber,
  searchQuery
}) => {
  const hasContent = content && 
                    content !== "Information non disponible" && 
                    !content.includes("non disponible");
  
  const handleSearch = () => {
    const query = searchQuery || `${partNumber}+${title.toLowerCase()}`;
    window.open(`https://google.com/search?q=${query}`, '_blank');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasContent ? (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-line">{content}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <p className="text-muted-foreground">
              Information non disponible pour cette référence
            </p>
            {partNumber && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={handleSearch}
              >
                Rechercher sur le web
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
