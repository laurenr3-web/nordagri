
import React from 'react';
import { Button } from '@/components/ui/button';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';

interface InputControlsProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  isLoading: boolean;
  isRecording: boolean;
  toggleRecording: () => void;
  handleSendMessage: () => void;
}

const InputControls: React.FC<InputControlsProps> = ({
  inputValue,
  setInputValue,
  isLoading,
  isRecording,
  toggleRecording,
  handleSendMessage
}) => {
  return (
    <div className="p-4 border-t">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className={isRecording ? 'bg-red-100 text-red-500 animate-pulse' : ''}
          onClick={toggleRecording}
        >
          {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Écrivez votre message ici..."
          className="flex-1 px-4 py-2 border rounded-md"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          disabled={isLoading}
        />
        <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};

export default InputControls;
