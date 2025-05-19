
import { useState, useEffect } from 'react';

/**
 * Custom hook to monitor network connectivity status
 * @returns {boolean} - True if the device is online, false otherwise
 */
export function useNetworkState(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    // Handler to update state when network status changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Register event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
