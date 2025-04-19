
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";

const formSchema = z.object({
  part_id: z.number(),
  quantity: z.number().min(1),
  equipment_id: z.number().optional(),
  task_id: z.number().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function PartWithdrawalForm() {
  const [selectedPartStock, setSelectedPartStock] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
    },
  });

  // Fetch available parts
  const { data: parts = [], isLoading: isLoadingParts } = useQuery({
    queryKey: ["available-parts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parts_inventory")
        .select("id, name, quantity, farm_id")
        .gt("quantity", 0);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch equipment
  const { data: equipment = [], isLoading: isLoadingEquipment } = useQuery({
    queryKey: ["equipment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select("id, name");

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch maintenance tasks
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ["maintenance-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_tasks")
        .select("id, title")
        .eq("status", "active");

      if (error) throw error;
      return data || [];
    },
  });

  // Convert parts to combobox options
  const partOptions = parts.map(part => ({
    label: `${part.name} (Stock: ${part.quantity})`,
    value: part.id.toString()
  }));

  // Convert equipment to combobox options
  const equipmentOptions = equipment.map(eq => ({
    label: eq.name,
    value: eq.id.toString()
  }));

  // Convert tasks to combobox options
  const taskOptions = tasks.map(task => ({
    label: task.title,
    value: task.id.toString()
  }));

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Vérifier que la quantité est disponible
      if (values.quantity > selectedPartStock) {
        toast.error("Quantité demandée supérieure au stock disponible");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from("part_withdrawals").insert({
        part_id: values.part_id,
        quantity: values.quantity,
        equipment_id: values.equipment_id,
        task_id: values.task_id,
        notes: values.notes,
      });

      if (error) throw error;

      toast.success("Retrait enregistré avec succès");
      form.reset();
    } catch (error) {
      console.error("Erreur lors du retrait:", error);
      toast.error("Erreur lors de l'enregistrement du retrait");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="part_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pièce</FormLabel>
              <FormControl>
                <Combobox
                  options={partOptions}
                  placeholder={isLoadingParts ? "Chargement..." : "Sélectionner une pièce"}
                  emptyMessage="Aucune pièce disponible"
                  onSelect={(value) => {
                    if (value) {
                      field.onChange(parseInt(value));
                      const part = parts.find(p => p.id === parseInt(value));
                      setSelectedPartStock(part?.quantity || 0);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantité</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  min={1}
                  max={selectedPartStock}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="equipment_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Équipement</FormLabel>
              <FormControl>
                <Combobox
                  options={equipmentOptions}
                  placeholder={isLoadingEquipment ? "Chargement..." : "Sélectionner un équipement"}
                  emptyMessage="Aucun équipement disponible"
                  onSelect={(value) => value && field.onChange(parseInt(value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="task_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tâche (optionnel)</FormLabel>
              <FormControl>
                <Combobox
                  options={taskOptions}
                  placeholder={isLoadingTasks ? "Chargement..." : "Sélectionner une tâche"}
                  emptyMessage="Aucune tâche disponible"
                  onSelect={(value) => value && field.onChange(parseInt(value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optionnel)</FormLabel>
              <FormControl>
                <Textarea placeholder="Détails supplémentaires..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Valider le retrait
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
