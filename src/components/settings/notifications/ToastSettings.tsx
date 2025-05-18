
import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface ToastSettingsProps {
  enabled: boolean;
  duration: number;
  setEnabled: (value: boolean) => void;
  setDuration: (value: number) => void;
}

const ToastSettings: React.FC<ToastSettingsProps> = ({
  enabled,
  duration,
  setEnabled,
  setDuration
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="toast-notifications" className="text-sm font-medium">
          Notifications toast
        </Label>
        <Switch
          id="toast-notifications"
          checked={enabled}
          onCheckedChange={setEnabled}
        />
      </div>
      
      {enabled && (
        <>
          <div className="space-y-2">
            <Label htmlFor="toast-duration" className="text-sm font-medium">
              Durée d'affichage
            </Label>
            <Select
              value={duration.toString()}
              onValueChange={(value) => setDuration(parseInt(value))}
            >
              <SelectTrigger id="toast-duration">
                <SelectValue placeholder="Choisir une durée" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3000">3 secondes</SelectItem>
                <SelectItem value="5000">5 secondes</SelectItem>
                <SelectItem value="8000">8 secondes</SelectItem>
                <SelectItem value="15000">15 secondes</SelectItem>
                <SelectItem value="30000">30 secondes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="toast-duration-slider" className="text-sm font-medium">
                Durée: {Math.round(duration / 1000)} secondes
              </Label>
            </div>
            <Slider
              id="toast-duration-slider"
              min={3000}
              max={30000}
              step={1000}
              value={[duration]}
              onValueChange={([value]) => setDuration(value)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ToastSettings;
