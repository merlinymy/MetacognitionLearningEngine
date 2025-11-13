// Appends additional mock docs to existing mock JSONs
// Adds: +200 sessions, +1000 responses
// Keeps the same quality as generateMockData.js

import fs from 'fs';
import path from 'path';

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(arr, rnd) {
  return arr[Math.floor(rnd() * arr.length)];
}

function range(n) {
  return Array.from({ length: n }, (_, i) => i);
}

function padHex(n, width) {
  const s = n.toString(16);
  return s.length >= width ? s.slice(0, width) : s.padStart(width, '0');
}

function objectIdHex(rnd) {
  const ts = Math.floor(Date.now() / 1000) - Math.floor(rnd() * 60 * 60 * 24 * 30);
  const tsHex = padHex(ts, 8);
  let rest = '';
  for (let i = 0; i < 16; i++) rest += Math.floor(rnd() * 16).toString(16);
  return tsHex + rest;
}

const CHUNK_TEMPLATES = [
  {
    topic: 'Java: Primitives vs Boxed Primitives',
    miniTeach:
      'Java has primitive types and boxed counterparts. Primitives are faster and have no identity; boxed types are objects and can be null. Dangers: identity comparison with ==, NullPointerException from unboxing null, performance overhead from boxing.',
    question:
      'List three dangers of boxed primitives in Java.',
    expectedPoints: [
      '== does identity comparison for boxed types',
      'Unboxing null throws NullPointerException',
      'Boxing/unboxing hurts performance'
    ]
  },
  {
    topic: 'Biology: Photosynthesis Basics',
    miniTeach:
      'Photosynthesis has light-dependent reactions (ATP, NADPH) and the Calvin cycle (fixes CO2 to sugar). Occurs in chloroplasts: thylakoids and stroma.',
    question: 'Name the two stages and outputs.',
    expectedPoints: [
      'Light reactions make ATP and NADPH',
      'Calvin cycle fixes CO2 into sugars',
      'Thylakoids vs stroma locations'
    ]
  },
  {
    topic: 'CS: Big-O Basics',
    miniTeach:
      'Big-O compares growth rates: O(1), O(log n), O(n), O(n log n), O(n^2). Abstracts constants to reason about scalability.',
    question: 'Give an O(n) and O(n log n) example.',
    expectedPoints: ['O(n): single pass', 'O(n log n): efficient sorts', 'n log n grows faster than n']
  },
  {
    topic: 'Statistics: Bayes Theorem',
    miniTeach:
      'Bayes: P(A|B) = P(B|A)P(A)/P(B). Posterior equals likelihood times prior over evidence.',
    question: 'State Bayes theorem terms.',
    expectedPoints: ['Prior P(A)', 'Likelihood P(B|A)', 'Evidence P(B)', 'Posterior P(A|B)']
  },
  {
    topic: 'Biology: Cellular Respiration',
    miniTeach:
      'Glycolysis, Krebs cycle, oxidative phosphorylation. ETC builds proton gradient, ATP synthase generates ATP.',
    question: 'Which stage yields most ATP?',
    expectedPoints: ['Oxidative phosphorylation', 'ETC and ATP synthase', 'Glycolysis/Krebs feed NADH/FADH2']
  }
];

function makeChunk(i, rnd) {
  const t = pick(CHUNK_TEMPLATES, rnd);
  return {
    chunkId: `chunk_${i}`,
    topic: t.topic,
    miniTeach: t.miniTeach,
    question: t.question,
    expectedPoints: [...t.expectedPoints],
    completed: false
  };
}

function generateSessions(rnd, count = 200) {
  const sessions = [];
  for (let i = 0; i < count; i++) {
    const _id = objectIdHex(rnd);
    const userId = rnd() < 0.7 ? 'anonymous' : `user_${1 + Math.floor(rnd() * 100)}`;
    const rawContent = CHUNK_TEMPLATES.map((t) => t.miniTeach).join(' ');
    const contentPreview = rawContent.slice(0, 100);
    const createdAt = new Date(Date.now() - Math.floor(rnd() * 1000 * 60 * 60 * 24 * 21));
    const chunkCount = 4 + Math.floor(rnd() * 5); // 4-8
    const chunks = range(chunkCount).map((ci) => makeChunk(ci, rnd));
    const status = rnd() < 0.7 ? 'completed' : 'in_progress';
    const chunksCompleted = status === 'completed' ? chunkCount : Math.floor(rnd() * chunkCount);
    for (let c = 0; c < chunksCompleted; c++) chunks[c].completed = true;
    const averageAccuracy = Math.round(45 + rnd() * 50);
    const averageConfidence = Math.round(40 + rnd() * 55);
    const sessionStats = {
      totalChunks: chunkCount,
      chunksCompleted,
      averageAccuracy,
      averageConfidence,
      calibrationError: averageConfidence - averageAccuracy,
      totalTimeSeconds: Math.round(chunkCount * (55 + rnd() * 95))
    };
    const completedAt = status === 'completed' ? new Date(createdAt.getTime() + sessionStats.totalTimeSeconds * 1000) : null;
    sessions.push({ _id, userId, rawContent, contentPreview, createdAt, completedAt, status, chunks, sessionStats });
  }
  return sessions;
}

