import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useDataInitialization() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initialize = async () => {
      setIsInitializing(true);
      try {
        // Check if the parts table is already populated
        const { data: parts, error: partsError, count } = await supabase
          .from('parts_inventory')
          .select('*', { count: 'exact', head: true });

        if (partsError) {
          throw new Error(`Error checking parts inventory: ${partsError.message}`);
        }

        if (count === 0) {
          // If the parts table is empty, add mock parts
          await addMockPartsToDb();
          toast({
            title: "Data Initialized",
            description: "Mock parts data added to the database.",
          });
        } else {
          console.log('Parts inventory already populated, skipping initialization.');
        }

        setIsComplete(true);
      } catch (error: any) {
        console.error('Data initialization failed:', error);
        toast({
          title: "Initialization Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, [toast]);

  const addMockPartsToDb = async () => {
    try {
      // Define mock parts data using string[] for compatible_with to match Supabase expectations
      const mockPartsData = [
        {
          name: "Air Filter",
          part_number: "AF-JD-4290",
          category: "Filters",
          supplier: "John Deere",
          compatible_with: ["1", "2"], // Convert to strings for Supabase
          quantity: 15,
          unit_price: 89.99,
          location: "Warehouse A",
          reorder_threshold: 5,
        },
        {
          name: "Hydraulic Oil Filter",
          part_number: "HOF-3842",
          category: "Filters",
          supplier: "Case IH",
          compatible_with: ["3", "4"], // Convert to strings for Supabase
          quantity: 8,
          unit_price: 44.50,
          location: "Warehouse A",
          reorder_threshold: 4,
        },
        {
          name: "Transmission Belt",
          part_number: "TB-NH-4502",
          category: "Drive",
          supplier: "New Holland",
          compatible_with: ["5", "6"], // Convert to strings for Supabase
          quantity: 3,
          unit_price: 76.25,
          location: "Warehouse B",
          reorder_threshold: 3,
        },
      ];

      await supabase.from('parts_inventory').insert(mockPartsData);
      
      console.log('Mock parts added successfully!');
    } catch (error) {
      console.error('Error adding mock parts:', error);
    }
  };

  const initializeData = async () => {
    setIsInitializing(true);
    try {
      await addMockPartsToDb();
      setIsComplete(true);
      toast({
        title: "Data Initialized",
        description: "The database has been initialized with mock data.",
      });
    } catch (error: any) {
      console.error("Data initialization failed:", error);
      toast({
        title: "Initialization Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return { isInitializing, isComplete, initializeData };
}
