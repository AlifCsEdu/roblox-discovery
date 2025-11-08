'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  className?: string;
}

export function Slider({ min, max, step = 1, value, onValueChange, className }: SliderProps) {
  const [isDragging, setIsDragging] = React.useState<'min' | 'max' | null>(null);
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

  const handleMouseDown = (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(thumb);
  };

  const updateValue = React.useCallback(
    (clientX: number) => {
      if (!sliderRef.current || !isDragging) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = min + percentage * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));

      if (isDragging === 'min') {
        onValueChange([Math.min(clampedValue, value[1]), value[1]]);
      } else {
        onValueChange([value[0], Math.max(clampedValue, value[0])]);
      }
    },
    [isDragging, min, max, step, value, onValueChange]
  );

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, updateValue]);

  const minPercentage = getPercentage(value[0]);
  const maxPercentage = getPercentage(value[1]);

  return (
    <div className={cn('relative w-full', className)}>
      <div ref={sliderRef} className="relative h-2 bg-secondary rounded-full cursor-pointer">
        {/* Active range */}
        <div
          className="absolute h-full bg-primary rounded-full"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`,
          }}
        />

        {/* Min thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-primary border-2 border-background rounded-full cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10"
          style={{ left: `${minPercentage}%` }}
          onMouseDown={handleMouseDown('min')}
        />

        {/* Max thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-primary border-2 border-background rounded-full cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10"
          style={{ left: `${maxPercentage}%` }}
          onMouseDown={handleMouseDown('max')}
        />
      </div>

      {/* Value labels */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>{value[0]}%</span>
        <span>{value[1]}%</span>
      </div>
    </div>
  );
}
