import React, { useState, useEffect } from 'react';
import moment from 'moment';

interface CountdownTimerProps {
  targetTime: string; // Target time in string format (e.g., '2023-12-31T23:59:59')
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetTime }) => {
  const calculateTimeRemaining = () => {
    const currentTime = moment();
    const targetDateTime = moment(targetTime);

    if (currentTime.isAfter(targetDateTime)) {
      return moment.duration(0);
    }

    return moment.duration(targetDateTime.diff(currentTime));
  };

  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining);

  useEffect(() => {
    const timerId = setInterval(() => {
      const remainingTime = calculateTimeRemaining();
      if (remainingTime.asMilliseconds() <= 0) {
        clearInterval(timerId);
      } else {
        setTimeRemaining(moment.duration(remainingTime));
      }
    }, 1000); // Update every 1 second

    return () => {
      clearInterval(timerId);
    };
  }, [targetTime]);

  const days = timeRemaining.days();
  const hours = timeRemaining.hours();
  const minutes = timeRemaining.minutes();
  const seconds = timeRemaining.seconds();

  return (
    <div>
      {seconds <= 0
        ? 'Listing Ended'
        : days > 2
        ? `Days Left: ${Math.floor(timeRemaining.asDays())}`
        : `Time Left: ${hours}h ${minutes}m ${seconds}s`}
    </div>
  );
};

export default CountdownTimer;
