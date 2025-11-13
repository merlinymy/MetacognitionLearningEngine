# Metacognition Learning Engine - Frontend Implementation

## Overview
The frontend has been successfully implemented and integrated with the backend API. The application follows the design specifications from [UNIVERSITY_PROJECT_DESIGN.md](UNIVERSITY_PROJECT_DESIGN.md).

## Architecture

### Frontend Structure
```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── SelectionCard.jsx
│   │   ├── ConfidenceSlider.jsx
│   │   └── ProgressBar.jsx
│   ├── pages/             # Main application pages
│   │   ├── LandingPage.jsx
│   │   ├── UploadPage.jsx
│   │   ├── LearningLoopPage.jsx (Plan-Monitor-Evaluate)
│   │   ├── SessionCompletePage.jsx
│   │   ├── LibraryPage.jsx
│   │   └── InsightsPage.jsx
│   ├── services/
│   │   └── api.js         # Backend API integration
│   ├── App.jsx            # Main app with routing
│   └── main.jsx           # Entry point
```

## Backend Routes Integration

The frontend integrates with these backend API endpoints:

### Chunk Routes (`/api/chunks`)
- **POST** `/generate` - Generate chunks from text content
- **GET** `/:sessionId` - Get all chunks for a session
- **GET** `/:sessionId/:chunkId` - Get specific chunk

### Session Routes (`/api/sessions`)
- **POST** `/` - Create new session
- **GET** `/` - List all sessions
- **GET** `/:id` - Get specific session
- **PATCH** `/:id/complete-chunk` - Mark chunk as complete
- **GET** `/:id/summary` - Get session summary with stats
- **DELETE** `/:id` - Delete session

### Response Routes (`/api/responses`)
- **POST** `/` - Submit chunk response
- **GET** `/session/:sessionId` - Get all responses for a session
- **PATCH** `/:id/strategy-helpful` - Update strategy helpfulness

## Features Implemented

### 1. Upload Page
- Text upload (minimum 500 characters)
- File upload support
- Generates learning chunks via `/api/chunks/generate`
- Character counter with validation
- Error handling

### 2. Learning Loop Page
- **Plan Phase**: Select learning goal and strategy
- **Monitor Phase**: Answer questions and rate confidence
- **Evaluate Phase**: View feedback, accuracy, and calibration
- Real-time progress tracking
- Strategy effectiveness feedback
- Integrates with `/api/responses` and `/api/sessions/:id/complete-chunk`

### 3. Session Complete Page
- Displays session summary from `/api/sessions/:id/summary`
- Shows performance metrics:
  - Overall accuracy
  - Average confidence
  - Calibration (overconfident/underconfident/well-calibrated)
- Strategy performance comparison
- Personalized insights
- Celebration animations

### 4. Library Page
- Lists all user sessions from `/api/sessions`
- Shows session status (in_progress/completed)
- Displays progress bars
- Click to continue sessions
- Upload new material button

## Running the Application

### Prerequisites
- Node.js 18+
- MongoDB running on `localhost:27017`
- Gemini API key configured in `.env`

### Start Backend
```bash
# From project root
npm run dev:backend
# Backend runs on http://localhost:3000
```

### Start Frontend
```bash
# From project root
npm run dev:frontend
# Frontend runs on http://localhost:5173 (Vite dev server)
```

### Run Both Concurrently
```bash
# From project root
npm run dev
```

## Environment Variables

Ensure your `.env` file has:
```env
PORT=3000
MONGO_URL=mongodb://localhost:27017
GEMINI_API_KEY=your_gemini_api_key_here
```

## User Flow

1. **Landing** → User clicks "Get Started" or "Try Demo"
2. **Upload** → User pastes text (500+ chars) → Backend generates chunks
3. **Learning Loop** → For each chunk:
   - **Plan**: Choose goal & strategy
   - **Monitor**: Answer question & rate confidence
   - **Evaluate**: View feedback & performance
4. **Session Complete** → View summary, strategy performance, insights
5. **Library** → View all sessions, continue learning

## API Integration Details

### Upload Flow
```javascript
// User pastes text → Generate chunks
const result = await generateChunks(content, title);
// Returns: { sessionId, chunks, totalChunks }

// Navigate to Learning Loop with sessionId
```

### Learning Loop Flow
```javascript
// Fetch session data
const session = await getSession(sessionId);

// For each chunk, submit response
const feedback = await submitResponse({
  sessionId,
  chunkId,
  goal,
  strategy,
  userAnswer,
  confidence
});
// Returns: { accuracy, calibration, correctPoints, missingPoints, feedback }
```

### Session Summary Flow
```javascript
// Get session summary
const summary = await getSessionSummary(sessionId);
// Returns: { stats, strategyPerformance, insight }
```

## Key Components

### ConfidenceSlider
- Range slider (0-100%)
- Visual feedback zones
- Used in Monitor phase

### SelectionCard
- Interactive cards for goals/strategies
- Visual selection state
- Click to select

### ProgressBar
- Shows chunk completion
- Used in Library and session header

### Card
- Reusable card container
- Hover effects
- Flexible layout

## Styling

- **Tailwind CSS** via inline classes
- Responsive design (mobile-first)
- Smooth animations
- Color-coded feedback:
  - Green: Correct/Accurate
  - Blue: Info/Neutral
  - Purple: Performance metrics
  - Yellow: Warnings/Calibration issues

## Next Steps (Future Enhancements)

1. Add authentication (user accounts)
2. Implement actual Insights page
3. Add file upload processing (PDF, DOCX)
4. Add spaced repetition scheduling
5. Implement social features (share progress)
6. Add mobile app version

## Testing

To test the complete flow:

1. Start backend and frontend
2. Navigate to `http://localhost:5173`
3. Click "Get Started"
4. Paste sample text (500+ characters)
5. Complete learning loop for all chunks
6. View session summary
7. Return to library to see saved session

## Notes

- Frontend uses Vite for fast development
- React 19 with hooks
- No external routing library (state-based navigation)
- All API calls go through centralized `api.js` service
- Proxy configured to forward `/api` to backend in development
- Production build served by backend from `frontend/dist`
