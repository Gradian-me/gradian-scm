// Countdown Component with Odometer

'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { formatDate } from '../../../shared/utils';
import Odometer from '@w3ux/react-odometer';
import '@w3ux/react-odometer/index.css';

export interface CountdownProps {
  startDate?: Date | string;
  expireDate: Date | string;
  includeTime?: boolean;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Countdown: React.FC<CountdownProps> = ({
  startDate,
  expireDate,
  includeTime = true,
  className = '',
  showIcon = true,
  size = 'md'
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const expiry = new Date(expireDate);
      const difference = expiry.getTime() - now.getTime();

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setIsExpired(false);
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expireDate]);

  if (!mounted) {
    return null;
  }

  if (isExpired) {
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        {showIcon && <AlertCircle className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`} />}
        <span className={`font-medium ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
          Expired on: {formatDate(new Date(expireDate), { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            ...(includeTime && { hour: '2-digit', minute: '2-digit' })
          })}
        </span>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <Clock className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} text-blue-600`} />}
      <div className="flex items-center gap-1">
        {timeLeft.days > 0 && (
          <>
            <div className="inline-block">
              <Odometer value={timeLeft.days} />
            </div>
            <span className={`text-gray-500 ${sizeClasses[size]}`}>d</span>
          </>
        )}
        {(timeLeft.days > 0 || timeLeft.hours > 0) && (
          <>
            <div className="inline-block">
              <Odometer value={timeLeft.hours} />
            </div>
            <span className={`text-gray-500 ${sizeClasses[size]}`}>h</span>
          </>
        )}
        {(timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0) && (
          <>
            <div className="inline-block">
              <Odometer value={timeLeft.minutes} />
            </div>
            <span className={`text-gray-500 ${sizeClasses[size]}`}>m</span>
          </>
        )}
        {includeTime && (
          <>
            <div className="inline-block">
              <Odometer value={timeLeft.seconds} />
            </div>
            <span className={`text-gray-500 ${sizeClasses[size]}`}>s</span>
          </>
        )}
      </div>
    </div>
  );
};

Countdown.displayName = 'Countdown';

