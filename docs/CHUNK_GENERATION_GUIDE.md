# Chunk Generation System Guide

## Overview

This system uses Google Gemini to transform uploaded educational content into **self-contained learning chunks** that support metacognitive learning through the Plan-Monitor-Evaluate framework.

## The Problem We Solved

### Old Approach (BAD) ❌
- **miniTeach** only introduced topics without teaching them
- Assumed users already read the source material
- Questions couldn't be answered from miniTeach alone
- Created frustrating gaps in learning flow

**Example of BAD miniTeach:**
```javascript
{
  miniTeach: "Two boxed primitive instances can have the same value but different identities.",
  question: "Why does this comparator fail: (i, j) -> (i < j) ? -1 : (i == j ? 0 : 1)?"
  // User can't answer this without reading the original PDF!
}
```

### New Approach (GOOD) ✅
- **miniTeach** fully teaches the concept with examples
- Self-contained - users can answer questions using only the miniTeach
- Progressive learning without requiring source material
- Enables true self-explanation and metacognition

**Example of GOOD miniTeach:**
```javascript
{
  miniTeach: `In Java, the == operator behaves differently for primitives vs objects.

  For primitives (int, double), == compares values.
  For boxed primitives (Integer, Double), == compares object identity.

  Consider this broken comparator: (i, j) -> (i < j) ? -1 : (i == j ? 0 : 1)

  When comparing new Integer(42) with new Integer(42):
  - (i < j) auto-unboxes and correctly compares values ✓
  - (i == j) compares object references, not values ✗
  - Returns 1 (greater) instead of 0 (equal)

  Fix: Use .equals() or unbox first: int iVal = i, jVal = j;`,
  question: "Why does this comparator fail when comparing two Integer(42) objects?",
  // Now the user CAN answer using the miniTeach!
}
```

## Setup

### 1. Install Dependencies
```bash
npm install @google/genai dotenv
```

### 2. Get a Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. Copy the key

### 3. Configure Environment
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your key
GEMINI_API_KEY=your_actual_api_key_here
```

## How It Works

### Architecture

```
User uploads PDF → /api/upload
                    ↓
         Background job starts
                    ↓
    Extract text from PDF content
                    ↓
    Send to Gemini with specialized prompt
                    ↓
    Gemini generates 8 self-contained chunks
                    ↓
    Store in global.processingJobs[id]
                    ↓
    Frontend polls /api/process/:id
                    ↓
    Returns generated chunks when complete
```

### Chunk Structure

Each generated chunk has:

```javascript
{
  id: number,                    // Unique chunk ID
  topic: "Clear topic name",     // Specific concept being taught

  miniTeach: "2-4 paragraphs that:
    - Fully explain the concept
    - Include concrete examples
    - Address common misconceptions
    - Provide enough detail to answer the question
    - Use accessible language",

  question: "Reflection question that:
    - Tests understanding of miniTeach
    - Requires explanation, not recall
    - Can be answered using ONLY miniTeach",

  expectedPoints: [
    "Key concept 1",
    "Key concept 2",
    "Key concept 3"
  ],

  codeExample: "Optional code sample",  // If applicable
  difficulty: "Basic|Intermediate|Advanced"
}
```

## The Prompt System

### System Prompt
Located in [`prompts/chunkGenerationPrompt.js`](prompts/chunkGenerationPrompt.js)

Defines:
- Core principles (self-contained teaching, metacognitive design)
- Quality criteria (what makes a good vs bad chunk)
- Chunk structure specification
- Examples of excellent chunks

### User Prompt
Generated dynamically with:
- Source content
- Filename
- Target number of chunks (default: 8)
- Difficulty level
- Focus areas (optional)

## API Endpoints

### POST `/api/upload`
Upload content for chunk generation.

**Request:**
```javascript
{
  filename: "effective-java-item61.pdf",
  content: "Full text content..."
}
```

**Response:**
```javascript
{
  success: true,
  message: "File upload started",
  processingId: "proc-1699123456789"
}
```

### GET `/api/process/:id`
Poll for chunk generation status.

**Response (processing):**
```javascript
{
  status: "processing",
  currentStep: 2,
  totalSteps: 4,
  message: "Breaking into learnable chunks..."
}
```

**Response (complete):**
```javascript
{
  status: "complete",
  material: {
    materialId: "...",
    title: "...",
    chunks: [/* 8 chunks */]
  }
}
```

### POST `/api/chunk/submit`
Submit student answer and get AI feedback.

**Request:**
```javascript
{
  chunkId: 2,
  materialId: "ej61-primitives",
  explanation: "Student's answer...",
  confidence: 75,
  goal: "explain",
  strategy: "self-explain",
  muddiestPoint: "Optional confusion..."
}
```

**Response:**
```javascript
{
  feedback: {
    correctPoints: ["Point 1 they got", "Point 2 they got"],
    missingPoints: ["Point they missed"],
    accuracy: 80,
    encouragement: "Great understanding of...",
    codeExample: "..." // If applicable
  },
  accuracy: 80,
  calibration: -5  // confidence - accuracy
}
```

## Metacognitive Features

### Strategy Tracking
The system logs which learning strategies users employ:
- Self-explain
- Draw a diagram
- Work an example

### Calibration Measurement
Compares student confidence vs actual accuracy to improve metacognitive awareness.

### "Did your strategy help?"
Tracks strategy effectiveness over time. Future enhancement: recommend strategies based on past performance.

### "Next time, I'll..."
Encourages metacognitive control - planning future learning based on current experience.

## Example Usage

```javascript
// In your frontend upload handler
const response = await fetch('/api/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filename: 'java-chapter3.pdf',
    content: pdfTextContent
  })
});

