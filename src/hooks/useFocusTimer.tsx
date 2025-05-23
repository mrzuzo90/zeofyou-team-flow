
import { useState, useEffect, useCallback } from 'react';

export const useFocusTimer = (initialDuration: number = 25) => {
  const [duration, setDuration] = useState(initialDuration);
  const [timeLeft, setTimeLeft] = useState(initialDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeLeft]);

  const startTimer = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stopTimer = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(duration * 60);
  }, [duration]);

  const resetTimer = useCallback((newDuration?: number) => {
    const targetDuration = newDuration || duration;
    setDuration(targetDuration);
    setTimeLeft(targetDuration * 60);
    setIsActive(false);
    setIsPaused(false);
  }, [duration]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    timeLeft,
    isActive,
    isPaused,
    duration,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    formatTime,
    progress: ((duration * 60 - timeLeft) / (duration * 60)) * 100
  };
};
