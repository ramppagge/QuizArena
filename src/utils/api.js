import { decode } from 'he';

const BASE_API_URL = 'https://opentdb.com/api.php';
const CATEGORIES_URL = 'https://opentdb.com/api_category.php';
const CATEGORY_COUNT_URL = 'https://opentdb.com/api_count.php';

let lastSuccessAt = 0;
let lastResults = null;
let cachedCategories = null;

// Difficulty levels available in OpenTDB
export const DIFFICULTY_LEVELS = [
  { id: 'any', name: 'Any Difficulty', description: 'Mix of all difficulties' },
  { id: 'easy', name: 'Easy', description: 'Perfect for beginners' },
  { id: 'medium', name: 'Medium', description: 'A balanced challenge' },
  { id: 'hard', name: 'Hard', description: 'For quiz masters only' },
];

/**
 * Fetch all available categories from OpenTDB
 * @returns {Promise<Array>} Array of categories with id and name
 */
export const fetchCategories = async () => {
  if (cachedCategories) {
    return cachedCategories;
  }
  
  try {
    const response = await fetch(CATEGORIES_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const data = await response.json();
    
    // Add "Any Category" option at the beginning
    cachedCategories = [
      { id: 'any', name: 'Any Category' },
      ...data.trivia_categories.map(cat => ({
        id: cat.id,
        name: cat.name,
      })),
    ];
    
    return cachedCategories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get question count for a specific category and difficulty
 * @param {number|string} categoryId - Category ID
 * @param {string} difficulty - Difficulty level
 * @returns {Promise<number>} Number of available questions
 */
export const getQuestionCount = async (categoryId, difficulty) => {
  if (categoryId === 'any') {
    return 100; // Any category always has questions
  }
  
  try {
    const response = await fetch(`${CATEGORY_COUNT_URL}?category=${categoryId}`);
    if (!response.ok) {
      return 0;
    }
    
    const data = await response.json();
    const counts = data.category_question_count;
    
    if (difficulty === 'any') {
      return counts.total_question_count;
    }
    
    const difficultyKey = `total_${difficulty}_question_count`;
    return counts[difficultyKey] || 0;
  } catch (error) {
    console.error('Error fetching question count:', error);
    return 0;
  }
};

/**
 * Build API URL with given parameters
 * @param {Object} options - Quiz options
 * @returns {string} Complete API URL
 */
const buildApiUrl = ({ amount = 10, category, difficulty }) => {
  const params = new URLSearchParams({
    amount: amount.toString(),
    type: 'multiple',
  });
  
  if (category && category !== 'any') {
    params.append('category', category.toString());
  }
  
  if (difficulty && difficulty !== 'any') {
    params.append('difficulty', difficulty);
  }
  
  return `${BASE_API_URL}?${params.toString()}`;
};

/**
 * Helper function to delay execution
 * @param {number} ms - Milliseconds to wait
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch quiz questions from OpenTDB API with retry logic
 * @param {Object} options - Quiz options (category, difficulty, amount)
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<Array>} Array of decoded and formatted questions
 */
export const fetchQuizQuestions = async (options = {}, retries = 3) => {
  const { category = 'any', difficulty = 'any', amount = 10 } = options;
  
  let lastError = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Wait before retry (exponential backoff)
      if (attempt > 0) {
        await delay(1000 * attempt);
      }
      
      const apiUrl = buildApiUrl({ amount, category, difficulty });
      const response = await fetch(apiUrl);
      
      // Handle rate limiting
      if (response.status === 429) {
        if (lastResults && Date.now() - lastSuccessAt < 60000) {
          console.log('Rate limited, using cached results');
          return lastResults;
        }
        lastError = new Error('Too many requests. Please wait a moment and try again.');
        continue;
      }
      
      if (!response.ok) {
        lastError = new Error(`Server error (${response.status}). Please try again.`);
        continue;
      }
      
      const data = await response.json();
      
      // Handle different response codes
      if (data.response_code === 1) {
        throw new Error('Not enough questions available for the selected options. Try a different category or difficulty.');
      }
      if (data.response_code === 2) {
        throw new Error('Invalid category or difficulty selected.');
      }
      if (data.response_code === 5) {
        // Rate limit from API
        if (lastResults && Date.now() - lastSuccessAt < 60000) {
          return lastResults;
        }
        lastError = new Error('Too many requests. Please wait a moment and try again.');
        continue;
      }
      if (data.response_code !== 0) {
        lastError = new Error('Quiz service temporarily unavailable. Please try again.');
        continue;
      }
      
      // Decode HTML entities and shuffle answers
      const mapped = data.results.map((question) => {
        const decodedQuestion = decode(question.question);
        const decodedCorrectAnswer = decode(question.correct_answer);
        const decodedIncorrectAnswers = question.incorrect_answers.map(answer => 
          decode(answer)
        );
        
        // Combine and shuffle answers
        const allAnswers = [...decodedIncorrectAnswers, decodedCorrectAnswer];
        const shuffledAnswers = shuffleArray(allAnswers);
        
        return {
          question: decodedQuestion,
          correctAnswer: decodedCorrectAnswer,
          answers: shuffledAnswers,
          category: question.category,
          difficulty: question.difficulty,
        };
      });
      
      lastResults = mapped;
      lastSuccessAt = Date.now();
      return mapped;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error;
      
      // Don't retry on validation errors
      if (error.message.includes('Not enough questions') || 
          error.message.includes('Invalid category')) {
        throw error;
      }
    }
  }
  
  // All retries failed
  console.error('All retry attempts failed:', lastError);
  throw lastError || new Error('Failed to load questions. Please check your internet connection and try again.');
};

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
