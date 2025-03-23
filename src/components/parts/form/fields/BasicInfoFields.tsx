
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PartFormValues } from '../partFormTypes';

interface BasicInfoFieldsProps {
  form: UseFormReturn<PartFormValues>;
  customCategories: string[];
  onAddCategoryClick: () => void;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ 
  form, 
  customCategories,
  onAddCategoryClick
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Part Name</FormLabel>
            <FormControl>
              <Input placeholder="Air Filter" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="partNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Part Number</FormLabel>
            <FormControl>
              <Input placeholder="AF-JD-4290" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <div className="flex items-center gap-2">
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="filters">Filters</SelectItem>
                  <SelectItem value="engine">Engine</SelectItem>
                  <SelectItem value="drive">Drive System</SelectItem>
                  <SelectItem value="hydraulic">Hydraulic</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="brake">Brake System</SelectItem>
                  <SelectItem value="cooling">Cooling System</SelectItem>
                  {customCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={onAddCategoryClick}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="manufacturer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Manufacturer</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select manufacturer" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="John Deere">John Deere</SelectItem>
                <SelectItem value="Case IH">Case IH</SelectItem>
                <SelectItem value="New Holland">New Holland</SelectItem>
                <SelectItem value="Kubota">Kubota</SelectItem>
                <SelectItem value="Fendt">Fendt</SelectItem>
                <SelectItem value="Massey Ferguson">Massey Ferguson</SelectItem>
                <SelectItem value="Universal">Universal</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicInfoFields;
