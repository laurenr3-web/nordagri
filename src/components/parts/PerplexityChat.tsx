
import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { openaiChatService } from '@/services/openai/openaiChatService';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

const PerplexityChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Faire défiler automatiquement jusqu'au dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const { answer } = await openaiChatService.askQuestion(inputValue);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: answer,
        isUser: false
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Erreur lors de la réception de la réponse:', error);
      toast.error('Erreur de communication avec OpenAI', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-md">
      {/* Zone d'affichage des messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-background">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Posez une question sur les équipements ou pièces agricoles</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`${
                  message.isUser
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : 'mr-auto bg-muted'
                } max-w-[80%] rounded-lg p-3`}
              >
                <p className="whitespace-pre-line">{message.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Zone de saisie */}
      <Card className="border-t rounded-none">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Posez votre question ici..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !inputValue.trim()}
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerplexityChat;