const { processingId } = await response.json();

// Poll for completion
const pollInterval = setInterval(async () => {
  const status = await fetch(`/api/process/${processingId}`);
  const data = await status.json();

  if (data.status === 'complete') {
    clearInterval(pollInterval);
    startLearningSession(data.material);
  } else {
    updateProgress(data.currentStep, data.message);
  }
}, 1000);
```

## Customization

### Adjust Chunk Count
```javascript
const chunks = await generateChunks(content, filename, {
  targetChunks: 10,  // Generate 10 instead of 8
  difficulty: 'advanced',
  focusAreas: 'Focus on performance implications'
});
```

### Modify Prompt
Edit [`prompts/chunkGenerationPrompt.js`](prompts/chunkGenerationPrompt.js) to:
- Change chunk structure
- Adjust quality criteria
- Add domain-specific guidance
- Include different examples

### Switch Models
In [`services/geminiService.js`](services/geminiService.js):
```javascript
// For chunk generation (better reasoning)
model: "gemini-1.5-pro"

// For feedback (faster)
model: "gemini-1.5-flash"

// For longer content
model: "gemini-1.5-pro"  // with higher maxOutputTokens
```

## Testing

### Manual Test
```bash
# Start the server
npm run dev:backend

# In another terminal, test the upload
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test.txt",
    "content": "Your educational content here..."
  }'

# Use the returned processingId to check status
curl http://localhost:3000/api/process/proc-1699123456789
```

### Test Feedback Generation
```bash
curl -X POST http://localhost:3000/api/chunk/submit \
  -H "Content-Type: application/json" \
  -d '{
    "chunkId": 2,
    "materialId": "ej61-primitives-vs-boxed",
    "explanation": "The == operator compares object identity, not values...",
    "confidence": 80,
    "goal": "explain",
    "strategy": "self-explain"
  }'
```

## Production Considerations

### Current Implementation (MVP)
- Uses `global.processingJobs` for job storage
- In-memory only (lost on server restart)
- No persistence

### Production Improvements
1. **Job Queue**: Use Bull, BullMQ, or AWS SQS
2. **Database**: Store materials and sessions in PostgreSQL/MongoDB
3. **Caching**: Cache generated chunks with Redis
4. **Rate Limiting**: Limit API calls per user
5. **Error Handling**: Retry failed generations, better error messages
6. **Monitoring**: Track generation quality, success rates
7. **User Accounts**: Associate materials with users

## Troubleshooting

### "Failed to generate chunks"
- Check GEMINI_API_KEY is set correctly
- Verify API key has sufficient quota
- Check content isn't too large (max ~800K tokens for gemini-1.5-pro)

### JSON Parse Error
- Gemini occasionally returns malformed JSON
- The service automatically strips markdown code blocks
- If persistent, adjust the prompt to emphasize "valid JSON only"

### Poor Quality Chunks
- miniTeach too brief? Adjust prompt to require more detail
- Questions unanswerable? Add more examples to system prompt
- Modify temperature (lower = more focused, higher = more creative)

## Future Enhancements

- [ ] PDF parsing integration (currently assumes text is extracted)
- [ ] Multi-language support
- [ ] Adaptive difficulty based on user performance
- [ ] Strategy recommendations based on historical data
- [ ] Spaced repetition scheduling
- [ ] Export study materials
- [ ] Collaborative learning features

## See Also

- [Main README](README.md)
- [UI/UX Design Doc](UI_UX_DESIGN_DOC.md)
- [Setup Guide](SETUP.md)
- [Google Gemini Docs](https://ai.google.dev/docs)
