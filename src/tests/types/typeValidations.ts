
import { convertToApi, convertFromApi } from '@/utils/typeTransformers';
import type { Equipment, EquipmentDB } from '@/types/models/equipment';
import type { Intervention, InterventionDB } from '@/types/models/intervention';
import type { MaintenanceTask, MaintenanceTaskDB } from '@/types/models/maintenance';

/**
 * Test equipment type conversions
 */
export function testEquipmentTypeConversions(): boolean {
  const equipment: Equipment = {
    id: 1,
    name: 'Tractor',
    type: 'Heavy Machinery',
    model: 'XL2000',
    manufacturer: 'AgriTech',
    status: 'operational',
    purchaseDate: '2022-05-20',
    serialNumber: 'TR78945612',
    year: 2022
  };
  
  // Convert to DB format
  const equipmentDb = convertToApi<EquipmentDB>(equipment);
  
  // Verify conversion
  if (equipmentDb.name !== equipment.name || 
      equipmentDb.purchase_date !== equipment.purchaseDate ||
      equipmentDb.serial_number !== equipment.serialNumber) {
    console.error('Equipment to DB conversion failed', { equipment, equipmentDb });
    return false;
  }
  
  // Convert back to model format
  const equipmentBack = convertFromApi<Equipment>(equipmentDb);
  
  // Verify roundtrip conversion
  if (equipmentBack.name !== equipment.name || 
      equipmentBack.purchaseDate !== equipment.purchaseDate ||
      equipmentBack.serialNumber !== equipment.serialNumber) {
    console.error('DB to Equipment conversion failed', { equipmentDb, equipmentBack });
    return false;
  }
  
  console.log('Equipment type conversions passed');
  return true;
}

/**
 * Test intervention type conversions
 */
export function testInterventionTypeConversions(): boolean {
  const intervention: Intervention = {
    id: 1,
    title: 'Repair Hydraulic System',
    equipment: 'Tractor XL2000',
    equipmentId: 1,
    status: 'scheduled',
    priority: 'high',
    date: new Date('2023-06-15'),
    technician: 'John Smith',
    location: 'North Field',
    scheduledDuration: 2.5,
    partsUsed: [
      { id: 1, name: 'Hydraulic Oil', quantity: 5 },
      { id: 2, name: 'Filter', quantity: 1 }
    ]
  };
  
  // Convert to DB format
  const interventionDb = convertToApi<InterventionDB>(intervention);
  
  // Verify conversion
  if (interventionDb.title !== intervention.title || 
      interventionDb.equipment_id !== intervention.equipmentId ||
      typeof interventionDb.date !== 'string') {
    console.error('Intervention to DB conversion failed', { intervention, interventionDb });
    return false;
  }
  
  // Convert back to model format with JSON parsing for parts_used
  const interventionBack = convertFromApi<Intervention>(interventionDb, ['parts_used']);
  
  // Verify date handling
  const dateIsValid = interventionBack.date instanceof Date && 
                     !isNaN(interventionBack.date.getTime());
                     
  if (!dateIsValid) {
    console.error('Date conversion failed', { 
      original: intervention.date,
      afterConversion: interventionBack.date
    });
    return false;
  }
  
  console.log('Intervention type conversions passed');
  return true;
}

/**
 * Test maintenance task type conversions
 */
export function testMaintenanceTypeConversions(): boolean {
  const task: MaintenanceTask = {
    id: 1,
    title: 'Monthly Service',
    equipment: 'Tractor XL2000',
    equipmentId: 1,
    type: 'preventive',
    status: 'scheduled',
    priority: 'medium',
    dueDate: new Date('2023-07-01'),
    engineHours: 250,
    assignedTo: 'Jane Doe',
    notes: 'Check fluids and filters'
  };
  
  // Convert to DB format
  const taskDb = convertToApi<MaintenanceTaskDB>(task);
  
  // Verify conversion
  if (taskDb.title !== task.title || 
      taskDb.equipment_id !== task.equipmentId ||
      typeof taskDb.due_date !== 'string') {
    console.error('MaintenanceTask to DB conversion failed', { task, taskDb });
    return false;
  }
  
  // Convert back to model format
  const taskBack = convertFromApi<MaintenanceTask>(taskDb);
  
  // Verify essential fields preserved
  if (taskBack.title !== task.title || 
      taskBack.equipmentId !== task.equipmentId ||
      taskBack.type !== task.type) {
    console.error('DB to MaintenanceTask conversion failed', { taskDb, taskBack });
    return false;
  }
  
  console.log('MaintenanceTask type conversions passed');
  return true;
}

/**
 * Run all type validation tests
 */
export function runTypeValidations(): void {
  const results = [
    testEquipmentTypeConversions(),
    testInterventionTypeConversions(),
    testMaintenanceTypeConversions()
  ];
  
  const allPassed = results.every(result => result === true);
  
  if (allPassed) {
    console.log('✅ All type validations passed!');
  } else {
    console.error('❌ Some type validations failed!');
  }
}
