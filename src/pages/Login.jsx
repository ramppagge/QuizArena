import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadQuizState, clearQuizData } from '../utils/storage';

const TOTAL_TIME = 300; // 5 minutes in seconds

const Login = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'guest'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedProgress, setSavedProgress] = useState(null);
  const navigate = useNavigate();
  const { login, continueAsGuest, isAuthenticated, user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/setup');
    }
  }, [isAuthenticated, user, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const checkForSavedProgress = () => {
    const savedState = loadQuizState();
    if (savedState && savedState.questions && savedState.questions.length > 0 && savedState.startTime) {
      const elapsedSeconds = Math.floor((Date.now() - savedState.startTime) / 1000);
      const timeRemaining = Math.max(0, TOTAL_TIME - elapsedSeconds);
      
      if (timeRemaining > 0) {
        setSavedProgress({
          currentQuestion: savedState.currentIndex + 1,
          totalQuestions: savedState.questions.length,
          timeRemaining,
          score: savedState.score,
          quizPreferences: savedState.quizPreferences,
        });
        setShowResumeModal(true);
        return true;
      } else {
        clearQuizData();
      }
    }
    return false;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = login(username.trim(), password);
    
    setIsLoading(false);

    if (result.success) {
      if (!checkForSavedProgress()) {
        navigate('/setup');
      }
    } else {
      setError(result.error);
    }
  };

  const handleGuestContinue = (e) => {
    e.preventDefault();
    setError('');

    if (!guestName.trim()) {
      setError('Please enter a display name');
      return;
    }

    if (guestName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    const result = continueAsGuest(guestName.trim());
    
    if (result.success) {
      if (!checkForSavedProgress()) {
        navigate('/setup');
      }
    }
  };

  const handleResume = () => {
    setShowResumeModal(false);
    navigate('/quiz');
  };

  const handleStartFresh = () => {
    clearQuizData();
    setShowResumeModal(false);
    navigate('/setup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-game p-8 border border-white/50">
          {/* Logo & Title */}
          <div className="text-center mb-6">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-teal-500 to-teal-600 p-5 rounded-2xl shadow-lg">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-display font-bold gradient-text mb-2">
              QuizArena
            </h1>
            <p className="text-gray-500 font-medium">Challenge yourself. Level up your knowledge.</p>
          </div>

          {/* Stats Preview */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-3 text-center card-hover">
              <div className="text-2xl font-bold text-teal-600">10</div>
              <div className="text-xs font-medium text-teal-700">Questions</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 text-center card-hover">
              <div className="text-2xl font-bold text-amber-600">5:00</div>
              <div className="text-xs font-medium text-amber-700">Minutes</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 text-center card-hover">
              <div className="text-2xl font-bold text-emerald-600">100</div>
              <div className="text-xs font-medium text-emerald-700">XP Points</div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => {
                setActiveTab('login');
                setError('');
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-white text-teal-600 shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('guest');
                setError('');
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                activeTab === 'guest'
                  ? 'bg-white text-teal-600 shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Play as Guest
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your username"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all duration-200 font-medium text-gray-800 placeholder:text-gray-400"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all duration-200 font-medium text-gray-800 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-xl animate-shake">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold py-4 px-6 rounded-xl hover:from-teal-600 hover:to-teal-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-teal-500/30 btn-press disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </span>
                )}
              </button>

              {/* Register Link */}
              <div className="text-center pt-2">
                <p className="text-gray-500">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                    Create one
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* Guest Form */}
          {activeTab === 'guest' && (
            <form onSubmit={handleGuestContinue} className="space-y-4">
              {/* Guest Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-1">Guest Mode</h4>
                    <p className="text-sm text-amber-700">Your progress (XP, Level, Achievements) will not be saved. Create an account to track your progress!</p>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="guestName"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="guestName"
                    value={guestName}
                    onChange={(e) => {
                      setGuestName(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your name"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all duration-200 font-medium text-gray-800 placeholder:text-gray-400"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-xl animate-shake">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-4 px-6 rounded-xl hover:from-gray-700 hover:to-gray-800 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-gray-500/30 btn-press"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Play as Guest
                </span>
              </button>

              {/* Register suggestion */}
              <div className="text-center pt-2">
                <p className="text-gray-500">
                  Want to save your progress?{' '}
                  <Link to="/register" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                    Create an account
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* Features */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-600">Progress auto-saves — pick up where you left off</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-600">Beat the clock to maximize your score</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <span className="text-gray-600">Earn XP points and track your achievements</span>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 font-medium">
            "The expert in anything was once a beginner"
          </p>
        </div>
      </div>

      {/* Resume Quiz Modal */}
      {showResumeModal && savedProgress && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-slide-up">
            {/* Icon */}
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl mb-4">
                <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back!</h2>
              <p className="text-gray-500">You have an unfinished quiz</p>
            </div>

            {/* Progress Info */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-teal-600">
                    {savedProgress.currentQuestion}/{savedProgress.totalQuestions}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Question</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">
                    {formatTime(savedProgress.timeRemaining)}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Time Left</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {savedProgress.score}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Score</div>
                </div>
              </div>
              {savedProgress.quizPreferences && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{savedProgress.quizPreferences.categoryName}</span>
                    {' • '}
                    <span className="font-medium">{savedProgress.quizPreferences.difficultyName}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleResume}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold py-4 px-6 rounded-xl hover:from-teal-600 hover:to-teal-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-teal-500/30"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  Resume Quiz
                </span>
              </button>
              <button
                onClick={handleStartFresh}
                className="w-full bg-gray-100 text-gray-700 font-bold py-4 px-6 rounded-xl hover:bg-gray-200 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Start Fresh
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
