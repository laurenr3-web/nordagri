
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlanningCategory, PlanningPriority, PlanningTask } from '@/services/planning/planningService';
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
    is_recurring?: boolean;
    recurrence_type?: string | null;
    recurrence_days?: number[] | null;
  }) => void;
  teamMembers?: { id: string; name: string }[];
  equipment?: { id: number; name: string }[];
  task?: PlanningTask | null;
}

function getDateStr(offset: number = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

export function AddTaskForm({ open, onClose, onSubmit, teamMembers = [], equipment = [], task = null }: AddTaskFormProps) {
  const isEditMode = !!task;
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
  const [recurrenceType, setRecurrenceType] = useState<string>('none');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);

  const dayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

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
    setRecurrenceType('none');
    setRecurrenceDays([]);
  };

  // Pre-fill form when editing
  useEffect(() => {
    if (open && task) {
      setTitle(task.title || '');
      setCategory(task.category || 'autre');
      const today = getDateStr();
      const tomorrow = getDateStr(1);
      const taskDate = (task as any)._occurrence_date || task.due_date;
      if (taskDate === today) setDateChoice('today');
      else if (taskDate === tomorrow) setDateChoice('tomorrow');
      else { setDateChoice('custom'); setCustomDate(taskDate); }
      setAssignedTo(task.assigned_to || '');
      setNotes(task.notes || '');
      setManualPriority(task.manual_priority || '');
      setEquipmentId(task.equipment_id ? String(task.equipment_id) : '');
      setFieldName(task.field_name || '');
      setBuildingName(task.building_name || '');
      setAnimalGroup(task.animal_group || '');
      setRecurrenceType(task.is_recurring && task.recurrence_type ? task.recurrence_type : 'none');
      setRecurrenceDays(task.recurrence_days || []);
      // Open advanced section if any advanced field is set
      if (task.is_recurring || task.notes || task.manual_priority || task.equipment_id ||
          task.field_name || task.building_name || task.animal_group) {
        setShowMore(true);
      }
    } else if (open && !task) {
      resetForm();
    }
  }, [open, task]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    const due_date = dateChoice === 'today' ? getDateStr() : dateChoice === 'tomorrow' ? getDateStr(1) : customDate;

    const isRecurring = recurrenceType !== 'none';

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
      is_recurring: isRecurring,
      recurrence_type: isRecurring ? recurrenceType : null,
      recurrence_days: recurrenceType === 'custom' && recurrenceDays.length > 0 ? recurrenceDays : null,
    });

    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">{isEditMode ? 'Modifier la tâche' : 'Ajouter une tâche'}</DialogTitle>
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
              <Label className="text-sm font-medium">Assignée à</Label>
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
              {/* Recurrence */}
              <div>
                <Label className="text-sm flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" /> Récurrence
                </Label>
                <Select value={recurrenceType} onValueChange={setRecurrenceType}>
                  <SelectTrigger className="mt-1 h-11">
                    <SelectValue placeholder="Aucune" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    <SelectItem value="daily">Tous les jours</SelectItem>
                    <SelectItem value="weekly">Chaque semaine</SelectItem>
                    <SelectItem value="custom">Certains jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {recurrenceType === 'custom' && (
                <div>
                  <Label className="text-sm">Jours de la semaine</Label>
                  <div className="grid grid-cols-7 gap-1 mt-1">
                    {dayLabels.map((label, i) => (
                      <Button
                        key={i}
                        type="button"
                        variant={recurrenceDays.includes(i) ? 'default' : 'outline'}
                        className="h-10 px-0 text-xs"
                        onClick={() => {
                          setRecurrenceDays(prev =>
                            prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]
                          );
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

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
            {isEditMode ? 'Enregistrer les modifications' : 'Ajouter la tâche'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
