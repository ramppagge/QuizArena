# React Quiz Application

A modern, interactive quiz application built with React, featuring authentication, timer functionality, and automatic progress saving.

## Features

✅ **Simple Authentication** - Username-based login with localStorage persistence  
✅ **API Integration** - Fetches 10 multiple-choice questions from OpenTDB API  
✅ **HTML Decoding** - Properly displays special characters and entities  
✅ **One Question at a Time** - Clean, focused interface with auto-advance  
✅ **Resume Feature** - Automatically saves progress to localStorage  
✅ **5-Minute Timer** - Countdown timer with auto-submit when time expires  
✅ **Results Page** - Detailed statistics with answer review  
✅ **Modern UI** - Beautiful, responsive design with Tailwind CSS  

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173/` (or the next available port).

### Build for Production

```bash
npm build
```

## How It Works

### 1. Login Page
- Enter your username to begin
- Username is saved to localStorage for session persistence
- If you have an existing quiz in progress, you can resume it

### 2. Quiz Page
- 10 multiple-choice questions from various categories
- One question displayed at a time
- Click any answer to automatically move to the next question
- 5-minute countdown timer (changes color as time decreases)
- Progress bar shows completion percentage
- Your progress is automatically saved after each answer

### 3. Results Page
- View your final score and statistics:
  - Total questions
  - Total answered
  - Correct answers
  - Wrong answers
- Review all questions with your answers and correct answers
- Restart quiz to try again

## Persistence Features

The application automatically saves the following to localStorage:

- Username (`quizUser`)
- Quiz questions (`quizQuestions`)
- Current question index (`quizCurrentIndex`)
- Your answers (`quizAnswers`)
- Current score (`quizScore`)
- Time remaining (`quizTimeRemaining`)

If you close the browser or refresh the page, you can resume exactly where you left off!

## Tech Stack

- **React 19** - UI framework
- **React Router DOM** - Navigation and routing
- **Tailwind CSS v4** - Styling and design
- **Vite** - Build tool and dev server
- **he** - HTML entity decoder
- **OpenTDB API** - Quiz questions source

## Project Structure

```
src/
├── components/
│   ├── Timer.jsx           # Countdown timer component
│   ├── Question.jsx        # Question display with answers
│   ├── ProgressBar.jsx     # Visual progress indicator
│   └── ProtectedRoute.jsx  # Route protection wrapper
├── pages/
│   ├── Login.jsx           # Authentication page
│   ├── Quiz.jsx            # Main quiz interface
│   └── Results.jsx         # Results and review page
├── context/
│   └── QuizContext.jsx     # Global state management
├── utils/
│   ├── api.js              # API fetching and data processing
│   └── storage.js          # localStorage utilities
├── App.jsx                 # Main app component with routing
└── main.jsx                # Application entry point
```

## Features in Detail

### Authentication System
- Simple username input (minimum 2 characters)
- Protected routes - only authenticated users can access quiz pages
- Logout functionality clears all quiz data

### Timer Functionality
- Starts at 5 minutes (300 seconds)
- Updates every second
- Color-coded indicators:
  - Green: > 2 minutes remaining
  - Yellow: 1-2 minutes remaining
  - Red: < 1 minute remaining
- Automatically navigates to results when time expires
- Timer state is saved for resume feature

### Question Shuffling
- Correct and incorrect answers are combined and randomized
- Uses Fisher-Yates shuffle algorithm
- Ensures fair question presentation

### Error Handling
- API fetch errors are caught and displayed
- Retry button for failed API calls
- localStorage errors are handled gracefully
- Works in incognito mode (with limited persistence)

## Browser Support

Works on all modern browsers that support:
- ES6+ JavaScript
- localStorage API
- CSS Grid and Flexbox

## License

MIT

## Credits

Questions provided by [Open Trivia Database](https://opentdb.com/)
