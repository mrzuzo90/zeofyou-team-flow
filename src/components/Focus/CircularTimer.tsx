
import React from 'react';

interface CircularTimerProps {
  timeLeft: number;
  duration: number;
  progress: number;
  formatTime: (seconds: number) => string;
}

const CircularTimer: React.FC<CircularTimerProps> = ({ 
  timeLeft, 
  duration, 
  progress, 
  formatTime 
}) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-48 h-48 mx-auto mb-8">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="rgb(55 65 81)" // gray-700
          strokeWidth="8"
          fill="transparent"
        />
        
        {/* Progress circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="rgb(59 130 246)" // blue-500
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-in-out"
        />
      </svg>
      
      {/* Time display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold text-white mb-2">
          {formatTime(timeLeft)}
        </div>
        <div className="text-gray-400 text-sm">
          {Math.floor(progress)}% completado
        </div>
      </div>
    </div>
  );
};

export default CircularTimer;
