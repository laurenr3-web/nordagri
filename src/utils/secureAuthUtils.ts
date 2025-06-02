
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Enhanced authentication utilities with security improvements
 */

/**
 * Check authentication status with enhanced validation
 */
export const checkSecureAuthStatus = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Auth status check error:", error);
      throw new Error("Authentication error: " + error.message);
    }
    
    if (!data.session) {
      throw new Error("No active session found");
    }

    // Validate session freshness (sessions older than 24 hours should be refreshed)
    const sessionAge = Date.now() - (data.session.issued_at || 0) * 1000;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionAge > maxAge) {
      console.warn('Session is old, refreshing...');
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        throw new Error("Session refresh failed");
      }
    }
    
    return {
      authenticated: true,
      userId: data.session.user.id,
      email: data.session.user.email,
      sessionAge
    };
  } catch (error) {
    console.error("Secure auth check failed:", error);
    throw error;
  }
};

/**
 * Enhanced farm access validation with RLS enforcement
 */
export const validateFarmAccess = async (farmId: string, requiredRole?: string) => {
  try {
    const { authenticated, userId } = await checkSecureAuthStatus();
    
    if (!authenticated || !userId) {
      throw new Error("Authentication required");
    }

    // Check farm membership with role validation
    const { data: membership, error } = await supabase
      .from('farm_members')
      .select('role, status')
      .eq('farm_id', farmId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !membership) {
      throw new Error("Access denied: Not a member of this farm");
    }

    // Role-based access control
    if (requiredRole) {
      const roleHierarchy = { 'viewer': 1, 'member': 2, 'admin': 3, 'owner': 4 };
      const userRoleLevel = roleHierarchy[membership.role as keyof typeof roleHierarchy] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 999;

      if (userRoleLevel < requiredRoleLevel) {
        throw new Error(`Access denied: ${requiredRole} role required`);
      }
    }

    return {
      userId,
      farmId,
      role: membership.role,
      authorized: true
    };
  } catch (error) {
    console.error("Farm access validation failed:", error);
    throw error;
  }
};

/**
 * Secure equipment access validation
 */
export const validateEquipmentAccess = async (equipmentId: number, action: 'read' | 'write' | 'delete' = 'read') => {
  try {
    // First get the equipment's farm_id
    const { data: equipment, error: equipmentError } = await supabase
      .from('equipment')
      .select('farm_id')
      .eq('id', equipmentId)
      .single();

    if (equipmentError || !equipment) {
      throw new Error("Equipment not found or access denied");
    }

    // Determine required role based on action
    const requiredRoles = {
      'read': 'viewer',
      'write': 'member',
      'delete': 'admin'
    };

    // Validate farm access with appropriate role
    return await validateFarmAccess(equipment.farm_id, requiredRoles[action]);
  } catch (error) {
    console.error("Equipment access validation failed:", error);
    throw error;
  }
};

/**
 * Rate limiting helper (client-side basic implementation)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (entry.count >= maxAttempts) {
    const remainingTime = Math.ceil((entry.resetTime - now) / 1000);
    return { 
      allowed: false, 
      remaining: 0, 
      resetTime: remainingTime,
      message: `Too many attempts. Try again in ${remainingTime} seconds.`
    };
  }

  entry.count++;
  return { allowed: true, remaining: maxAttempts - entry.count };
};

/**
 * Input sanitization helper
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .slice(0, 1000); // Limit length
};

/**
 * Enhanced error logging with security context
 */
export const logSecurityEvent = (event: string, details: any = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...details
  };
  
  console.warn('Security Event:', logEntry);
  
  // In a production environment, you would send this to a secure logging service
  // Example: Send to Supabase edge function for secure logging
};
