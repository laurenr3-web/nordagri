
import React, { useState, useEffect, useRef } from 'react';

interface CounterAnimationProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimalPlaces?: number;
}

export const CounterAnimation: React.FC<CounterAnimationProps> = ({
  value,
  prefix = '',
  suffix = '',
  duration = 1000,
  decimalPlaces = 0
}) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    // Reset on value change
    countRef.current = 0;
    startTimeRef.current = null;
    
    // Start animation
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      
      const progress = timestamp - startTimeRef.current;
      const progressRatio = Math.min(progress / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progressRatio, 4); // Easing function
      
      countRef.current = easeOutQuart * value;
      setCount(countRef.current);
      
      if (progress < duration) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };
    
    frameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);

  const formattedCount = count.toFixed(decimalPlaces);
  // Format with thousands separators
  const formattedWithCommas = formattedCount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return (
    <span>
      {prefix}{formattedWithCommas}{suffix}
    </span>
  );
};
