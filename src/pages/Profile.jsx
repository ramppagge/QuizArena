import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuiz } from '../context/QuizContext';

const Profile = () => {
  const navigate = useNavigate();
  const { 
    user, 
    isGuest, 
    logout, 
    calculateLevel, 
    getLevelProgress, 
    getXPForNextLevel,
    LEVEL_THRESHOLDS 
  } = useAuth();
  const { resetQuiz } = useQuiz();

  if (!user) {
    navigate('/');
    return null;
  }

  const level = user.isGuest ? 1 : calculateLevel(user.xp || 0);
  const levelProgress = user.isGuest ? 0 : getLevelProgress(user.xp || 0);
  const xpForNext = user.isGuest ? 100 : getXPForNextLevel(user.xp || 0);
  const accuracy = user.totalQuestions > 0 
    ? Math.round((user.totalCorrect / user.totalQuestions) * 100) 
    : 0;

  const handleLogout = () => {
    resetQuiz();
    logout();
    navigate('/');
  };

  const handleStartQuiz = () => {
    resetQuiz();
    navigate('/setup');
  };

  // Get level title
  const getLevelTitle = (lvl) => {
    const titles = {
      1: 'Novice',
      2: 'Apprentice',
      3: 'Scholar',
      4: 'Expert',
      5: 'Master',
      6: 'Grandmaster',
      7: 'Champion',
      8: 'Legend',
      9: 'Mythic',
      10: 'Quiz God',
    };
    return titles[lvl] || 'Novice';
  };

  // Get level color
  const getLevelColor = (lvl) => {
    if (lvl >= 9) return 'from-amber-400 to-yellow-500';
    if (lvl >= 7) return 'from-purple-400 to-pink-500';
    if (lvl >= 5) return 'from-teal-400 to-emerald-500';
    if (lvl >= 3) return 'from-cyan-400 to-blue-500';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-amber-50 py-8 px-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/setup')}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-teal-600 font-medium mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Quiz
        </button>

        {/* Profile Header Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-game p-8 mb-6 border border-white/50">
          {/* Guest Warning */}
          {isGuest && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Playing as Guest</h4>
                  <p className="text-sm text-amber-700">Your progress is not being saved. Create an account to track your XP, Level, and Achievements!</p>
                  <button 
                    onClick={() => navigate('/register')}
                    className="mt-2 text-sm font-semibold text-amber-700 hover:text-amber-800 underline"
                  >
                    Create Account →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Profile Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getLevelColor(level)} flex items-center justify-center shadow-lg`}>
                <span className="text-4xl font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              {!isGuest && (
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full px-3 py-1 shadow-lg border-2 border-teal-500">
                  <span className="text-sm font-bold text-teal-600">Lv.{level}</span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-display font-bold text-gray-800 mb-1">
                {user.username}
                {isGuest && <span className="text-lg text-gray-400 ml-2">(Guest)</span>}
              </h1>
              {!isGuest && (
                <>
                  <p className={`text-lg font-semibold bg-gradient-to-r ${getLevelColor(level)} bg-clip-text text-transparent`}>
                    {getLevelTitle(level)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* XP Progress Bar (for registered users) */}
          {!isGuest && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Experience Points</span>
                <span className="text-sm font-bold text-teal-600">
                  {user.xp || 0} XP
                  {level < 10 && <span className="text-gray-400 font-normal"> / {LEVEL_THRESHOLDS[level]} XP</span>}
                </span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getLevelColor(level)} rounded-full transition-all duration-500`}
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
              {level < 10 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {xpForNext} XP until Level {level + 1}
                </p>
              )}
              {level >= 10 && (
                <p className="text-xs text-amber-600 mt-2 text-center font-semibold">
                  Max Level Reached! You're a Quiz God!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Stats Grid (for registered users) */}
        {!isGuest && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-game p-4 text-center border border-white/50 card-hover">
              <div className="text-3xl font-bold text-teal-600 mb-1">{user.totalQuizzes || 0}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quizzes</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-game p-4 text-center border border-white/50 card-hover">
              <div className="text-3xl font-bold text-emerald-600 mb-1">{user.totalCorrect || 0}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Correct</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-game p-4 text-center border border-white/50 card-hover">
              <div className="text-3xl font-bold text-amber-600 mb-1">{accuracy}%</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-game p-4 text-center border border-white/50 card-hover">
              <div className="text-3xl font-bold text-purple-600 mb-1">{(user.achievements || []).length}</div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Achievements</div>
            </div>
          </div>
        )}

        {/* Achievements Section (for registered users) */}
        {!isGuest && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-game p-6 mb-6 border border-white/50">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Achievements
            </h2>
            
            {(user.achievements || []).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(user.achievements || []).map((achievement, idx) => (
                  <div 
                    key={achievement.id || idx}
                    className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-4 py-3"
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-800">{achievement.title}</div>
                      <div className="text-xs text-gray-500">{achievement.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-gray-500">Complete quizzes to unlock achievements!</p>
              </div>
            )}
          </div>
        )}

        {/* Recent Quiz History (for registered users) */}
        {!isGuest && (user.quizHistory || []).length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-game p-6 mb-6 border border-white/50">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Quizzes
            </h2>
            
            <div className="space-y-3">
              {(user.quizHistory || []).slice(0, 5).map((quiz, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                >
                  <div>
                    <div className="font-medium text-gray-800">{quiz.category || 'General'}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(quiz.date).toLocaleDateString()} • {quiz.difficulty || 'Any'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-teal-600">{quiz.score}/{quiz.total}</div>
                    <div className="text-xs text-amber-600">+{quiz.xpEarned} XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleStartQuiz}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold py-4 px-6 rounded-xl hover:from-teal-600 hover:to-teal-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-teal-500/30 btn-press"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start New Quiz
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 text-gray-500 hover:text-red-500 font-medium py-4 px-6 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isGuest ? 'Exit' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
