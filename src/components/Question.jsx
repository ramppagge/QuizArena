import { useState } from 'react';
import { useQuiz } from '../context/QuizContext';

const Question = () => {
  const { questions, currentIndex, submitAnswer } = useQuiz();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!questions || questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentIndex];

  const handleAnswerClick = (answer, index) => {
    if (isSubmitting) return;
    
    setSelectedAnswer(index);
    setIsSubmitting(true);
    
    // Short delay for visual feedback
    setTimeout(() => {
      submitAnswer(answer);
      setSelectedAnswer(null);
      setIsSubmitting(false);
    }, 300);
  };

  const getDifficultyBadge = (difficulty) => {
    const styles = {
      easy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      medium: 'bg-amber-100 text-amber-700 border-amber-200',
      hard: 'bg-red-100 text-red-700 border-red-200',
    };
    return styles[difficulty?.toLowerCase()] || styles.medium;
  };

  const getAnswerLetter = (index) => {
    return String.fromCharCode(65 + index);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Question Header */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30">
              {currentIndex + 1}
            </span>
            <span className="text-gray-500 font-medium">of {questions.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${getDifficultyBadge(currentQuestion.difficulty)}`}>
              {currentQuestion.difficulty}
            </span>
            <span className="text-xs font-medium px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full">
              {currentQuestion.category}
            </span>
          </div>
        </div>
        
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">
          {currentQuestion.question}
        </h2>
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {currentQuestion.answers.map((answer, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(answer, index)}
            disabled={isSubmitting}
            className={`answer-option w-full p-4 text-left rounded-2xl border-2 transition-all duration-200 group
              ${selectedAnswer === index 
                ? 'border-teal-500 bg-teal-50 shadow-lg shadow-teal-500/20 scale-[1.02]' 
                : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/50'
              }
              ${isSubmitting && selectedAnswer !== index ? 'opacity-50' : ''}
            `}
          >
            <span className="flex items-center">
              <span className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl mr-4 font-bold text-sm transition-all duration-200
                ${selectedAnswer === index 
                  ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30' 
                  : 'bg-gray-100 text-gray-600 group-hover:bg-teal-100 group-hover:text-teal-700'
                }`}
              >
                {getAnswerLetter(index)}
              </span>
              <span className={`font-medium transition-colors duration-200
                ${selectedAnswer === index ? 'text-teal-800' : 'text-gray-700 group-hover:text-gray-900'}`}
              >
                {answer}
              </span>
              
              {/* Selection Indicator */}
              <span className={`ml-auto transition-all duration-200 ${selectedAnswer === index ? 'opacity-100' : 'opacity-0'}`}>
                <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Hint/Encouragement */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400 italic">
          Trust your instincts — you've got this!
        </p>
      </div>
    </div>
  );
};

export default Question;
