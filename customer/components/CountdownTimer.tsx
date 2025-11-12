import React, { useState, useEffect, useCallback } from 'react';

interface CountdownTimerProps {
  expiry: string;
}

interface TimeLeft {
    days?: number;
    hours?: number;
    minutes?: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiry }) => {
  const calculateTimeLeft = useCallback((): TimeLeft => {
    const difference = +new Date(expiry) - +new Date();
    let timeLeft: TimeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
      };
    }
    return timeLeft;
  }, [expiry]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    // Set an interval to update the countdown every minute
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000 * 60);

    // Clear the interval when the component unmounts
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  // FIX: Changed JSX.Element to React.ReactElement to resolve namespace error.
  const timerComponents: React.ReactElement[] = [];
  
  if (timeLeft.days && timeLeft.days > 0) {
    timerComponents.push(
      <div key="days" className="text-center">
        <span className="font-bold text-lg text-red-600">{timeLeft.days}</span>
        <span className="text-xs text-gray-500 uppercase"> days</span>
      </div>
    );
  }

  if (typeof timeLeft.hours === 'number') {
     timerComponents.push(
      <div key="hours" className="text-center">
        <span className="font-bold text-lg text-red-600">{timeLeft.hours}</span>
        <span className="text-xs text-gray-500 uppercase"> hours</span>
      </div>
    );
  }

  if (typeof timeLeft.minutes === 'number') {
     timerComponents.push(
      <div key="minutes" className="text-center">
        <span className="font-bold text-lg text-red-600">{timeLeft.minutes}</span>
        <span className="text-xs text-gray-500 uppercase"> minutes</span>
      </div>
    );
  }

  return (
    <div className="flex space-x-2 items-center">
      {timerComponents.length ? timerComponents : <span className="text-red-500 font-semibold">Offer Expired!</span>}
    </div>
  );
};

export default CountdownTimer;