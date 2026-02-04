import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import Timer from '../components/Timer';
import Question from '../components/Question';
import ProgressBar from '../components/ProgressBar';
import { getCurrentUser } from '../utils/storage';

const Quiz = () => {
  const {
    questions,
    currentIndex,
    answers,
    startQuiz,
    isLoading,
    error,
    quizStarted,
    hasAttemptedRestore,
    quizPreferences,
  } = useQuiz();
  const navigate = useNavigate();
  const username = getCurrentUser();
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showQuitModal, setShowQuitModal] = useState(false);

  // Handle quit quiz - just saves progress and goes back
  const handleQuitQuiz = () => {
    // Progress is already auto-saved, just navigate back
    navigate('/setup');
  };

  // Calculate current streak
  useEffect(() => {
    let currentStreak = 0;
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (answers[i] === questions[i]?.correctAnswer) {
        currentStreak++;
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  }, [currentIndex, answers, questions]);

  useEffect(() => {
    // Wait for restore attempt before starting a new quiz
    if (hasAttemptedRestore && !quizStarted && questions.length === 0) {
      startQuiz();
    }
  }, [hasAttemptedRestore, quizStarted, questions.length, startQuiz]);

  useEffect(() => {
    if (
      questions.length > 0 &&
      currentIndex >= questions.length - 1 &&
      answers[questions.length - 1] !== null
    ) {
      const timer = setTimeout(() => {
        navigate('/results');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, answers, questions.length, navigate]);

  // Show encouragement when streak >= 3
  useEffect(() => {
    if (streak >= 3) {
      setShowEncouragement(true);
      const timer = setTimeout(() => setShowEncouragement(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [streak]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 border-4 border-teal-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className="text-xl text-gray-700 font-semibold mb-2">Loading your challenge...</p>
          <p className="text-gray-500">Get ready to show what you know!</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-game p-8 max-w-md w-full text-center">
          <div className="inline-block p-4 bg-red-100 rounded-2xl mb-4">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={startQuiz}
            className="bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold py-3 px-8 rounded-xl hover:from-teal-600 hover:to-teal-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-teal-500/30"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate correct answers so far
  const correctSoFar = answers.filter((answer, idx) => 
    answer === questions[idx]?.correctAnswer
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-amber-50 py-6 px-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      {/* Streak Celebration */}
      {showEncouragement && streak >= 3 && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg shadow-orange-500/30 flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="font-bold">{streak} Streak!</span>
            <span className="text-2xl">🔥</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-card p-4 mb-6 border border-white/50">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* User Avatar */}
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-500/30">
                {username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Hey, {username}!</h1>
                <p className="text-sm text-gray-500">
                  {quizPreferences?.categoryName || 'Quiz'} • {quizPreferences?.difficultyName || 'Mixed'}
                </p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-3">
              {/* Streak Counter */}
              {streak > 0 && (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-2 rounded-xl">
                  <span className={`text-xl ${streak >= 3 ? 'fire-effect' : ''}`}>🔥</span>
                  <span className="font-bold text-amber-700">{streak}</span>
                </div>
              )}

              {/* Correct Counter */}
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-2 rounded-xl">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold text-emerald-700">{correctSoFar}/{currentIndex}</span>
              </div>

              {/* Timer */}
              <Timer />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <ProgressBar />
        </div>

        {/* Question Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-game p-6 md:p-8 border border-white/50">
          <Question />
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => setShowQuitModal(true)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Quit Quiz
          </button>
          
          <div className="text-sm text-gray-400">
            Progress auto-saved
          </div>
        </div>
      </div>

      {/* Quit Quiz Confirmation Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowQuitModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Quit Quiz?
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-center mb-6">
              Your progress will be saved. You can continue this quiz later from where you left off.
            </p>

            {/* Progress Info */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-teal-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Progress will be saved automatically</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowQuitModal(false)}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Keep Playing
              </button>
              <button
                onClick={handleQuitQuiz}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/30"
              >
                Quit & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
