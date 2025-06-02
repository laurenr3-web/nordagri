
import { supabase } from '@/integrations/supabase/client';
import { checkSecureAuthStatus, validateFarmAccess, validateEquipmentAccess } from './secureAuthUtils';

/**
 * Enhanced authentication utilities with security improvements
 * This file now uses the secure utilities for better protection
 */

/**
 * Check the authentication status of the current user (secure version)
 */
export const checkAuthStatus = async () => {
  return await checkSecureAuthStatus();
};

/**
 * Check if the current user has permissions to access a table with enhanced security
 * @param tableName The name of the table to check permissions for
 * @param recordId Optional record ID to check for specific record permissions
 * @param farmId Optional farm ID for farm-scoped access control
 */
export const checkTablePermissions = async (tableName: string, recordId?: string, farmId?: string) => {
  try {
    const { authenticated, userId } = await checkSecureAuthStatus();
    
    if (!authenticated || !userId) {
      throw new Error("You must be logged in to access this resource");
    }
    
    // Enhanced permission checking with farm-based access control
    if (farmId) {
      await validateFarmAccess(farmId, 'viewer'); // Minimum viewer access required
    }
    
    // Table-specific permission checks
    switch (tableName) {
      case 'equipment':
        if (recordId) {
          await validateEquipmentAccess(parseInt(recordId), 'read');
        }
        break;
        
      case 'time_sessions':
        if (recordId) {
          const { data, error } = await supabase
            .from(tableName)
            .select('user_id, equipment_id')
            .eq('id', recordId)
            .single();
            
          if (error) {
            throw new Error("Could not verify record permissions");
          }
          
          // Users can access their own time sessions or if they have farm access
          if (data?.user_id !== userId) {
            if (data?.equipment_id) {
              await validateEquipmentAccess(data.equipment_id, 'read');
            } else {
              throw new Error("You don't have permission to access this time entry");
            }
          }
        }
        break;
        
      case 'maintenance_tasks':
      case 'fuel_logs':
      case 'parts_inventory':
        // These require farm membership validation
        if (farmId) {
          await validateFarmAccess(farmId, 'viewer');
        } else {
          throw new Error("Farm access required for this resource");
        }
        break;
        
      default:
        // For other tables, basic authentication is sufficient
        break;
    }
    
    return true;
  } catch (error) {
    console.error("Enhanced permission check failed:", error);
    throw error;
  }
};
