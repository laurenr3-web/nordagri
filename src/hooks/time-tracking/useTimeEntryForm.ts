
import { useTimeEntryState } from './useTimeEntryState';
import { useTimeEntryValidation } from './useTimeEntryValidation';
import { useTimeEntryDataFetching } from './useTimeEntryDataFetching';

export function useTimeEntryForm() {
  const {
    formData,
    handleChange,
    setFormData
  } = useTimeEntryState();

  const {
    formError,
    validateForm,
    setFormError
  } = useTimeEntryValidation();

  const {
    equipments,
    interventions,
    locations,
    loading,
    fetchEquipments,
    fetchLocations
  } = useTimeEntryDataFetching();

  return {
    formData,
    equipments,
    interventions,
    locations,
    loading,
    formError,
    handleChange,
    validateForm,
    fetchEquipments,
    fetchLocations
  };
}
