import { useQuiz } from '../context/QuizContext';

const ProgressBar = () => {
  const { questions, currentIndex, answers } = useQuiz();

  if (!questions || questions.length === 0) {
    return null;
  }

  const progress = ((currentIndex) / questions.length) * 100;
  const answeredCount = answers.filter(a => a !== null).length;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Stats */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Progress</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-500">
            {answeredCount} of {questions.length} answered
          </span>
          <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-lg">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Progress Bar with Milestones */}
      <div className="relative">
        {/* Background Track */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          {/* Progress Fill */}
          <div
            className="relative h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-500"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 shimmer rounded-full"></div>
          </div>
        </div>

        {/* Milestone Markers */}
        <div className="absolute top-0 left-0 w-full h-3 flex justify-between items-center px-0">
          {[0, 25, 50, 75, 100].map((milestone, idx) => (
            <div 
              key={milestone}
              className={`relative ${idx === 0 ? '' : idx === 4 ? '' : ''}`}
              style={{ left: `${milestone}%`, position: 'absolute', transform: 'translateX(-50%)' }}
            >
              <div 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  progress >= milestone 
                    ? 'bg-white shadow-sm' 
                    : 'bg-gray-300'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Question Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {questions.map((_, index) => {
          const isAnswered = answers[index] !== null;
          const isCurrent = index === currentIndex;
          const isCorrect = answers[index] === questions[index]?.correctAnswer;
          
          return (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isCurrent
                  ? 'bg-teal-500 ring-4 ring-teal-200 scale-125'
                  : isAnswered
                    ? isCorrect
                      ? 'bg-emerald-500'
                      : 'bg-red-400'
                    : 'bg-gray-300'
              }`}
              title={`Question ${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
