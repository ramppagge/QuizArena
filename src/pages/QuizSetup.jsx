import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchCategories, getQuestionCount, DIFFICULTY_LEVELS } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useQuiz } from '../context/QuizContext';
import AbandonQuizModal, { ABANDON_PENALTY_XP } from '../components/AbandonQuizModal';

const QuizSetup = () => {
  const navigate = useNavigate();
  const { user, isGuest, logout, calculateLevel, getLevelProgress, subtractXP } = useAuth();
  const { resetQuiz, hasActiveQuiz, getActiveQuizInfo, abandonQuiz, forceStartNewQuiz } = useQuiz();
  
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('any');
  const [selectedDifficulty, setSelectedDifficulty] = useState('any');
  const [questionCount, setQuestionCount] = useState(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [error, setError] = useState(null);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'start' or 'quickStart'

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (err) {
        setError('Failed to load categories. Please try again.');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Check question availability when selection changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (selectedCategory === 'any' && selectedDifficulty === 'any') {
        setQuestionCount(null);
        return;
      }
      
      setIsCheckingAvailability(true);
      try {
        const count = await getQuestionCount(selectedCategory, selectedDifficulty);
        setQuestionCount(count);
      } catch (err) {
        setQuestionCount(null);
      } finally {
        setIsCheckingAvailability(false);
      }
    };
    
    checkAvailability();
  }, [selectedCategory, selectedDifficulty]);

  const handleStartQuiz = () => {
    // Store preferences in sessionStorage for the quiz
    sessionStorage.setItem('quizPreferences', JSON.stringify({
      category: selectedCategory,
      difficulty: selectedDifficulty,
      categoryName: categories.find(c => c.id.toString() === selectedCategory.toString())?.name || 'Any Category',
      difficultyName: DIFFICULTY_LEVELS.find(d => d.id === selectedDifficulty)?.name || 'Any Difficulty',
    }));
    
    // Check if there's an active quiz in progress
    if (hasActiveQuiz()) {
      setPendingAction('start');
      setShowAbandonModal(true);
    } else {
      navigate('/quiz');
    }
  };

  const handleQuickStart = () => {
    setSelectedCategory('any');
    setSelectedDifficulty('any');
    sessionStorage.setItem('quizPreferences', JSON.stringify({
      category: 'any',
      difficulty: 'any',
      categoryName: 'Any Category',
      difficultyName: 'Any Difficulty',
    }));
    
    // Check if there's an active quiz in progress
    if (hasActiveQuiz()) {
      setPendingAction('quickStart');
      setShowAbandonModal(true);
    } else {
      navigate('/quiz');
    }
  };

  const handleAbandonAndStart = () => {
    // Apply XP penalty for non-guest users
    if (!isGuest) {
      subtractXP(ABANDON_PENALTY_XP);
    }
    
    // Clear quiz state
    abandonQuiz();
    
    // Close modal
    setShowAbandonModal(false);
    
    // Navigate to quiz
    navigate('/quiz');
  };

  const handleContinueExistingQuiz = () => {
    setShowAbandonModal(false);
    navigate('/quiz');
  };

  const activeQuizInfo = getActiveQuizInfo();

  const handleBack = () => {
    resetQuiz();
    logout();
    navigate('/');
  };

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'General Knowledge': '🧠',
      'Entertainment: Books': '📚',
      'Entertainment: Film': '🎬',
      'Entertainment: Music': '🎵',
      'Entertainment: Musicals & Theatres': '🎭',
      'Entertainment: Television': '📺',
      'Entertainment: Video Games': '🎮',
      'Entertainment: Board Games': '🎲',
      'Science & Nature': '🔬',
      'Science: Computers': '💻',
      'Science: Mathematics': '🔢',
      'Mythology': '⚡',
      'Sports': '⚽',
      'Geography': '🌍',
      'History': '📜',
      'Politics': '🏛️',
      'Art': '🎨',
      'Celebrities': '⭐',
      'Animals': '🐾',
      'Vehicles': '🚗',
      'Entertainment: Comics': '💥',
      'Science: Gadgets': '📱',
      'Entertainment: Japanese Anime & Manga': '🎌',
      'Entertainment: Cartoon & Animations': '🎞️',
      'Any Category': '🎯',
    };
    return icons[categoryName] || '❓';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'any': 'from-gray-100 to-gray-200 text-gray-700 border-gray-300',
      'easy': 'from-emerald-100 to-emerald-200 text-emerald-700 border-emerald-300',
      'medium': 'from-amber-100 to-amber-200 text-amber-700 border-amber-300',
      'hard': 'from-red-100 to-red-200 text-red-700 border-red-300',
    };
    return colors[difficulty] || colors.any;
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      'any': '🎲',
      'easy': '😊',
      'medium': '🤔',
      'hard': '🔥',
    };
    return icons[difficulty] || '❓';
  };

  // Get level color for user badge
  const getLevelColor = (lvl) => {
    if (lvl >= 9) return 'from-amber-400 to-yellow-500';
    if (lvl >= 7) return 'from-purple-400 to-pink-500';
    if (lvl >= 5) return 'from-teal-400 to-emerald-500';
    if (lvl >= 3) return 'from-cyan-400 to-blue-500';
    return 'from-gray-400 to-gray-500';
  };

  if (isLoadingCategories) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 border-4 border-teal-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-xl text-gray-700 font-semibold">Loading categories...</p>
        </div>
      </div>
    );
  }

  const userLevel = !isGuest && user ? calculateLevel(user.xp || 0) : 1;
  const levelProgress = !isGuest && user ? getLevelProgress(user.xp || 0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-amber-50 py-6 px-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header with User Info */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-card p-6 mb-6 border border-white/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Customize Your Quiz</h1>
                <p className="text-gray-500">Hey {user?.username || 'Player'}, pick your challenge!</p>
              </div>
            </div>
            
            {/* User Badge */}
            <Link 
              to="/profile"
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-gray-800 text-sm">{user?.username}</p>
                {!isGuest && (
                  <p className="text-xs text-gray-500">Level {userLevel}</p>
                )}
                {isGuest && (
                  <p className="text-xs text-amber-600">Guest</p>
                )}
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${isGuest ? 'from-gray-400 to-gray-500' : getLevelColor(userLevel)} flex items-center justify-center shadow-md`}>
                <span className="text-white font-bold">
                  {user?.username?.charAt(0).toUpperCase() || 'G'}
                </span>
              </div>
            </Link>
          </div>

          {/* XP Progress Bar for logged-in users */}
          {!isGuest && user && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-500">Level {userLevel}</span>
                <span className="text-xs font-medium text-teal-600">{user.xp || 0} XP</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getLevelColor(userLevel)} rounded-full transition-all duration-500`}
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Guest prompt */}
          {isGuest && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-amber-600">
                Playing as guest. <Link to="/register" className="font-semibold underline hover:text-amber-700">Create an account</Link> to save your progress!
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Difficulty Selection */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-card p-6 mb-6 border border-white/50">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">💪</span> Select Difficulty
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {DIFFICULTY_LEVELS.map((diff) => (
              <button
                key={diff.id}
                onClick={() => setSelectedDifficulty(diff.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedDifficulty === diff.id
                    ? `bg-gradient-to-br ${getDifficultyColor(diff.id)} border-2 scale-[1.02] shadow-lg`
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getDifficultyIcon(diff.id)}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{diff.name}</p>
                    <p className="text-xs text-gray-500">{diff.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-card p-6 mb-6 border border-white/50">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📂</span> Select Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-400 shadow-lg'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getCategoryIcon(cat.name)}</span>
                  <p className={`font-medium text-sm ${selectedCategory === cat.id ? 'text-teal-700' : 'text-gray-700'}`}>
                    {cat.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selection Summary & Availability */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-card p-6 mb-6 border border-white/50">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span> Your Selection
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">Category</span>
              <span className="font-semibold text-gray-800 flex items-center gap-2">
                {getCategoryIcon(categories.find(c => c.id.toString() === selectedCategory.toString())?.name || '')}
                {categories.find(c => c.id.toString() === selectedCategory.toString())?.name || 'Any'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">Difficulty</span>
              <span className="font-semibold text-gray-800 flex items-center gap-2">
                {getDifficultyIcon(selectedDifficulty)}
                {DIFFICULTY_LEVELS.find(d => d.id === selectedDifficulty)?.name || 'Any'}
              </span>
            </div>
            
            {/* Availability indicator */}
            {(selectedCategory !== 'any' || selectedDifficulty !== 'any') && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Available Questions</span>
                {isCheckingAvailability ? (
                  <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className={`font-semibold ${questionCount && questionCount >= 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {questionCount !== null ? (
                      questionCount >= 10 ? `${questionCount}+ questions` : `${questionCount} questions`
                    ) : 'Checking...'}
                  </span>
                )}
              </div>
            )}
          </div>

          {questionCount !== null && questionCount < 10 && questionCount > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-amber-700 text-sm">
                ⚠️ Limited questions available. The quiz will have fewer than 10 questions.
              </p>
            </div>
          )}

          {questionCount === 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">
                ❌ No questions available for this combination. Please select a different category or difficulty.
              </p>
            </div>
          )}
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartQuiz}
          disabled={questionCount === 0}
          className={`w-full font-bold py-4 px-6 rounded-xl transform transition-all duration-200 shadow-lg ${
            questionCount === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 hover:scale-[1.02] active:scale-[0.98] shadow-teal-500/30'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Quiz
          </span>
        </button>

        {/* Quick Start Option */}
        <div className="mt-4 text-center">
          <button
            onClick={handleQuickStart}
            className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Or start with random questions →
          </button>
        </div>

        {/* Continue Existing Quiz Banner */}
        {activeQuizInfo && (
          <div className="mt-6 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-teal-800">Quiz in Progress</p>
                  <p className="text-sm text-teal-600">
                    {activeQuizInfo.questionsAnswered}/{activeQuizInfo.totalQuestions} answered • {activeQuizInfo.preferences?.categoryName || 'Mixed'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleContinueExistingQuiz}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-colors shadow-md shadow-teal-500/30"
              >
                Continue Quiz
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Abandon Quiz Modal - Custom version with option to continue */}
      {showAbandonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAbandonModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Quiz in Progress
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-center mb-2">
              You have an unfinished quiz. Starting a new one will abandon your current progress.
            </p>

            {/* Current Quiz Info */}
            {activeQuizInfo && (
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Progress:</span>
                  <span className="font-semibold text-gray-700">
                    {activeQuizInfo.questionsAnswered}/{activeQuizInfo.totalQuestions} answered
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Current Score:</span>
                  <span className="font-semibold text-gray-700">{activeQuizInfo.score} correct</span>
                </div>
              </div>
            )}

            {/* Penalty Warning */}
            {!isGuest && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="font-semibold text-red-600">-{ABANDON_PENALTY_XP} XP Penalty</span>
                </div>
                <p className="text-red-500 text-sm text-center mt-1">
                  Abandoning will cost you experience points
                </p>
              </div>
            )}

            {isGuest && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-amber-700 text-sm text-center">
                  As a guest, your progress is not saved. You can start fresh without penalty.
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleContinueExistingQuiz}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/30"
              >
                Continue Current Quiz
              </button>
              <button
                onClick={handleAbandonAndStart}
                className="w-full py-3 px-4 rounded-xl font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
              >
                Abandon & Start New Quiz
              </button>
              <button
                onClick={() => setShowAbandonModal(false)}
                className="w-full py-2 px-4 rounded-xl font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizSetup;
