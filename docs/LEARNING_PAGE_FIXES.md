# Learning Page Fixes

## Issue: Chunk Content Not Displaying

The Learning page was not showing chunk content because it was using incorrect field names and data structures from the backend.

## Root Causes

### 1. Backend Response Structure Mismatch
**Backend returns** (GET /api/chunks/:sessionId/:chunkId):
```javascript
{
  sessionId: "...",
  chunk: {
    chunkId: "chunk_0",
    topic: "Topic Name",
    miniTeach: "Brief explanation...",
    question: "What are...",
    expectedPoints: ["point1", "point2"],
    completed: false
  }
}
```

**Frontend expected**: Direct chunk object (not wrapped)

### 2. Field Name Mismatches
| Frontend Expected | Backend Provides |
|------------------|------------------|
| `content` | `miniTeach` |
| `strategies` (array in chunk) | Not in chunk (should be predefined) |
| `isCompleted` | `completed` |

### 3. Missing Strategies
Strategies are not per-chunk, they're predefined options that users choose from.

## Fixes Applied

### 1. Extract Chunk from Response Wrapper
**File**: [Learning.jsx:82](frontend/src/pages/Learning.jsx#L82)

```javascript
// Before
setCurrentChunk(chunkData);

// After
setCurrentChunk(chunkData.chunk);
```

Also fixed in [Learning.jsx:161](frontend/src/pages/Learning.jsx#L161) for loading next chunks.

### 2. Use Correct Field Names
**File**: [Learning.jsx:224](frontend/src/pages/Learning.jsx#L224)

```javascript
// Before
{currentChunk?.content}

// After
{currentChunk?.miniTeach}
```

**File**: [Learning.jsx:66](frontend/src/pages/Learning.jsx#L66)

```javascript
// Before
const incompleteIndex = sessionData.chunks.findIndex(
  (c) => !c.isCompleted,
);

// After
const incompleteIndex = sessionData.chunks.findIndex(
  (c) => !c.completed,
);
```

### 3. Added Predefined Strategies
**File**: [Learning.jsx:28-34](frontend/src/pages/Learning.jsx#L28-L34)

```javascript
const STRATEGIES = [
  "Self-explain (teach it back)",
  "Visualize (create mental images)",
  "Work an example",
  "Connect to prior knowledge",
  "Ask questions about it",
];
```

**File**: [Learning.jsx:278](frontend/src/pages/Learning.jsx#L278)

```javascript
// Before
{currentChunk?.strategies.map((strategy) => (

// After
{STRATEGIES.map((strategy) => (
```

## Chunk Data Structure

Chunks in the database have this structure:

```javascript
{
  chunkId: "chunk_0",           // Unique identifier
  topic: "Topic Name",          // Short title (2-5 words)
  miniTeach: "...",             // Content to display (100-150 words)
  question: "...",              // Question to test understanding
  expectedPoints: [...],         // Key points for evaluation
  completed: false              // Completion status
}
```

## Strategy Design

Based on the design document, strategies are:
- **Predefined** (not per-chunk)
- **User-selected** during the Monitor phase
- **Tracked** for performance analysis
- Common examples: "Self-explain", "Visualize", "Work an example"

## Testing Checklist

- [x] Chunk content displays in Plan phase
- [x] Question displays in Monitor phase
- [x] Strategies list shows 5 predefined options
- [x] Chunk data loads correctly from backend
- [x] Next chunk navigation works
- [x] Completed chunks are properly identified
- [x] No console errors
- [x] Hot reload working

## Related Files

- [frontend/src/pages/Learning.jsx](frontend/src/pages/Learning.jsx) - Main component
- [routes/chunkRoute.js](routes/chunkRoute.js) - Backend chunk API
- [routes/sessionRoute.js](routes/sessionRoute.js) - Backend session API
- [services/llm/geminiService.js](services/llm/geminiService.js) - Chunk generation

## Status

✅ All issues resolved
✅ Chunk content now displays correctly
✅ Strategies work with predefined list
✅ Field names match backend structure
✅ No build errors
