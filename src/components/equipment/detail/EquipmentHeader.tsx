
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, ArrowLeft, Tractor, Gauge, MoreHorizontal, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import DeleteEquipmentDialog from './DeleteEquipmentDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { translateRawStatus, formatCounter } from './statusHelpers';
import { useEquipmentPhotos } from '@/hooks/equipment/useEquipmentPhotos';
import { equipmentMultiPhotoService } from '@/services/supabase/equipmentMultiPhotoService';

interface EquipmentHeaderProps {
  equipment: EquipmentItem;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const EquipmentHeader: React.FC<EquipmentHeaderProps> = ({
  equipment,
  onEdit,
  onDelete,
  isDeleting = false,
  canEdit = true,
  canDelete = true,
}) => {
  const navigate = useNavigate();
  const status = translateRawStatus(equipment.status);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { photos, getDisplayUrl } = useEquipmentPhotos(equipment.id);
  const [thumb, setThumb] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (photos && photos.length > 0) {
        const sorted = [...photos].sort((a, b) =>
          (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.display_order - b.display_order);
        const url = getDisplayUrl(sorted[0]);
        if (!cancelled) setThumb(url || null);
      } else if (equipment.image && equipment.image !== 'nul') {
        if (equipment.image.startsWith('data:') || equipment.image.startsWith('http')) {
          if (!cancelled) setThumb(equipment.image);
        } else {
          try {
            const url = await equipmentMultiPhotoService.getSignedUrl(equipment.image);
            if (!cancelled) setThumb(url || null);
          } catch { /* noop */ }
        }
      } else if (!cancelled) setThumb(null);
    })();
    return () => { cancelled = true; };
  }, [photos, equipment.image, getDisplayUrl]);

  const cleanStr = (v: any) => {
    if (v == null) return '';
    const s = String(v).trim();
    if (!s || ['undefined', 'null', 'unknown', 'nul'].includes(s.toLowerCase())) return '';
    return s;
  };
  const subtitle = cleanStr((equipment as any).category) || cleanStr(equipment.type) || cleanStr(equipment.model) || 'Équipement';
  const chips = [cleanStr(equipment.manufacturer), cleanStr(equipment.year), cleanStr(equipment.type)].filter(Boolean);
  const dotClass =
    status.key === 'active' ? 'bg-green-500'
    : status.key === 'watch' ? 'bg-orange-500'
    : status.key === 'maintenance' ? 'bg-violet-500'
    : 'bg-red-500';

  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="self-start text-muted-foreground -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux équipements
      </Button>

      <div className="flex items-start gap-4">
        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-muted/40 border border-border/60 overflow-hidden flex items-center justify-center shrink-0">
          {thumb ? (
            <img src={thumb} alt={equipment.name} className="h-full w-full object-contain" />
          ) : (
            <Tractor className="h-9 w-9 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-snug line-clamp-2 break-words safe-text">{equipment.name}</h1>
          <p className="text-sm text-muted-foreground line-clamp-1">{subtitle}</p>
          {chips.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {chips.map((c) => (
                <Badge key={c} variant="outline" className="text-[10px] font-normal bg-muted/40 border-border/60">{c}</Badge>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 mt-2 text-sm">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className={`h-2 w-2 rounded-full ${dotClass}`} />
              {status.label}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{formatCounter(equipment)}</span>
              <span className="hidden sm:inline">Compteur</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} disabled={isDeleting}>
              <Edit className="sm:mr-1.5 h-4 w-4" /><span className="hidden sm:inline">Modifier</span>
            </Button>
          )}
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setDeleteOpen(true); }} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {canDelete && (
        <DeleteEquipmentDialog
          equipmentId={equipment.id}
          equipmentName={equipment.name}
          isDeleting={isDeleting}
          onConfirm={onDelete}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          hideTrigger
        />
      )}
    </div>
  );
};

export default EquipmentHeader;
