import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { clearQuizData } from '../utils/storage';

const Results = () => {
  const { getResults, resetQuiz, questions, answers, quizPreferences } = useQuiz();
  const { user, isGuest, addXP, updateStats, checkAchievements, calculateLevel } = useAuth();
  const navigate = useNavigate();
  const [xpResult, setXPResult] = useState(null);
  const [newAchievements, setNewAchievements] = useState([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const hasProcessedRef = useRef(false);

  // Redirect if no questions (must be in useEffect)
  useEffect(() => {
    if (!questions || questions.length === 0) {
      setShouldRedirect(true);
    }
  }, [questions]);

  useEffect(() => {
    if (shouldRedirect) {
      navigate('/');
    }
  }, [shouldRedirect, navigate]);

  // Clear saved quiz progress when results are shown (quiz is complete)
  useEffect(() => {
    if (questions && questions.length > 0) {
      clearQuizData();
    }
  }, [questions]);

  // Process XP and achievements for logged-in users
  useEffect(() => {
    if (hasProcessedRef.current || !questions || questions.length === 0) return;
    hasProcessedRef.current = true;

    if (!isGuest && user) {
      const results = getResults();
      const percentage = Math.round((results.correctAnswers / results.totalQuestions) * 100);
      
      // Calculate XP
      const baseXP = results.correctAnswers * 10;
      const bonusXP = percentage >= 80 ? 20 : percentage >= 60 ? 10 : 0;
      const totalXP = baseXP + bonusXP;

      // Add XP
      const xpInfo = addXP(totalXP);
      setXPResult(xpInfo);
      
      if (xpInfo && xpInfo.leveledUp) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }

      // Update stats
      updateStats({
        correctAnswers: results.correctAnswers,
        totalQuestions: results.totalQuestions,
        category: quizPreferences?.categoryName || 'Any Category',
        difficulty: quizPreferences?.difficultyName || 'Any Difficulty',
        xpEarned: totalXP,
      });

      // Check for new achievements
      const achievements = checkAchievements({
        correctAnswers: results.correctAnswers,
        totalQuestions: results.totalQuestions,
      });
      setNewAchievements(achievements);
    }
  }, [questions, isGuest, user]);

  // Show nothing while redirecting
  if (!questions || questions.length === 0) {
    return null;
  }

  const results = getResults();
  const percentage = Math.round(
    (results.correctAnswers / results.totalQuestions) * 100
  );

  // Calculate XP earned (10 per correct answer + bonus for streaks)
  const baseXP = results.correctAnswers * 10;
  const bonusXP = percentage >= 80 ? 20 : percentage >= 60 ? 10 : 0;
  const totalXP = baseXP + bonusXP;

  const getRank = () => {
    if (percentage >= 90) return { 
      title: 'Quiz Champion', 
      icon: '👑', 
      color: 'from-amber-400 to-yellow-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      message: "Outstanding! You're a true knowledge master!"
    };
    if (percentage >= 80) return { 
      title: 'Quiz Expert', 
      icon: '🏆', 
      color: 'from-teal-400 to-emerald-500',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      message: "Excellent work! You really know your stuff!"
    };
    if (percentage >= 70) return { 
      title: 'Rising Star', 
      icon: '⭐', 
      color: 'from-cyan-400 to-teal-500',
      textColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      message: "Great job! Keep up the fantastic work!"
    };
    if (percentage >= 50) return { 
      title: 'Quick Learner', 
      icon: '📚', 
      color: 'from-rose-400 to-pink-500',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      message: "Good effort! You're on the right track!"
    };
    return { 
      title: 'Getting Started', 
      icon: '🌱', 
      color: 'from-emerald-400 to-green-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      message: "Every expert was once a beginner. Keep trying!"
    };
  };

  const rank = getRank();

  // Determine achievements earned in this quiz (for display purposes)
  const quizAchievements = [];
  if (percentage === 100) quizAchievements.push({ icon: '💯', title: 'Perfect Score', desc: 'Answered all questions correctly' });
  if (percentage >= 80) quizAchievements.push({ icon: '🎯', title: 'Sharp Shooter', desc: '80%+ accuracy' });
  if (results.correctAnswers >= 5) quizAchievements.push({ icon: '🔥', title: 'On Fire', desc: 'Got 5+ answers right' });
  if (results.totalAnswered === results.totalQuestions) quizAchievements.push({ icon: '✅', title: 'Completionist', desc: 'Answered every question' });

  const handleRestart = () => {
    resetQuiz();
    navigate('/');
  };

  const handlePlayAgain = () => {
    resetQuiz();
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-amber-50 py-8 px-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      {/* Level Up Notification */}
      {showLevelUp && xpResult && (
        <div className="fixed top-4 left-1/2 z-50 animate-slide-up-centered">
          <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
            <span className="text-4xl">🎉</span>
            <div>
              <div className="font-bold text-lg">Level Up!</div>
              <div className="text-amber-100">You reached Level {xpResult.newLevel}!</div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Celebration Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="relative inline-block mb-4">
            <div className={`absolute inset-0 bg-gradient-to-br ${rank.color} rounded-full blur-xl opacity-50 animate-pulse`}></div>
            <div className={`relative text-7xl trophy-bounce`}>
              {rank.icon}
            </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-800 mb-2">Quiz Complete!</h1>
          <p className="text-xl text-gray-600">Well done, {user?.username || 'Player'}!</p>
          {quizPreferences && (
            <p className="text-sm text-gray-500 mt-2">
              {quizPreferences.categoryName} • {quizPreferences.difficultyName}
            </p>
          )}
        </div>

        {/* Guest Warning */}
        {isGuest && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 animate-scale-in">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="font-semibold text-amber-800 mb-1">Playing as Guest</h4>
                <p className="text-sm text-amber-700">Your XP and achievements are not being saved. Create an account to track your progress!</p>
                <button 
                  onClick={() => navigate('/register')}
                  className="mt-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rank Card */}
        <div className={`${rank.bgColor} border-2 ${rank.borderColor} rounded-3xl p-6 mb-6 text-center animate-scale-in`}>
          <div className={`inline-block px-4 py-2 bg-gradient-to-r ${rank.color} rounded-full text-white font-bold text-lg mb-3 shadow-lg`}>
            {rank.title}
          </div>
          <p className={`${rank.textColor} font-medium`}>{rank.message}</p>
        </div>

        {/* Score Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-game p-8 mb-6 border border-white/50">
          {/* Main Score */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                />
                <circle
                  className={rank.textColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                  strokeDasharray={`${percentage * 2.64} 264`}
                  style={{ transition: 'stroke-dasharray 1s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-display font-bold text-gray-800">{percentage}%</span>
                <span className="text-sm text-gray-500">Score</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-4 text-center card-hover">
              <div className="text-3xl font-bold text-teal-600 mb-1">
                {results.totalQuestions}
              </div>
              <div className="text-xs font-medium text-teal-700">Total</div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-4 text-center card-hover">
              <div className="text-3xl font-bold text-emerald-600 mb-1">
                {results.correctAnswers}
              </div>
              <div className="text-xs font-medium text-emerald-700">Correct</div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 text-center card-hover">
              <div className="text-3xl font-bold text-red-500 mb-1">
                {results.wrongAnswers}
              </div>
              <div className="text-xs font-medium text-red-600">Wrong</div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-4 text-center card-hover">
              <div className="text-3xl font-bold text-amber-600 mb-1">
                +{totalXP}
              </div>
              <div className="text-xs font-medium text-amber-700">XP Earned</div>
            </div>
          </div>

          {/* XP Progress for logged-in users */}
          {!isGuest && user && xpResult && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 mb-6 border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-purple-700">Level {calculateLevel(user.xp || 0)} Progress</span>
                <span className="text-sm font-bold text-purple-600">{user.xp || 0} XP</span>
              </div>
              <div className="h-3 bg-purple-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, ((user.xp || 0) % 100))}%` }}
                />
              </div>
            </div>
          )}

          {/* New Achievements Unlocked */}
          {newAchievements.length > 0 && (
            <div className="border-t border-gray-100 pt-6 mb-6">
              <h3 className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="text-xl">🎊</span>
                New Achievements Unlocked!
              </h3>
              <div className="flex flex-wrap gap-3">
                {newAchievements.map((achievement, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 rounded-xl px-4 py-2 animate-scale-in shadow-lg"
                    style={{ animationDelay: `${idx * 0.2}s` }}
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <span className="font-bold text-gray-800">{achievement.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quiz Achievements */}
          {quizAchievements.length > 0 && (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Quiz Performance
              </h3>
              <div className="flex flex-wrap gap-3">
                {quizAchievements.map((achievement, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-4 py-2 achievement-unlock badge-shine"
                    style={{ animationDelay: `${idx * 0.2}s` }}
                  >
                    <span className="text-xl">{achievement.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{achievement.title}</div>
                      <div className="text-xs text-gray-500">{achievement.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Question Review */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-game p-6 md:p-8 mb-6 border border-white/50">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Review Your Answers
          </h2>
          <div className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div
                  key={index}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 leaderboard-row ${
                    isCorrect 
                      ? 'border-emerald-200 bg-emerald-50/50' 
                      : 'border-red-200 bg-red-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Question Number */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      isCorrect 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 mb-2">
                        {question.question}
                      </p>
                      <div className="space-y-1 text-sm">
                        {userAnswer && (
                          <div className={`flex items-center gap-2 ${isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
                            {isCorrect ? (
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                            <span>Your answer: {userAnswer}</span>
                          </div>
                        )}
                        {!isCorrect && (
                          <div className="flex items-center gap-2 text-emerald-700">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Correct: {question.correctAnswer}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      isCorrect ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      {isCorrect ? (
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handlePlayAgain}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold py-4 px-8 rounded-xl hover:from-teal-600 hover:to-teal-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-teal-500/30 btn-press"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Play Again
          </button>
          {!isGuest && (
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-4 px-8 rounded-xl hover:from-purple-600 hover:to-indigo-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-purple-500/30 btn-press"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              View Profile
            </button>
          )}
          <button
            onClick={handleRestart}
            className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 font-medium py-4 px-6 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Exit
          </button>
        </div>

        {/* Motivational Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {percentage >= 70 
              ? "You're doing great! Challenge yourself with another round 🚀" 
              : "Practice makes perfect! Each quiz helps you learn more 📈"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Results;
