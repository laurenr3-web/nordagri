
import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current device is a mobile device
 * @returns {boolean} - true if the device is mobile
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check if the device is mobile
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileRegex = /(android|iphone|ipad|ipod|blackberry|windows phone)/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    // Check on mount
    checkIsMobile();

    // Check on window resize
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
}
