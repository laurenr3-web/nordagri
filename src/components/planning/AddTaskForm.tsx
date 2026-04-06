
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlanningCategory, PlanningPriority } from '@/services/planning/planningService';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const categories: { value: PlanningCategory; label: string; icon: string }[] = [
  { value: 'animaux', label: 'Animaux', icon: '🐄' },
  { value: 'champs', label: 'Champs', icon: '🌾' },
  { value: 'alimentation', label: 'Alimentation', icon: '🥩' },
  { value: 'equipement', label: 'Équipement', icon: '🚜' },
  { value: 'batiment', label: 'Bâtiment', icon: '🏠' },
  { value: 'administration', label: 'Administration', icon: '📋' },
  { value: 'autre', label: 'Autre', icon: '📌' },
];

interface AddTaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    category: PlanningCategory;
    due_date: string;
    manual_priority?: PlanningPriority | null;
    assigned_to?: string | null;
    notes?: string | null;
    equipment_id?: number | null;
    field_name?: string | null;
    building_name?: string | null;
    animal_group?: string | null;
  }) => void;
  teamMembers?: { id: string; name: string }[];
  equipment?: { id: number; name: string }[];
}

function getDateStr(offset: number = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

export function AddTaskForm({ open, onClose, onSubmit, teamMembers = [], equipment = [] }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PlanningCategory>('autre');
  const [dateChoice, setDateChoice] = useState<'today' | 'tomorrow' | 'custom'>('today');
  const [customDate, setCustomDate] = useState(getDateStr());
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [showMore, setShowMore] = useState(false);
  const [notes, setNotes] = useState('');
  const [manualPriority, setManualPriority] = useState<string>('');
  const [equipmentId, setEquipmentId] = useState<string>('');
  const [fieldName, setFieldName] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [animalGroup, setAnimalGroup] = useState('');

  const resetForm = () => {
    setTitle('');
    setCategory('autre');
    setDateChoice('today');
    setCustomDate(getDateStr());
    setAssignedTo('');
    setShowMore(false);
    setNotes('');
    setManualPriority('');
    setEquipmentId('');
    setFieldName('');
    setBuildingName('');
    setAnimalGroup('');
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const due_date = dateChoice === 'today' ? getDateStr() : dateChoice === 'tomorrow' ? getDateStr(1) : customDate;

    onSubmit({
      title: title.trim(),
      category,
      due_date,
      manual_priority: manualPriority ? (manualPriority as PlanningPriority) : null,
      assigned_to: assignedTo || null,
      notes: notes || null,
      equipment_id: equipmentId ? parseInt(equipmentId) : null,
      field_name: fieldName || null,
      building_name: buildingName || null,
      animal_group: animalGroup || null,
    });

    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Ajouter une tâche</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Title */}
          <div>
            <Label className="text-sm font-medium">Titre *</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Nourrir les vaches"
              className="mt-1 h-12 text-base"
              autoFocus
            />
          </div>

          {/* Date - big buttons */}
          <div>
            <Label className="text-sm font-medium">Date</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <Button type="button" variant={dateChoice === 'today' ? 'default' : 'outline'}
                className="h-11" onClick={() => setDateChoice('today')}>
                Aujourd'hui
              </Button>
              <Button type="button" variant={dateChoice === 'tomorrow' ? 'default' : 'outline'}
                className="h-11" onClick={() => setDateChoice('tomorrow')}>
                Demain
              </Button>
              <Button type="button" variant={dateChoice === 'custom' ? 'default' : 'outline'}
                className="h-11" onClick={() => setDateChoice('custom')}>
                Choisir
              </Button>
            </div>
            {dateChoice === 'custom' && (
              <Input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} className="mt-2 h-11" />
            )}
          </div>

          {/* Category - grid of buttons */}
          <div>
            <Label className="text-sm font-medium">Catégorie</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {categories.map(c => (
                <Button key={c.value} type="button"
                  variant={category === c.value ? 'default' : 'outline'}
                  className="h-11 justify-start gap-2 text-sm"
                  onClick={() => setCategory(c.value)}>
                  <span>{c.icon}</span> {c.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Assigned to */}
          {teamMembers.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Assigné à</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger className="mt-1 h-11">
                  <SelectValue placeholder="Optionnel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Personne</SelectItem>
                  {teamMembers.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* More options */}
          <Button type="button" variant="ghost" className="w-full justify-between text-sm"
            onClick={() => setShowMore(!showMore)}>
            Plus d'options
            {showMore ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showMore && (
            <div className="space-y-3 border-t pt-3">
              <div>
                <Label className="text-sm">Note</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="mt-1" rows={2} placeholder="Détails..." />
              </div>
              <div>
                <Label className="text-sm">Priorité manuelle</Label>
                <Select value={manualPriority} onValueChange={setManualPriority}>
                  <SelectTrigger className="mt-1 h-11">
                    <SelectValue placeholder="Automatique (par catégorie)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatique</SelectItem>
                    <SelectItem value="critical">🔴 Critique</SelectItem>
                    <SelectItem value="important">🟡 Important</SelectItem>
                    <SelectItem value="todo">⚪ À faire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {equipment.length > 0 && (
                <div>
                  <Label className="text-sm">Équipement</Label>
                  <Select value={equipmentId} onValueChange={setEquipmentId}>
                    <SelectTrigger className="mt-1 h-11">
                      <SelectValue placeholder="Optionnel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun</SelectItem>
                      {equipment.map(e => (
                        <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label className="text-sm">Champ agricole</Label>
                <Input value={fieldName} onChange={e => setFieldName(e.target.value)} className="mt-1 h-11" placeholder="Nom du champ" />
              </div>
              <div>
                <Label className="text-sm">Bâtiment</Label>
                <Input value={buildingName} onChange={e => setBuildingName(e.target.value)} className="mt-1 h-11" placeholder="Nom du bâtiment" />
              </div>
              <div>
                <Label className="text-sm">Groupe d'animaux</Label>
                <Input value={animalGroup} onChange={e => setAnimalGroup(e.target.value)} className="mt-1 h-11" placeholder="Ex: Vaches laitières" />
              </div>
            </div>
          )}

          {/* Submit */}
          <Button className="w-full h-12 text-base font-semibold" onClick={handleSubmit} disabled={!title.trim()}>
            Ajouter la tâche
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