function generateResponses(rnd, sessions, perSession = 5) {
  const goals = ['gist', 'explain', 'apply'];
  const strategies = ['self-explain', 'visualize', 'example'];
  const responses = [];
  for (const session of sessions) {
    const docsForSession = perSession;
    for (let i = 0; i < docsForSession; i++) {
      const chunk = session.chunks[i % session.chunks.length];
      const planTimestamp = new Date(new Date(session.createdAt).getTime() + Math.floor(rnd() * 10) * 1000);
      const monitorTimestamp = new Date(planTimestamp.getTime() + (20 + Math.floor(rnd() * 60)) * 1000);
      const evaluateTimestamp = new Date(monitorTimestamp.getTime() + (15 + Math.floor(rnd() * 45)) * 1000);
      const confidence = Math.round(35 + rnd() * 60);
      const accuracy = Math.max(0, Math.min(100, Math.round(30 + rnd() * 65)));
      const calibrationError = confidence - accuracy;
      const calibrationDirection = calibrationError > 5 ? 'overconfident' : calibrationError < -5 ? 'underconfident' : 'accurate';
      const expectedPoints = chunk.expectedPoints;
      const gotCount = Math.max(0, Math.min(expectedPoints.length, Math.floor(rnd() * (expectedPoints.length + 1))));
      const shuffled = [...expectedPoints].sort(() => rnd() - 0.5);
      const correctPoints = shuffled.slice(0, gotCount);
      const missingPoints = expectedPoints.filter((p) => !correctPoints.includes(p));
      const feedback = calibrationDirection === 'overconfident'
        ? 'Confidence exceeded accuracy; slow down and self-explain.'
        : calibrationDirection === 'underconfident'
        ? 'Accuracy exceeded confidence; trust your process.'
        : 'Confidence matches accuracy; keep it up.';
      responses.push({
        _id: objectIdHex(rnd),
        sessionId: session._id,
        userId: session.userId,
        chunkId: chunk.chunkId,
        chunkTopic: chunk.topic,
        goal: pick(goals, rnd),
        strategy: pick(strategies, rnd),
        planTimestamp,
        question: chunk.question,
        userAnswer: `${chunk.topic}: ${chunk.question}`,
        confidence,
        monitorTimestamp,
        expectedPoints,
        correctPoints,
        missingPoints,
        accuracy,
        calibrationError,
        calibrationDirection,
        feedback,
        strategyHelpful: rnd() > 0.35,
        evaluateTimestamp,
        createdAt: monitorTimestamp,
        timeSpentSeconds: Math.round((evaluateTimestamp - planTimestamp) / 1000)
      });
    }
  }
  return responses;
}

function main() {
  const outDir = path.join(process.cwd(), 'mock');
  const sessionsPath = path.join(outDir, 'mock_sessions.json');
  const responsesPath = path.join(outDir, 'mock_responses.json');
  const existingSessions = fs.existsSync(sessionsPath) ? JSON.parse(fs.readFileSync(sessionsPath, 'utf8')) : [];
  const existingResponses = fs.existsSync(responsesPath) ? JSON.parse(fs.readFileSync(responsesPath, 'utf8')) : [];

  const seed = process.env.SEED ? parseInt(process.env.SEED, 10) : 1337;
  const rnd = mulberry32(isNaN(seed) ? 1337 : seed);

  const newSessions = generateSessions(rnd, 200);
  // For 1000 responses across 200 sessions -> 5 per session on average
  const newResponses = generateResponses(rnd, newSessions, 5);

  // Merge and write
  const mergedSessions = existingSessions.concat(newSessions);
  const mergedResponses = existingResponses.concat(newResponses);

  // Ensure folder
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(sessionsPath, JSON.stringify(mergedSessions, null, 2));
  fs.writeFileSync(responsesPath, JSON.stringify(mergedResponses, null, 2));

  console.log(`Appended 200 sessions (total: ${mergedSessions.length})`);
  console.log(`Appended 1000 responses (total: ${mergedResponses.length})`);
}

if (import.meta.url === `file://${path.join(process.cwd(), 'scripts', 'extendMockData.js')}`) {
  main();
}

