import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { fetchQuizQuestions } from '../utils/api';
import { saveQuizState, loadQuizState, clearQuizData } from '../utils/storage';

const QuizContext = createContext();

const TOTAL_TIME = 300; // 5 minutes in seconds

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within QuizProvider');
  }
  return context;
};

export const QuizProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);
  const [quizPreferences, setQuizPreferences] = useState({
    category: 'any',
    difficulty: 'any',
    categoryName: 'Any Category',
    difficultyName: 'Any Difficulty',
  });
  const isStartingRef = useRef(false);

  // Load saved state on mount
  useEffect(() => {
    const savedState = loadQuizState();
    if (savedState && savedState.startTime) {
      // Calculate real elapsed time since quiz started
      const elapsedSeconds = Math.floor((Date.now() - savedState.startTime) / 1000);
      const calculatedTimeRemaining = Math.max(0, TOTAL_TIME - elapsedSeconds);
      
      setQuestions(savedState.questions);
      setCurrentIndex(savedState.currentIndex);
      setAnswers(savedState.answers);
      setScore(savedState.score);
      setTimeRemaining(calculatedTimeRemaining);
      setStartTime(savedState.startTime);
      setQuizStarted(true);
      
      // Restore preferences if available
      if (savedState.quizPreferences) {
        setQuizPreferences(savedState.quizPreferences);
      }
    }
    setHasAttemptedRestore(true);
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (quizStarted && questions.length > 0 && startTime) {
      saveQuizState({
        questions,
        currentIndex,
        answers,
        score,
        timeRemaining,
        startTime,
        quizPreferences,
      });
    }
  }, [questions, currentIndex, answers, score, timeRemaining, quizStarted, startTime, quizPreferences]);

  const startQuiz = async () => {
    if (isStartingRef.current) {
      return;
    }
    isStartingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      // Get preferences from sessionStorage
      const prefsJson = sessionStorage.getItem('quizPreferences');
      const prefs = prefsJson ? JSON.parse(prefsJson) : {
        category: 'any',
        difficulty: 'any',
        categoryName: 'Any Category',
        difficultyName: 'Any Difficulty',
      };
      
      setQuizPreferences(prefs);
      
      const fetchedQuestions = await fetchQuizQuestions({
        category: prefs.category,
        difficulty: prefs.difficulty,
      });
      const newStartTime = Date.now();
      setQuestions(fetchedQuestions);
      setCurrentIndex(0);
      setAnswers(new Array(fetchedQuestions.length).fill(null));
      setScore(0);
      setTimeRemaining(TOTAL_TIME);
      setStartTime(newStartTime);
      setQuizStarted(true);
    } catch (err) {
      setError(err.message || 'Failed to load quiz questions. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
      isStartingRef.current = false;
    }
  };

  const submitAnswer = (answer) => {
    if (currentIndex >= questions.length) return;
    if (answers[currentIndex] !== null) {
      return;
    }

    const currentQuestion = questions[currentIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    // Update answers array
    const newAnswers = [...answers];
    newAnswers[currentIndex] = answer;
    setAnswers(newAnswers);
    
    // Update score if correct
    if (isCorrect) {
      setScore(score + 1);
    }
    
    // Move to next question after a brief delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 300);
  };

  const resetQuiz = () => {
    clearQuizData();
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers([]);
    setScore(0);
    setTimeRemaining(TOTAL_TIME);
    setStartTime(null);
    setQuizStarted(false);
    setError(null);
  };

  const isQuizComplete = () => {
    return currentIndex >= questions.length - 1 && answers[questions.length - 1] !== null;
  };

  const getResults = () => {
    const totalQuestions = questions.length;
    const totalAnswered = answers.filter(a => a !== null).length;
    const correctAnswers = score;
    const wrongAnswers = totalAnswered - correctAnswers;
    
    return {
      totalQuestions,
      totalAnswered,
      correctAnswers,
      wrongAnswers,
    };
  };

  const value = {
    questions,
    currentIndex,
    answers,
    score,
    timeRemaining,
    isLoading,
    error,
    quizStarted,
    hasAttemptedRestore,
    quizPreferences,
    startQuiz,
    submitAnswer,
    resetQuiz,
    isQuizComplete,
    getResults,
    setTimeRemaining,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};
