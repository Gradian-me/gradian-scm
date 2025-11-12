import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { cn } from '@/lib/utils';

export type CircularTimerProps = {
  duration: number;
  isPlaying?: boolean;
  size?: number;
  strokeWidth?: number;
  className?: string;
  onComplete?: () => void;
  onUpdate?: (remaining: number) => void;
  colors?: `#${string}`[];
  colorsTime?: number[];
};

const DEFAULT_COLORS: `#${string}`[] = ['#7C3AED', '#F97316', '#FACC15', '#EF4444'];

export function CircularTimer({
  duration,
  isPlaying = false,
  size = 54,
  strokeWidth = 5,
  className,
  onComplete,
  onUpdate,
  colors = DEFAULT_COLORS,
  colorsTime,
}: CircularTimerProps) {
  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <CountdownCircleTimer
        isPlaying={isPlaying}
        duration={duration}
        size={size}
        strokeWidth={strokeWidth}
        colors={colors}
        colorsTime={colorsTime}
        onUpdate={onUpdate}
        onComplete={() => {
          onComplete?.();
          return { shouldRepeat: false };
        }}
      >
        {({ remainingTime }) => (
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
            {remainingTime}s
          </span>
        )}
      </CountdownCircleTimer>
    </div>
  );
}
