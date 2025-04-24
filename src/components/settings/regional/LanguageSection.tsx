
import React, { useState } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Save, Languages } from 'lucide-react';
import { useTranslation } from "react-i18next";

interface LanguageSectionProps {
  currentLanguage: string;
  loading: boolean;
  onUpdateLanguage: (language: string) => Promise<boolean>;
}

/**
 * Composant de sélection de langue pour les paramètres utilisateur
 */
export function LanguageSection({ currentLanguage, loading, onUpdateLanguage }: LanguageSectionProps) {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [isSaving, setIsSaving] = useState(false);
  
  const languages = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' }
  ];
  
  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
  };
  
  const handleSaveLanguage = async () => {
    setIsSaving(true);
    try {
      const success = await onUpdateLanguage(selectedLanguage);
      if (success) {
        // Changer la langue de l'interface i18n
        await i18n.changeLanguage(selectedLanguage);
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  const hasChanges = selectedLanguage !== currentLanguage;
  
  return (
    <SettingsSection
      title="Préférences régionales"
      description="Choisissez votre langue et vos préférences régionales"
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center mb-2">
                  <Languages className="h-5 w-5 mr-2 text-primary" />
                  <Label htmlFor="language-select" className="text-base">Langue de l'interface</Label>
                </div>
                <Select
                  value={selectedLanguage}
                  onValueChange={handleLanguageChange}
                  disabled={loading}
                >
                  <SelectTrigger id="language-select" className="w-full sm:w-[250px]">
                    <SelectValue placeholder="Sélectionnez une langue" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  La langue sélectionnée sera appliquée à l'ensemble de l'interface
                </p>
              </div>
              
              <Button 
                onClick={handleSaveLanguage} 
                disabled={loading || isSaving || !hasChanges}
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer la préférence
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsSection>
  );
}
