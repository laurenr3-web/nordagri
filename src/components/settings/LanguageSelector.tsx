
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { changeLanguage, SupportedLanguage } from '@/i18n';
import { Languages } from 'lucide-react';

interface LanguageOption {
  value: SupportedLanguage;
  label: string;
  nativeName: string;
}

const languages: LanguageOption[] = [
  { value: 'fr', label: 'Français', nativeName: 'Français' },
  { value: 'en', label: 'English', nativeName: 'English' },
];

interface LanguageSelectorProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function LanguageSelector({ 
  variant = 'default',
  className 
}: LanguageSelectorProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.substring(0, 2) as SupportedLanguage;
  
  const handleLanguageChange = (language: SupportedLanguage) => {
    changeLanguage(language);
  };
  
  if (variant === 'compact') {
    return (
      <Select value={currentLang} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[70px]">
          <SelectValue>
            {currentLang.toUpperCase()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem key={language.value} value={language.value}>
              {language.nativeName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className={className}>
      <Select value={currentLang} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            <SelectValue>
              {languages.find(l => l.value === currentLang)?.label || 'Language'}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem key={language.value} value={language.value}>
              {language.nativeName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
