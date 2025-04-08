
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CounterAnimationProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CounterAnimation({ 
  value, 
  duration = 1500,
  decimals = 0,
  prefix = '',
  suffix = '',
  className 
}: CounterAnimationProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const startValue = useRef<number>(0);
  const frameId = useRef<number | null>(null);
  const mountedRef = useRef<boolean>(false);
  
  const formatValue = (val: number) => {
    return Number(val.toFixed(decimals)).toLocaleString();
  };
  
  useEffect(() => {
    // Store the current value as the starting point when the value prop changes
    startValue.current = mountedRef.current ? displayValue : 0;
    mountedRef.current = true;
    
    const animate = (timestamp: number) => {
      if (startTime.current === null) {
        startTime.current = timestamp;
      }
      
      const elapsedTime = Math.min(timestamp - startTime.current, duration);
      const progress = elapsedTime / duration;
      const easedProgress = easeOutCubic(progress);
      const nextValue = startValue.current + (value - startValue.current) * easedProgress;
      
      setDisplayValue(nextValue);
      
      if (elapsedTime < duration) {
        frameId.current = requestAnimationFrame(animate);
      }
    };
    
    // Start the animation
    frameId.current = requestAnimationFrame(animate);
    
    // Clean up
    return () => {
      if (frameId.current !== null) {
        cancelAnimationFrame(frameId.current);
      }
    };
  }, [value, duration]);
  
  // Easing function for smoother animation
  const easeOutCubic = (x: number): number => {
    return 1 - Math.pow(1 - x, 3);
  };
  
  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}{formatValue(displayValue)}{suffix}
    </span>
  );
}

interface CounterPercentageProps {
  value: number;
  duration?: number;
  className?: string;
}

export function CounterPercentage({ value, duration = 1500, className }: CounterPercentageProps) {
  return (
    <CounterAnimation 
      value={value} 
      duration={duration} 
      suffix="%" 
      className={className} 
    />
  );
}

interface CounterCurrencyProps {
  value: number;
  currency?: string;
  duration?: number;
  className?: string;
}

export function CounterCurrency({ value, currency = "€", duration = 1500, className }: CounterCurrencyProps) {
  return (
    <CounterAnimation 
      value={value} 
      duration={duration} 
      prefix={`${currency} `} 
      decimals={2} 
      className={className} 
    />
  );
}
