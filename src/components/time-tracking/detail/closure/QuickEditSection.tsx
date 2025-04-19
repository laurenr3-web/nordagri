
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface QuickEditSectionProps {
  notes: string;
  setNotes: (notes: string) => void;
  material: string;
  setMaterial: (material: string) => void;
  quantity: string;
  setQuantity: (quantity: string) => void;
}

export function QuickEditSection({
  notes,
  setNotes,
  material,
  setMaterial,
  quantity,
  setQuantity
}: QuickEditSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Édition rapide</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notes">Notes finales</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajouter des notes finales..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Matériel utilisé</Label>
            <Select value={material} onValueChange={setMaterial}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="filter">Filtre</SelectItem>
                <SelectItem value="oil">Huile</SelectItem>
                <SelectItem value="parts">Pièces</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantité</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
