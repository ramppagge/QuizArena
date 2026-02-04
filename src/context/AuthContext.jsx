import { createContext, useContext, useState, useEffect } from 'react';
import {
  getUsers,
  saveUsers,
  getCurrentSession,
  saveSession,
  clearSession,
  getUserProfile,
  saveUserProfile,
} from '../utils/storage';

const AuthContext = createContext();

// XP required for each level (cumulative)
const LEVEL_THRESHOLDS = [
  0,      // Level 1: 0 XP
  100,    // Level 2: 100 XP
  250,    // Level 3: 250 XP
  500,    // Level 4: 500 XP
  850,    // Level 5: 850 XP
  1300,   // Level 6: 1300 XP
  1900,   // Level 7: 1900 XP
  2700,   // Level 8: 2700 XP
  3700,   // Level 9: 3700 XP
  5000,   // Level 10: 5000 XP
];

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      if (session.isGuest) {
        setIsGuest(true);
        setUser({ username: session.username, isGuest: true });
      } else {
        const profile = getUserProfile(session.username);
        if (profile) {
          setUser(profile);
        }
      }
    }
    setIsLoading(false);
  }, []);

  // Calculate level from XP
  const calculateLevel = (xp) => {
    let level = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        level = i + 1;
        break;
      }
    }
    return Math.min(level, 10);
  };

  // Get XP needed for next level
  const getXPForNextLevel = (currentXP) => {
    const currentLevel = calculateLevel(currentXP);
    if (currentLevel >= 10) return 0;
    return LEVEL_THRESHOLDS[currentLevel] - currentXP;
  };

  // Get XP progress percentage for current level
  const getLevelProgress = (currentXP) => {
    const currentLevel = calculateLevel(currentXP);
    if (currentLevel >= 10) return 100;
    
    const currentLevelXP = LEVEL_THRESHOLDS[currentLevel - 1];
    const nextLevelXP = LEVEL_THRESHOLDS[currentLevel];
    const progressXP = currentXP - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    
    return Math.round((progressXP / requiredXP) * 100);
  };

  // Register a new user
  const register = (username, password) => {
    const users = getUsers();
    
    // Check if username already exists
    if (users[username.toLowerCase()]) {
      return { success: false, error: 'Username already exists' };
    }

    // Create new user profile
    const newProfile = {
      username: username,
      password: password, // In production, this should be hashed
      xp: 0,
      level: 1,
      totalQuizzes: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      achievements: [],
      quizHistory: [],
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };

    // Save to users database
    users[username.toLowerCase()] = newProfile;
    saveUsers(users);

    // Save session
    saveSession({ username: username, isGuest: false });
    setUser(newProfile);
    setIsGuest(false);

    return { success: true };
  };

  // Login existing user
  const login = (username, password) => {
    const users = getUsers();
    const userProfile = users[username.toLowerCase()];

    if (!userProfile) {
      return { success: false, error: 'User not found' };
    }

    if (userProfile.password !== password) {
      return { success: false, error: 'Incorrect password' };
    }

    // Update last login
    userProfile.lastLoginAt = Date.now();
    users[username.toLowerCase()] = userProfile;
    saveUsers(users);

    // Save session
    saveSession({ username: userProfile.username, isGuest: false });
    setUser(userProfile);
    setIsGuest(false);

    return { success: true };
  };

  // Continue as guest
  const continueAsGuest = (displayName) => {
    const guestUser = {
      username: displayName || 'Guest',
      isGuest: true,
    };
    saveSession({ username: guestUser.username, isGuest: true });
    setUser(guestUser);
    setIsGuest(true);
    return { success: true };
  };

  // Logout
  const logout = () => {
    clearSession();
    setUser(null);
    setIsGuest(false);
  };

  // Add XP and check for level up
  const addXP = (amount) => {
    if (isGuest || !user) return null;

    const users = getUsers();
    const userProfile = users[user.username.toLowerCase()];
    
    if (!userProfile) return null;

    const oldLevel = calculateLevel(userProfile.xp);
    userProfile.xp += amount;
    const newLevel = calculateLevel(userProfile.xp);
    userProfile.level = newLevel;

    users[user.username.toLowerCase()] = userProfile;
    saveUsers(users);
    setUser({ ...userProfile });

    return {
      xpGained: amount,
      newTotalXP: userProfile.xp,
      leveledUp: newLevel > oldLevel,
      oldLevel,
      newLevel,
    };
  };

  // Update quiz stats
  const updateStats = (quizResult) => {
    if (isGuest || !user) return;

    const users = getUsers();
    const userProfile = users[user.username.toLowerCase()];
    
    if (!userProfile) return;

    userProfile.totalQuizzes += 1;
    userProfile.totalCorrect += quizResult.correctAnswers;
    userProfile.totalQuestions += quizResult.totalQuestions;
    
    // Add to quiz history (keep last 20)
    userProfile.quizHistory.unshift({
      date: Date.now(),
      category: quizResult.category,
      difficulty: quizResult.difficulty,
      score: quizResult.correctAnswers,
      total: quizResult.totalQuestions,
      xpEarned: quizResult.xpEarned,
    });
    if (userProfile.quizHistory.length > 20) {
      userProfile.quizHistory = userProfile.quizHistory.slice(0, 20);
    }

    users[user.username.toLowerCase()] = userProfile;
    saveUsers(users);
    setUser({ ...userProfile });
  };

  // Unlock achievement
  const unlockAchievement = (achievementId, achievementData) => {
    if (isGuest || !user) return false;

    const users = getUsers();
    const userProfile = users[user.username.toLowerCase()];
    
    if (!userProfile) return false;

    // Check if already unlocked
    if (userProfile.achievements.some(a => a.id === achievementId)) {
      return false;
    }

    userProfile.achievements.push({
      id: achievementId,
      ...achievementData,
      unlockedAt: Date.now(),
    });

    users[user.username.toLowerCase()] = userProfile;
    saveUsers(users);
    setUser({ ...userProfile });

    return true;
  };

  // Check and unlock achievements based on stats
  const checkAchievements = (quizResult) => {
    if (isGuest || !user) return [];

    const newAchievements = [];
    const users = getUsers();
    const userProfile = users[user.username.toLowerCase()];
    
    if (!userProfile) return [];

    // First Quiz
    if (userProfile.totalQuizzes === 1) {
      if (unlockAchievement('first_quiz', { 
        title: 'First Steps', 
        icon: '🎯', 
        description: 'Complete your first quiz' 
      })) {
        newAchievements.push({ id: 'first_quiz', title: 'First Steps', icon: '🎯' });
      }
    }

    // Perfect Score
    if (quizResult.correctAnswers === quizResult.totalQuestions) {
      if (unlockAchievement('perfect_score', { 
        title: 'Perfectionist', 
        icon: '💯', 
        description: 'Get a perfect score on a quiz' 
      })) {
        newAchievements.push({ id: 'perfect_score', title: 'Perfectionist', icon: '💯' });
      }
    }

    // Quiz Enthusiast (10 quizzes)
    if (userProfile.totalQuizzes >= 10) {
      if (unlockAchievement('quiz_enthusiast', { 
        title: 'Quiz Enthusiast', 
        icon: '📚', 
        description: 'Complete 10 quizzes' 
      })) {
        newAchievements.push({ id: 'quiz_enthusiast', title: 'Quiz Enthusiast', icon: '📚' });
      }
    }

    // Quiz Master (50 quizzes)
    if (userProfile.totalQuizzes >= 50) {
      if (unlockAchievement('quiz_master', { 
        title: 'Quiz Master', 
        icon: '🏆', 
        description: 'Complete 50 quizzes' 
      })) {
        newAchievements.push({ id: 'quiz_master', title: 'Quiz Master', icon: '🏆' });
      }
    }

    // Knowledge Seeker (100 correct answers)
    if (userProfile.totalCorrect >= 100) {
      if (unlockAchievement('knowledge_seeker', { 
        title: 'Knowledge Seeker', 
        icon: '🧠', 
        description: 'Answer 100 questions correctly' 
      })) {
        newAchievements.push({ id: 'knowledge_seeker', title: 'Knowledge Seeker', icon: '🧠' });
      }
    }

    // Genius (500 correct answers)
    if (userProfile.totalCorrect >= 500) {
      if (unlockAchievement('genius', { 
        title: 'Genius', 
        icon: '🎓', 
        description: 'Answer 500 questions correctly' 
      })) {
        newAchievements.push({ id: 'genius', title: 'Genius', icon: '🎓' });
      }
    }

    // Level achievements
    const levelAchievements = {
      5: { id: 'level_5', title: 'Rising Star', icon: '⭐', description: 'Reach Level 5' },
      10: { id: 'level_10', title: 'Quiz Legend', icon: '👑', description: 'Reach Level 10' },
    };

    const currentLevel = userProfile.level;
    for (const [level, achievement] of Object.entries(levelAchievements)) {
      if (currentLevel >= parseInt(level)) {
        if (unlockAchievement(achievement.id, achievement)) {
          newAchievements.push({ id: achievement.id, title: achievement.title, icon: achievement.icon });
        }
      }
    }

    // High scorer (80%+ accuracy overall after 5 quizzes)
    if (userProfile.totalQuizzes >= 5) {
      const accuracy = (userProfile.totalCorrect / userProfile.totalQuestions) * 100;
      if (accuracy >= 80) {
        if (unlockAchievement('high_scorer', { 
          title: 'High Scorer', 
          icon: '🎯', 
          description: 'Maintain 80%+ accuracy after 5 quizzes' 
        })) {
          newAchievements.push({ id: 'high_scorer', title: 'High Scorer', icon: '🎯' });
        }
      }
    }

    return newAchievements;
  };

  const value = {
    user,
    isGuest,
    isLoading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    continueAsGuest,
    addXP,
    updateStats,
    unlockAchievement,
    checkAchievements,
    calculateLevel,
    getXPForNextLevel,
    getLevelProgress,
    LEVEL_THRESHOLDS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
