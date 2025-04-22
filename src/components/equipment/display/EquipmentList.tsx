
import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EquipmentItem } from "../hooks/useEquipmentFilters";

/**
 * Table d'équipements (vue liste)
 */
interface EquipmentTableProps {
  equipment: EquipmentItem[];
  getStatusColor: (status: string | undefined) => string;
  getStatusText: (status: string | undefined) => string;
  handleEquipmentClick: (equipment: EquipmentItem) => void;
}

const EquipmentTable: React.FC<EquipmentTableProps> = ({
  equipment,
  getStatusColor,
  getStatusText,
  handleEquipmentClick
}) => (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">Image</TableHead>
          <TableHead>Nom</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Fabricant</TableHead>
          <TableHead>Modèle</TableHead>
          <TableHead>Année</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Emplacement</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {equipment.map((item) => (
          <TableRow
            key={item.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => handleEquipmentClick(item)}
            data-testid={`equipment-row-${item.id}`}
          >
            <TableCell>
              <div className="w-20 h-12 overflow-hidden rounded-md">
                <img
                  src={
                    item.image ||
                    "https://images.unsplash.com/photo-1585911171167-1f66ea3de00c?q=80&w=500&auto=format&fit=crop"
                  }
                  alt={item.name}
                  className="object-cover w-full h-full"
                />
              </div>
            </TableCell>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.type || "-"}</TableCell>
            <TableCell>{item.manufacturer || "-"}</TableCell>
            <TableCell>{item.model || "-"}</TableCell>
            <TableCell>{item.year || "-"}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(item.status)} variant="secondary">
                {getStatusText(item.status)}
              </Badge>
            </TableCell>
            <TableCell>{item.location || "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default EquipmentTable;
