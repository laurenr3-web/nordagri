
import React from 'react';
import { SettingsSection } from '../SettingsSection';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export const RegionalPreferencesSection = () => {
  const handleSaveRegionalPreferences = () => {
    toast.success('Regional preferences saved successfully');
  };

  return (
    <SettingsSection
      title="Regional Preferences"
      description="Configure units of measurement, currency, and date formats"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="units">Measurement Units</Label>
          <Select defaultValue="metric">
            <SelectTrigger id="units">
              <SelectValue placeholder="Select units" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">Metric (km, kg, ha)</SelectItem>
              <SelectItem value="imperial">Imperial (mi, lb, acres)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select defaultValue="eur">
            <SelectTrigger id="currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eur">Euro (€)</SelectItem>
              <SelectItem value="usd">US Dollar ($)</SelectItem>
              <SelectItem value="gbp">British Pound (£)</SelectItem>
              <SelectItem value="cad">Canadian Dollar (C$)</SelectItem>
              <SelectItem value="aud">Australian Dollar (A$)</SelectItem>
              <SelectItem value="jpy">Japanese Yen (¥)</SelectItem>
              <SelectItem value="chf">Swiss Franc (CHF)</SelectItem>
              <SelectItem value="cny">Chinese Yuan (¥)</SelectItem>
              <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
              <SelectItem value="brl">Brazilian Real (R$)</SelectItem>
              <SelectItem value="rub">Russian Ruble (₽)</SelectItem>
              <SelectItem value="zar">South African Rand (R)</SelectItem>
              <SelectItem value="mxn">Mexican Peso (Mex$)</SelectItem>
              <SelectItem value="sgd">Singapore Dollar (S$)</SelectItem>
              <SelectItem value="nzd">New Zealand Dollar (NZ$)</SelectItem>
              <SelectItem value="hkd">Hong Kong Dollar (HK$)</SelectItem>
              <SelectItem value="sek">Swedish Krona (kr)</SelectItem>
              <SelectItem value="nok">Norwegian Krone (kr)</SelectItem>
              <SelectItem value="dkk">Danish Krone (kr)</SelectItem>
              <SelectItem value="pln">Polish Złoty (zł)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date-format">Date Format</Label>
          <Select defaultValue="dd/mm/yyyy">
            <SelectTrigger id="date-format">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
              <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
              <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select defaultValue="en">
            <SelectTrigger id="language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="it">Italiano</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
              <SelectItem value="nl">Nederlands</SelectItem>
              <SelectItem value="ru">Русский</SelectItem>
              <SelectItem value="zh">中文</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="hi">हिन्दी</SelectItem>
              <SelectItem value="ko">한국어</SelectItem>
              <SelectItem value="tr">Türkçe</SelectItem>
              <SelectItem value="vi">Tiếng Việt</SelectItem>
              <SelectItem value="th">ไทย</SelectItem>
              <SelectItem value="pl">Polski</SelectItem>
              <SelectItem value="uk">Українська</SelectItem>
              <SelectItem value="sv">Svenska</SelectItem>
              <SelectItem value="no">Norsk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button className="mt-4" onClick={handleSaveRegionalPreferences}>Save Regional Preferences</Button>
    </SettingsSection>
  );
};
