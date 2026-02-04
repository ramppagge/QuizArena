import { useState } from 'react';
import { useQuiz } from '../context/QuizContext';

const Question = () => {
  const { questions, currentIndex, submitAnswer } = useQuiz();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(null);

  if (!questions || questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentIndex];

  const handleAnswerClick = (answer, index) => {
    if (isSubmitting) return;
    
    // Check if the answer is correct
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    setSelectedAnswer(index);
    setIsCorrectAnswer(isCorrect);
    setIsSubmitting(true);
    
    // Longer delay for visual feedback to show correct/wrong state
    setTimeout(() => {
      submitAnswer(answer);
      setSelectedAnswer(null);
      setIsCorrectAnswer(null);
      setIsSubmitting(false);
    }, 600);
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
        {currentQuestion.answers.map((answer, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = isSelected && isCorrectAnswer === true;
          const isWrong = isSelected && isCorrectAnswer === false;
          
          // Determine colors based on correctness
          const getButtonClasses = () => {
            if (isCorrect) {
              return 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/20 scale-[1.02]';
            }
            if (isWrong) {
              return 'border-red-500 bg-red-50 shadow-lg shadow-red-500/20 scale-[1.02]';
            }
            if (isSelected) {
              return 'border-teal-500 bg-teal-50 shadow-lg shadow-teal-500/20 scale-[1.02]';
            }
            return 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/50';
          };
          
          const getLetterClasses = () => {
            if (isCorrect) {
              return 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30';
            }
            if (isWrong) {
              return 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30';
            }
            if (isSelected) {
              return 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30';
            }
            return 'bg-gray-100 text-gray-600 group-hover:bg-teal-100 group-hover:text-teal-700';
          };
          
          const getTextClasses = () => {
            if (isCorrect) return 'text-emerald-800';
            if (isWrong) return 'text-red-800';
            if (isSelected) return 'text-teal-800';
            return 'text-gray-700 group-hover:text-gray-900';
          };
          
          const getIconColor = () => {
            if (isCorrect) return 'text-emerald-500';
            if (isWrong) return 'text-red-500';
            return 'text-teal-500';
          };
          
          return (
            <button
              key={index}
              onClick={() => handleAnswerClick(answer, index)}
              disabled={isSubmitting}
              className={`answer-option w-full p-4 text-left rounded-2xl border-2 transition-all duration-200 group
                ${getButtonClasses()}
                ${isSubmitting && !isSelected ? 'opacity-50' : ''}
              `}
            >
              <span className="flex items-center">
                <span className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl mr-4 font-bold text-sm transition-all duration-200 ${getLetterClasses()}`}>
                  {getAnswerLetter(index)}
                </span>
                <span className={`font-medium transition-colors duration-200 ${getTextClasses()}`}>
                  {answer}
                </span>
                
                {/* Selection Indicator - different icons for correct/wrong */}
                <span className={`ml-auto transition-all duration-200 ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                  {isCorrect ? (
                    <svg className={`w-6 h-6 ${getIconColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : isWrong ? (
                    <svg className={`w-6 h-6 ${getIconColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className={`w-6 h-6 ${getIconColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </span>
              </span>
            </button>
          );
        })}
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
