// localStorage keys
export const STORAGE_KEYS = {
  USER: 'quizUser',
  QUESTIONS: 'quizQuestions',
  CURRENT_INDEX: 'quizCurrentIndex',
  ANSWERS: 'quizAnswers',
  SCORE: 'quizScore',
  START_TIME: 'quizStartTime',
  TIME_REMAINING: 'quizTimeRemaining',
  QUIZ_PREFERENCES: 'quizPreferences',
  // New keys for user accounts
  USERS_DB: 'quizUsersDB',
  SESSION: 'quizSession',
};

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

/**
 * Get data from localStorage
 * @param {string} key - Storage key
 * @returns {any} Parsed value or null
 */
export const getFromStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
};

/**
 * Clear all quiz-related data from localStorage
 */
export const clearQuizData = () => {
  try {
    // Keys to preserve (user account data)
    const preserveKeys = [
      STORAGE_KEYS.USER,
      STORAGE_KEYS.USERS_DB,
      STORAGE_KEYS.SESSION,
    ];
    
    Object.values(STORAGE_KEYS).forEach(key => {
      if (!preserveKeys.includes(key)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing quiz data:', error);
  }
};

/**
 * Save quiz state to localStorage
 * @param {Object} state - Quiz state
 */
export const saveQuizState = (state) => {
  saveToStorage(STORAGE_KEYS.QUESTIONS, state.questions);
  saveToStorage(STORAGE_KEYS.CURRENT_INDEX, state.currentIndex);
  saveToStorage(STORAGE_KEYS.ANSWERS, state.answers);
  saveToStorage(STORAGE_KEYS.SCORE, state.score);
  saveToStorage(STORAGE_KEYS.TIME_REMAINING, state.timeRemaining);
  if (state.startTime) {
    saveToStorage(STORAGE_KEYS.START_TIME, state.startTime);
  }
  if (state.quizPreferences) {
    saveToStorage(STORAGE_KEYS.QUIZ_PREFERENCES, state.quizPreferences);
  }
};

/**
 * Load quiz state from localStorage
 * @returns {Object|null} Quiz state or null
 */
export const loadQuizState = () => {
  const questions = getFromStorage(STORAGE_KEYS.QUESTIONS);
  const currentIndex = getFromStorage(STORAGE_KEYS.CURRENT_INDEX);
  const answers = getFromStorage(STORAGE_KEYS.ANSWERS);
  const score = getFromStorage(STORAGE_KEYS.SCORE);
  const timeRemaining = getFromStorage(STORAGE_KEYS.TIME_REMAINING);
  const startTime = getFromStorage(STORAGE_KEYS.START_TIME);
  const quizPreferences = getFromStorage(STORAGE_KEYS.QUIZ_PREFERENCES);
  
  if (questions && currentIndex !== null && answers && score !== null) {
    return {
      questions,
      currentIndex,
      answers,
      score,
      timeRemaining: timeRemaining !== null ? timeRemaining : 300,
      startTime,
      quizPreferences: quizPreferences || {
        category: 'any',
        difficulty: 'any',
        categoryName: 'Any Category',
        difficultyName: 'Any Difficulty',
      },
    };
  }
  
  return null;
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return getFromStorage(STORAGE_KEYS.USER) !== null;
};

/**
 * Get current user
 * @returns {string|null}
 */
export const getCurrentUser = () => {
  return getFromStorage(STORAGE_KEYS.USER);
};

/**
 * Save user to localStorage
 * @param {string} username
 */
export const saveUser = (username) => {
  saveToStorage(STORAGE_KEYS.USER, username);
};

/**
 * Logout user (legacy - for backward compatibility)
 */
export const logout = () => {
  clearQuizData();
  removeFromStorage(STORAGE_KEYS.USER);
};

// ============================================
// NEW: User Account Management Functions
// ============================================

/**
 * Get all users from the database
 * @returns {Object} Users object keyed by username
 */
export const getUsers = () => {
  return getFromStorage(STORAGE_KEYS.USERS_DB) || {};
};

/**
 * Save all users to the database
 * @param {Object} users - Users object
 */
export const saveUsers = (users) => {
  saveToStorage(STORAGE_KEYS.USERS_DB, users);
};

/**
 * Get user profile by username
 * @param {string} username
 * @returns {Object|null} User profile
 */
export const getUserProfile = (username) => {
  const users = getUsers();
  return users[username.toLowerCase()] || null;
};

/**
 * Save user profile
 * @param {string} username
 * @param {Object} profile
 */
export const saveUserProfile = (username, profile) => {
  const users = getUsers();
  users[username.toLowerCase()] = profile;
  saveUsers(users);
};

/**
 * Get current session
 * @returns {Object|null} Session data
 */
export const getCurrentSession = () => {
  return getFromStorage(STORAGE_KEYS.SESSION);
};

/**
 * Save session
 * @param {Object} session - Session data
 */
export const saveSession = (session) => {
  saveToStorage(STORAGE_KEYS.SESSION, session);
  // Also save to legacy USER key for backward compatibility
  saveToStorage(STORAGE_KEYS.USER, session.username);
};

/**
 * Clear session
 */
export const clearSession = () => {
  removeFromStorage(STORAGE_KEYS.SESSION);
  removeFromStorage(STORAGE_KEYS.USER);
  clearQuizData();
};

/**
 * Check if user is authenticated (has active session)
 * @returns {boolean}
 */
export const hasActiveSession = () => {
  return getCurrentSession() !== null;
};
