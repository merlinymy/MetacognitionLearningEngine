# Chunk Generation Prompt Design - Summary

## Quick Reference

### Problem Solved
**Old miniTeach**: Just introduced topics → users couldn't answer questions without reading original PDF
**New miniTeach**: Fully teaches concepts with examples → self-contained learning

### Key Files Created

1. **[prompts/chunkGenerationPrompt.js](prompts/chunkGenerationPrompt.js)**
   - System prompt with quality criteria and examples
   - User prompt generator function
   - Emphasizes self-contained teaching

2. **[services/geminiService.js](services/geminiService.js)**
   - `generateChunks()` - Transforms content into teaching chunks
   - `generateFeedback()` - AI-powered answer evaluation
   - Uses Gemini 1.5 Pro for generation, Flash for feedback

3. **[routes/api.js](routes/api.js)** (updated)
   - POST `/api/upload` - Starts async chunk generation
   - GET `/api/process/:id` - Polls generation status
   - POST `/api/chunk/submit` - Gets AI feedback (now uses Gemini)

4. **[.env.example](.env.example)**
   - Template for API key configuration

5. **[CHUNK_GENERATION_GUIDE.md](CHUNK_GENERATION_GUIDE.md)**
   - Complete documentation with examples and troubleshooting

### Prompt Design Philosophy

**Core Principle**: Each chunk must be a complete mini-lesson

✅ **Good miniTeach includes:**
- Full explanation of the concept (2-4 paragraphs)
- Concrete examples
- Common misconceptions addressed
- Sufficient detail to answer the reflection question
- Clear, accessible language

❌ **Bad miniTeach:**
- Brief introduction without teaching
- Assumes prior knowledge
- Missing examples
- Too vague or abstract

### Example Comparison

**BEFORE (Chunk #2 - miniTeach was too brief):**
```
miniTeach: "Two boxed primitive instances can have the same value
but different identities. When you use == on boxed primitives,
you perform an identity comparison."
```
❌ Doesn't explain WHY the comparator fails
❌ Missing the specific example
❌ User can't answer the question

**AFTER (Improved Chunk #2):**
```
miniTeach: "In Java, the == operator behaves differently for primitives vs objects.

For primitives (int, double), == compares values.
For boxed primitives (Integer, Double), == compares object identity.

Consider this broken comparator: (i, j) -> (i < j) ? -1 : (i == j ? 0 : 1)

When comparing new Integer(42) with new Integer(42):
- (i < j) auto-unboxes and correctly compares values ✓
- (i == j) compares object references, not values ✗
- Returns 1 (greater) instead of 0 (equal)

Fix: Use .equals() or unbox first: int iVal = i, jVal = j;"
```
✅ Fully explains the concept
✅ Includes the specific example
✅ Shows WHY it fails
✅ User CAN answer the question

### Metacognitive Integration

The prompt is designed to support the full learning loop:

**PLAN** → miniTeach provides learning material
**MONITOR** → Question tests understanding from miniTeach
**EVALUATE** → AI feedback compares answer to expectedPoints

Questions about strategies ("Did your strategy help?") and adjustments ("Next time, I'll:") promote:
- **Metacognitive monitoring** - Evaluating what works
- **Metacognitive control** - Planning future learning
- **Self-regulated learning** - Taking ownership

### Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# 3. Test upload
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.txt","content":"Educational content here..."}'

# 4. Check status with returned processingId
curl http://localhost:3000/api/process/proc-1699123456789
```

### Customization Points

**Adjust chunk count:**
```javascript
generateChunks(content, filename, { targetChunks: 10 })
```

**Change difficulty:**
```javascript
generateChunks(content, filename, { difficulty: 'advanced' })
```

**Focus on specific areas:**
```javascript
generateChunks(content, filename, {
  focusAreas: 'Focus on practical examples and edge cases'
})
```

**Switch models:**
```javascript
// In geminiService.js
model: "gemini-1.5-pro"      // Better reasoning
model: "gemini-1.5-flash"    // Faster, cheaper
```

### Next Steps

1. ✅ Prompt design complete
2. ✅ API endpoints implemented
3. ✅ Mock data updated with example
4. ✅ Documentation written
5. ⏳ Ready for testing with real Gemini API key
6. ⏳ Frontend integration (if needed)
7. ⏳ Production improvements (database, job queue, etc.)

### Testing Checklist

- [ ] Add GEMINI_API_KEY to .env
- [ ] Start server: `npm run dev:backend`
- [ ] Test upload endpoint with sample content
- [ ] Poll process endpoint until complete
- [ ] Verify chunk quality (miniTeach is self-contained?)
- [ ] Test chunk submit with student answer
- [ ] Verify feedback quality

See [CHUNK_GENERATION_GUIDE.md](CHUNK_GENERATION_GUIDE.md) for complete documentation.
