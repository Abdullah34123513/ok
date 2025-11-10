import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  expiryDate: string;
}

const calculateTimeLeft = (isoDate: string) => {
    const difference = +new Date(isoDate) - +new Date();
    let timeLeft: { days?: number, hours?: number, minutes?: number, seconds?: number } = {};

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

const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiryDate }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(expiryDate));

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft(expiryDate));
        }, 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents: string[] = [];
    if (timeLeft.days && timeLeft.days > 0) timerComponents.push(`${timeLeft.days}d`);
    if (timeLeft.hours && timeLeft.hours > 0) timerComponents.push(`${timeLeft.hours}h`);
    if (timeLeft.minutes && timeLeft.minutes > 0) timerComponents.push(`${timeLeft.minutes}m`);
    if (timerComponents.length < 3 && timeLeft.seconds !== undefined) timerComponents.push(`${timeLeft.seconds}s`);


    if (!timerComponents.length) {
        return <span className="text-red-500 font-bold text-sm">Expired</span>;
    }

    return (
        <div className="text-sm font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full shadow">
            Ends in: {timerComponents.slice(0, 3).join(' ')}
        </div>
    );
};

export default CountdownTimer;