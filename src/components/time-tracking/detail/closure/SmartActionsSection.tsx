
import { Plus, Send, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface SmartActionsSectionProps {
  createRecurring: boolean;
  setCreateRecurring: (checked: boolean) => void;
  managerVerified: boolean;
  setManagerVerified: (checked: boolean) => void;
  onCreateIntervention: () => void;
}

export function SmartActionsSection({
  createRecurring,
  setCreateRecurring,
  managerVerified,
  setManagerVerified,
  onCreateIntervention
}: SmartActionsSectionProps) {
  return (
    <Card>
      <CardHeader className="px-4">
        <CardTitle className="text-base sm:text-lg">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <Button className="w-full" onClick={onCreateIntervention}>
          <Plus className="mr-2 h-4 w-4" />
          Créer une intervention liée
        </Button>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="recurring"
            checked={createRecurring}
            onCheckedChange={(checked) => setCreateRecurring(checked as boolean)}
          />
          <label
            htmlFor="recurring"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Créer une tâche récurrente
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified"
            checked={managerVerified}
            onCheckedChange={(checked) => setManagerVerified(checked as boolean)}
          />
          <label
            htmlFor="verified"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Session vérifiée par gestionnaire
          </label>
        </div>
      </CardContent>
    </Card>
  )
}
