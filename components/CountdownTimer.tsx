import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  expiry: string; // ISO string
}

interface TimeLeft {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}

const calculateTimeLeft = (expiryDate: Date): TimeLeft => {
  const difference = +expiryDate - +new Date();
  let timeLeft: TimeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiry }) => {
  const expiryDate = new Date(expiry);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(expiryDate));

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(expiryDate));
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents: React.ReactElement[] = [];

  const timeEntries = Object.entries(timeLeft) as [keyof TimeLeft, number][];

  timeEntries.forEach(([interval, value]) => {
    // Show days only if > 0. For others, show if they are > 0 or if there are larger units present
    if (value > 0 || (interval !== 'days' && timeEntries.some(([k,v]) => v > 0 && ['days', 'hours', 'minutes'].indexOf(k as any) < ['days', 'hours', 'minutes'].indexOf(interval as any))) ) {
       timerComponents.push(
        <div key={interval} className="text-center">
            <span className="font-bold text-lg">{String(value).padStart(2, '0')}</span>
            <span className="text-xs uppercase block">{interval}</span>
        </div>
       );
    }
  });
  
  if (!timerComponents.length) {
      return <span className="text-red-500 font-bold">Expired</span>;
  }

  return (
    <div className="flex space-x-2 text-gray-700 items-center">
        {timerComponents.map((component, index) => (
            <React.Fragment key={index}>
                {component}
                {index < timerComponents.length - 1 && <span className="font-bold text-lg -mt-3">:</span>}
            </React.Fragment>
        ))}
    </div>
  );
};

export default CountdownTimer;
