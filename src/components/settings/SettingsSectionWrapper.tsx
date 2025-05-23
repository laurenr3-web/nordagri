
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SettingsSectionWrapperProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onSave?: () => Promise<void>;
  hasChanges?: boolean;
  className?: string;
  showSaveButton?: boolean;
}

export const SettingsSectionWrapper = ({ 
  title, 
  description, 
  children, 
  icon,
  onSave,
  hasChanges = false,
  className,
  showSaveButton = true
}: SettingsSectionWrapperProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    if (!onSave || isSaving) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      await onSave();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Indicateur de modifications non sauvegardées */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"
          />
        )}
      </AnimatePresence>

      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 bg-primary/10 rounded-lg">
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              {description && (
                <CardDescription className="mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          
          {/* Bouton de sauvegarde intégré dans l'en-tête */}
          {showSaveButton && onSave && (
            <AnimatePresence>
              {(hasChanges || saveSuccess) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    size="sm"
                    className={cn(
                      "transition-all",
                      saveSuccess && "bg-green-600 hover:bg-green-700"
                    )}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : saveSuccess ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Enregistré
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};
