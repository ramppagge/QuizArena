import { useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';
import { useNavigate } from 'react-router-dom';

const Timer = () => {
  const { timeRemaining, setTimeRemaining } = useQuiz();
  const navigate = useNavigate();

  useEffect(() => {
    if (timeRemaining <= 0) {
      navigate('/results');
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, setTimeRemaining, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerState = () => {
    if (timeRemaining <= 60) return {
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      pulse: true
    };
    if (timeRemaining <= 120) return {
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-500',
      pulse: false
    };
    return {
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      icon: 'text-teal-500',
      pulse: false
    };
  };

  const timerState = getTimerState();
  const totalTime = 300; // 5 minutes
  const progress = (timeRemaining / totalTime) * 100;

  return (
    <div className={`relative flex items-center gap-2 px-4 py-2 rounded-xl border ${timerState.bg} ${timerState.border} ${timerState.pulse ? 'timer-warning' : ''}`}>
      {/* Circular Progress Indicator */}
      <div className="relative w-8 h-8">
        <svg className="w-8 h-8 circular-progress" viewBox="0 0 36 36">
          {/* Background Circle */}
          <path
            className="text-gray-200"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          {/* Progress Circle */}
          <path
            className={timerState.icon}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${progress}, 100`}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        {/* Clock Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className={`w-4 h-4 ${timerState.icon} ${timerState.pulse ? 'animate-pulse' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      {/* Time Display */}
      <div className={`text-lg font-bold ${timerState.color} tabular-nums`}>
        {formatTime(timeRemaining)}
      </div>

      {/* Warning Indicator */}
      {timeRemaining <= 60 && (
        <div className="absolute -top-1 -right-1">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      )}
    </div>
  );
};

export default Timer;
