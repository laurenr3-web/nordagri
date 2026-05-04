
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, ArrowLeft, Tractor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import DeleteEquipmentDialog from './DeleteEquipmentDialog';
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

  const subtitle = equipment.manufacturer && equipment.model
    ? `${equipment.manufacturer} ${equipment.model}${equipment.year ? ` (${equipment.year})` : ''}`
    : `${equipment.type || 'Équipement'}${equipment.year ? ` (${equipment.year})` : ''}`;

  return (
    <div className="flex flex-col gap-3 mb-5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="self-start text-muted-foreground -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Retour
      </Button>

      <div className="flex items-start gap-4 sm:gap-5">
        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-muted/40 border border-border/60 overflow-hidden flex items-center justify-center shrink-0">
          {thumb ? (
            <img src={thumb} alt={equipment.name} className="h-full w-full object-contain" />
          ) : (
            <Tractor className="h-9 w-9 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{equipment.name}</h1>
            <Badge variant="outline" className={status.badgeClass}>{status.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 truncate">{subtitle}</p>
          <p className="text-xs text-muted-foreground mt-1.5">
            Compteur : <span className="font-medium text-foreground">{formatCounter(equipment.valeur_actuelle, equipment.unite_d_usure)}</span>
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} disabled={isDeleting}>
              <Edit className="mr-1.5 h-4 w-4" /> Modifier
            </Button>
          )}
          {canDelete && (
            <DeleteEquipmentDialog
              equipmentId={equipment.id}
              equipmentName={equipment.name}
              isDeleting={isDeleting}
              onConfirm={onDelete}
              triggerVariant="ghost"
            />
          )}
        </div>
      </div>

      {/* Mobile actions */}
      <div className="flex sm:hidden flex-wrap gap-2">
        {canEdit && (
          <Button variant="outline" size="sm" onClick={onEdit} disabled={isDeleting} className="flex-1">
            <Edit className="mr-1.5 h-4 w-4" /> Modifier
          </Button>
        )}
        {canDelete && (
          <DeleteEquipmentDialog
            equipmentId={equipment.id}
            equipmentName={equipment.name}
            isDeleting={isDeleting}
            onConfirm={onDelete}
          />
        )}
      </div>
    </div>
  );
};

export default EquipmentHeader;
