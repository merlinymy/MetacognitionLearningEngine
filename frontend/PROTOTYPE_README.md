# UI/UX Prototype - Metacognition Learning Engine

This is an interactive prototype showcasing the complete user interface and experience for the Metacognition Learning Engine.

## Features Implemented

### ✅ Complete User Flow
1. **Landing Page** - Hero section with value proposition and feature overview
2. **Upload Page** - Drag-and-drop file upload or text paste interface
3. **Processing Page** - Animated LLM processing visualization
4. **Library/Dashboard** - Material cards with progress tracking and status badges
5. **Learning Loop** - Complete 90-second metacognitive cycle:
   - Plan phase (goal + strategy selection)
   - Monitor phase (question, explanation, confidence, muddiest point)
   - Evaluate phase (AI feedback, strategy evaluation, adjustments)
6. **Session Complete** - Celebration screen with stats and insights
7. **Insights Dashboard** - Learning patterns, calibration, strategy performance

### 🎨 Design System
- Reusable components (Button, Card, SelectionCard, ProgressBar, ConfidenceSlider)
- Tailwind CSS for rapid prototyping
- Consistent color palette and spacing
- Smooth animations and transitions

### 🎯 Interactive Elements
- Full state management between screens
- Progress tracking through chunks
- Real-time confidence slider
- Selection cards with visual feedback
- Animated processing states

## Running the Prototype

```bash
cd frontend
npm install  # if not already installed
npm run dev
```

Then open your browser to the displayed URL (typically http://localhost:5173)

## Navigation Flow

```
Landing Page
    ↓ Get Started
Upload Page
    ↓ Upload file/text
Processing Page (auto-advances)
    ↓
Library Page
    ↓ Continue or Select Material
Learning Loop (Plan → Monitor → Evaluate) × N chunks
    ↓ Complete Session
Session Complete
    ↓ View Insights
Insights Dashboard
```

### Try the Demo Flow
Click "Try a Demo Loop" on the landing page to jump directly into a learning session!

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **CSS Animations** - Smooth transitions and micro-interactions

## Design Principles Applied

1. **90-Second Constraint** - Each learning loop phase is designed to be quick and focused
2. **Progressive Disclosure** - Information revealed step-by-step to reduce cognitive load
3. **Visual Feedback** - Immediate response to all user interactions
4. **Calm Focus** - Minimal distractions during learning loops
5. **Celebration** - Positive reinforcement for completion

## Prototype Limitations

This is a **frontend-only prototype** with:
- Mock data (not connected to backend)
- Simulated LLM processing
- Static content and questions
- No data persistence

For full functionality, this needs to be connected to:
- Backend API for content processing
- LLM integration for chunking and question generation
- Database for user progress tracking
- Authentication system

## Next Steps

1. **User Testing** - Gather feedback on the flow and interactions
2. **Backend Integration** - Connect to Express API and LLM services
3. **Data Persistence** - Add database for user content and progress
4. **Advanced Features** - Spaced repetition, export capabilities, social features

## Customization

Colors and styling can be adjusted in:
- `tailwind.config.js` - Design tokens
- `src/index.css` - Global styles
- Individual component files - Component-specific styles

---

**Built with learning science research in mind** 🧠
