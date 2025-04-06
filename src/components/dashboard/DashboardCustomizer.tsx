
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings2, LayoutDashboard, MoveVertical, RotateCcw, Check, X } from 'lucide-react';
import { DashboardPreferences, DashboardSection } from '@/hooks/dashboard/useDashboardPreferences';
import { toast } from 'sonner';

interface DashboardCustomizerProps {
  preferences: DashboardPreferences;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  updateLayout: (layout: 'grid' | 'list' | 'compact') => void;
  updateColumnCount: (count: 1 | 2 | 3 | 4) => void;
  resetPreferences: () => void;
}

export function DashboardCustomizer({
  preferences,
  isEditing,
  setIsEditing,
  toggleSectionVisibility,
  updateLayout,
  updateColumnCount,
  resetPreferences
}: DashboardCustomizerProps) {
  const handleReset = () => {
    resetPreferences();
    toast.success("Mise en page du tableau de bord réinitialisée");
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isEditing ? "secondary" : "outline"}
        size="sm"
        onClick={() => setIsEditing(!isEditing)}
        className="flex items-center gap-2"
      >
        {isEditing ? (
          <>
            <Check className="h-4 w-4" />
            Terminé
          </>
        ) : (
          <>
            <MoveVertical className="h-4 w-4" />
            Réorganiser
          </>
        )}
      </Button>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Personnaliser
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Personnaliser le tableau de bord</SheetTitle>
            <SheetDescription>
              Configurez les sections et la mise en page de votre tableau de bord.
            </SheetDescription>
          </SheetHeader>

          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Mise en page</h3>
              <Select
                value={preferences.layout}
                onValueChange={(value) => updateLayout(value as 'grid' | 'list' | 'compact')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une mise en page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Disposition</SelectLabel>
                    <SelectItem value="grid">Grille</SelectItem>
                    <SelectItem value="list">Liste</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Nombre de colonnes</h3>
              <Select
                value={preferences.columnCount.toString()}
                onValueChange={(value) => updateColumnCount(parseInt(value) as 1 | 2 | 3 | 4)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner le nombre de colonnes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Colonnes</SelectLabel>
                    <SelectItem value="1">1 colonne</SelectItem>
                    <SelectItem value="2">2 colonnes</SelectItem>
                    <SelectItem value="3">3 colonnes</SelectItem>
                    <SelectItem value="4">4 colonnes</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Sections visibles</h3>
              {Object.values(preferences.sections).map((section) => (
                <div key={section.id} className="flex items-center justify-between">
                  <Label htmlFor={`toggle-${section.id}`} className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    {section.title}
                  </Label>
                  <Switch
                    id={`toggle-${section.id}`}
                    checked={section.visible}
                    onCheckedChange={() => toggleSectionVisibility(section.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          <SheetFooter className="gap-2 sm:gap-0">
            <SheetClose asChild>
              <Button type="button" variant="outline" className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Annuler
              </Button>
            </SheetClose>
            <Button 
              variant="destructive" 
              onClick={handleReset} 
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Réinitialiser
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
