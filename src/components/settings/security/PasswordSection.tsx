
import React, { useState } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Save, Eye, EyeOff } from 'lucide-react';

interface PasswordSectionProps {
  onUpdatePassword: (password: string) => Promise<boolean>;
}

export function PasswordSection({ onUpdatePassword }: PasswordSectionProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    setLoading(true);
    try {
      await onUpdatePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection 
      title="Changer le mot de passe" 
      description="Mettez à jour votre mot de passe pour sécuriser votre compte"
      icon={<Lock className="h-5 w-5" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-password">Nouveau mot de passe</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-10"
              required
            />
            <button 
              type="button" 
              className="absolute right-3 top-2.5 text-muted-foreground"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-10"
              required
            />
            <button 
              type="button" 
              className="absolute right-3 top-2.5 text-muted-foreground"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="text-sm text-destructive">
            {error}
          </div>
        )}
        
        <Button 
          type="submit" 
          disabled={loading || !newPassword || !confirmPassword}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mise à jour...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Mettre à jour le mot de passe
            </>
          )}
        </Button>
      </form>
    </SettingsSection>
  );
}
