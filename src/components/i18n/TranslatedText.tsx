
import React from 'react';
import { useTranslation } from 'react-i18next';

interface TranslatedTextProps {
  i18nKey: string;
  values?: Record<string, any>;
  defaultText?: string;
  className?: string;
  as?: React.ElementType;
}

export function TranslatedText({
  i18nKey,
  values,
  defaultText,
  className,
  as: Component = 'span'
}: TranslatedTextProps) {
  const { t } = useTranslation();
  const translatedText = t(i18nKey, values);
  
  // If no translation found, use default text or key
  const text = translatedText === i18nKey ? (defaultText || i18nKey) : translatedText;
  
  return <Component className={className}>{text}</Component>;
}
