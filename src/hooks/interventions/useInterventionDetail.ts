
import { useQuery } from '@tanstack/react-query';
import { Intervention } from '@/types/Intervention';

// Simulated fetch function 
const fetchIntervention = async (id: number): Promise<Intervention> => {
  // This would be an API call in a real app
  return {
    id,
    title: `Intervention #${id}`,
    status: "completed" as const,
    priority: "medium" as const,
    equipment: "Tracteur John Deere",
    equipmentId: 123,
    description: "Maintenance régulière",
    startDate: new Date(),
    date: new Date(),
    location: "Champ Nord"
  };
};

export default function useInterventionDetail(id: number | undefined) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['intervention', id],
    queryFn: () => id !== undefined ? fetchIntervention(Number(id)) : Promise.reject('No ID provided'),
    enabled: id !== undefined,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  return { intervention: data, isLoading, error, refetch };
}
