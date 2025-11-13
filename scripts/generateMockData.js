// Generates mock data for `sessions` and `responses` collections per UNIVERSITY_PROJECT_DESIGN.md
// Output: mock/mock_sessions.json and mock/mock_responses.json

import fs from 'fs';
import path from 'path';

// Simple seeded RNG for reproducibility
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

// Generate a 24-char hex string resembling a Mongo ObjectId
function objectIdHex(rnd) {
  // Timestamp component (seconds)
  const ts = Math.floor(Date.now() / 1000) - Math.floor(rnd() * 60 * 60 * 24 * 30);
  const tsHex = padHex(ts, 8);
  // Remaining 16 hex chars random
  let rest = '';
  for (let i = 0; i < 16; i++) {
    rest += Math.floor(rnd() * 16).toString(16);
  }
  return tsHex + rest;
}

function lorem(rnd, sentences = 2) {
  const fragments = [
    'Photosynthesis converts light to chemical energy',
    'Cellular respiration produces ATP via glycolysis and the Krebs cycle',
    'Neurons communicate through electrical and chemical signals',
    'Algorithms can be analyzed by time and space complexity',
    'Recursion solves problems by reducing them to subproblems',
    'Osmosis moves water across semipermeable membranes',
    'Supply and demand determine market equilibrium',
    'Bayes theorem updates probabilities based on evidence',
    'The heart pumps blood through systemic and pulmonary circuits',
    'Entropy measures system disorder in thermodynamics'
  ];
  return range(sentences)
    .map(() => pick(fragments, rnd) + '.')
    .join(' ');
}

// Curated, self-contained chunk templates for higher-quality data
const CHUNK_TEMPLATES = [
  {
    topic: 'Java: Primitives vs Boxed Primitives',
    miniTeach:
      'Java has primitive types (int, long, double, boolean) and their boxed counterparts (Integer, Long, Double, Boolean). Primitives hold raw values and are faster; boxed types are objects with identity and can be null. Beware: == compares identity for objects, not value; auto-unboxing can throw NullPointerException when a null is unboxed; repeated boxing/unboxing harms performance.',
    question:
      'List three practical dangers of using boxed primitives where primitives would suffice in Java.',
    expectedPoints: [
      '== compares identity on boxed values (not numeric equality)',
      'NullPointerException risk from auto-unboxing null',
      'Performance overhead due to boxing/unboxing and allocations'
    ]
  },
  {
    topic: 'Java: Comparator Pitfall with ==',
    miniTeach:
      'A comparator like (i, j) -> (i < j) ? -1 : (i == j ? 0 : 1) fails for Integer inputs. i < j auto-unboxes and compares values, but i == j compares object identity for boxed Integers. Two distinct Integer(42) objects are not == even though their values are equal. Use equals() or unbox first and compare primitives.',
    question:
      'Explain why a comparator using (i == j) fails for Integer values and how to fix it.',
    expectedPoints: [
      '== on Integer compares object identity, not value',
      'Two different Integer(42) are not identical objects',
      'Fix by equals() or unbox to int before comparing'
    ]
  },
  {
    topic: 'Biology: Photosynthesis Basics',
    miniTeach:
      'Photosynthesis converts light energy into chemical energy (glucose) in chloroplasts. It has light-dependent reactions in thylakoids that produce ATP and NADPH, and the Calvin cycle in the stroma that fixes CO2 into sugars. Overall: 6CO2 + 6H2O -> C6H12O6 + 6O2.',
    question: 'State the two stages of photosynthesis and their roles.',
    expectedPoints: [
      'Light-dependent reactions generate ATP and NADPH',
      'Calvin cycle fixes CO2 into sugars',
      'Occurs in thylakoids (light) and stroma (Calvin)'
    ]
  },
  {
    topic: 'Biology: Cellular Respiration',
    miniTeach:
      'Cellular respiration extracts energy from glucose via glycolysis, the citric acid (Krebs) cycle, and oxidative phosphorylation. Electrons from NADH/FADH2 drive the electron transport chain to power ATP synthesis by ATP synthase.',
    question: 'Name the three main stages of cellular respiration and the ATP-yielding step.',
    expectedPoints: [
      'Glycolysis, Krebs cycle, oxidative phosphorylation',
      'ATP primarily generated in oxidative phosphorylation',
      'ETC creates proton gradient used by ATP synthase'
    ]
  },
  {
    topic: 'CS: Big-O Complexity Basics',
    miniTeach:
      'Big-O notation characterizes an algorithm’s growth rate: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) near-linear, O(n^2) quadratic. It abstracts constant factors to compare scalability.',
    question: 'Contrast O(n) vs O(n log n) with typical examples.',
    expectedPoints: [
      'O(n): single pass (e.g., find max)',
      'O(n log n): efficient sorts (merge/quick sort average)',
      'As n grows, n log n outpaces n by a log factor'
    ]
  },
  {
    topic: 'Statistics: Bayes Theorem',
    miniTeach:
      "Bayes theorem updates belief: P(A|B) = P(B|A)P(A)/P(B). It combines prior probability with likelihood to compute posterior probability after observing evidence B.",
    question: 'State Bayes theorem and its components.',
    expectedPoints: [
      'Posterior = Likelihood × Prior / Evidence',
      'Identify prior P(A), likelihood P(B|A), evidence P(B)',
      'Computes P(A|B) after observing B'
    ]
  },
  {
    topic: 'Physics: Entropy Concept',
    miniTeach:
      'Entropy quantifies disorder or the number of microstates consistent with a macrostate. The second law states entropy of an isolated system tends to increase.',
    question: 'Explain entropy and the second law in simple terms.',
    expectedPoints: [
      'Entropy measures disorder/microstate count',
      'Isolated system entropy does not decrease',
      'Spontaneous processes increase total entropy'
    ]
  },
  {
    topic: 'Economics: Supply and Demand',
    miniTeach:
      'Market equilibrium occurs where supply equals demand. Price above equilibrium creates surplus (downward pressure); below equilibrium creates shortage (upward pressure).',
    question: 'What happens when price is above equilibrium?',
    expectedPoints: [
      'Quantity supplied > quantity demanded (surplus)',
      'Downward pressure on price',
      'Market moves toward equilibrium'
    ]
  },
  {
    topic: 'Biology: Osmosis',
    miniTeach:
      'Osmosis is diffusion of water across a semipermeable membrane from low solute concentration to high, seeking equal water potential.',
    question: 'Define osmosis and direction of water flow.',
    expectedPoints: [
      'Water moves across semipermeable membrane',
      'From low solute (high water) to high solute',
      'Driven by water potential difference'
    ]
  },
  {
    topic: 'CS: Recursion Basics',
    miniTeach:
      'Recursion solves a problem by solving smaller instances. Requires a base case and a step reducing the problem size. Beware of stack overflows and ensure progress toward the base case.',
    question: 'What two parts must every recursive function have?',
    expectedPoints: [
      'A base case that stops recursion',
      'A recursive step that reduces the problem',
      'Progress toward the base case to terminate'
    ]
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
    const id = objectIdHex(rnd);
    const userId = rnd() < 0.8 ? 'anonymous' : `user_${1 + Math.floor(rnd() * 50)}`;
    const rawContent = lorem(rnd, 8 + Math.floor(rnd() * 6));
    const contentPreview = rawContent.slice(0, 100);
    const createdAt = new Date(Date.now() - Math.floor(rnd() * 1000 * 60 * 60 * 24 * 14)); // last 14 days
    const status = rnd() < 0.6 ? 'completed' : 'in_progress';
    const chunkCount = 5 + Math.floor(rnd() * 4); // 5-8
    const chunks = range(chunkCount).map((ci) => makeChunk(ci, rnd));

    // Simulate completion
    const chunksCompleted = status === 'completed' ? chunkCount : Math.floor(rnd() * chunkCount);
    for (let c = 0; c < chunksCompleted; c++) chunks[c].completed = true;

    const sessionStats = {
      totalChunks: chunkCount,
      chunksCompleted,
      averageAccuracy: Math.round(50 + rnd() * 50),
      averageConfidence: Math.round(40 + rnd() * 60),
      calibrationError: 0, // compute below
      totalTimeSeconds: Math.round(chunkCount * (60 + rnd() * 90))
    };
    sessionStats.calibrationError = sessionStats.averageConfidence - sessionStats.averageAccuracy;

    const completedAt = status === 'completed' ? new Date(createdAt.getTime() + sessionStats.totalTimeSeconds * 1000) : null;

    sessions.push({
      _id: id,
      userId,
      rawContent,
      contentPreview,
      createdAt,
      completedAt,
      status,
      chunks,
      sessionStats
    });
  }
  return sessions;
}

function generateResponses(rnd, sessions) {
  const goals = ['gist', 'explain', 'apply'];
  const strategies = ['self-explain', 'visualize', 'example'];
  const responses = [];

  for (const session of sessions) {
    const docsForSession = 6; // target ~6 responses per session per design doc
    for (let i = 0; i < docsForSession; i++) {
      const chunk = session.chunks[i % session.chunks.length];
      const planTimestamp = new Date(new Date(session.createdAt).getTime() + Math.floor(rnd() * 10) * 1000);
      const monitorTimestamp = new Date(planTimestamp.getTime() + (20 + Math.floor(rnd() * 60)) * 1000);
      const evaluateTimestamp = new Date(monitorTimestamp.getTime() + (15 + Math.floor(rnd() * 45)) * 1000);

      const confidence = Math.round(40 + rnd() * 60); // 40-100
      const accuracy = Math.max(0, Math.min(100, Math.round(35 + rnd() * 65))); // 35-100
      const calibrationError = confidence - accuracy;
      const calibrationDirection = calibrationError > 5 ? 'overconfident' : calibrationError < -5 ? 'underconfident' : 'accurate';

      // Correct/missing points derived from expected
      const expectedPoints = chunk.expectedPoints;
      const gotCount = Math.max(0, Math.min(expectedPoints.length, Math.floor(rnd() * (expectedPoints.length + 1))));
      const shuffled = [...expectedPoints].sort(() => rnd() - 0.5);
      const correctPoints = shuffled.slice(0, gotCount);
      const missingPoints = expectedPoints.filter((p) => !correctPoints.includes(p));

      const feedback = calibrationDirection === 'overconfident'
        ? 'You were more confident than accurate; slow down and self-explain.'
        : calibrationDirection === 'underconfident'
        ? 'Nice work. Your accuracy exceeded confidence; trust your process.'
        : 'Your confidence is well-calibrated. Keep using effective strategies.';

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
        userAnswer: lorem(rnd, 2),
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
  const seed = process.env.SEED ? parseInt(process.env.SEED, 10) : 42;
  const rnd = mulberry32(isNaN(seed) ? 42 : seed);

  const sessions = generateSessions(rnd, 200);
  const responses = generateResponses(rnd, sessions);

  // Reconcile session stats with generated responses for higher fidelity
  const bySession = new Map();
  for (const r of responses) {
    if (!bySession.has(r.sessionId)) bySession.set(r.sessionId, []);
    bySession.get(r.sessionId).push(r);
  }
  for (const s of sessions) {
    const rs = bySession.get(s._id) || [];
    if (rs.length) {
      const avgAcc = Math.round(rs.reduce((a, b) => a + b.accuracy, 0) / rs.length);
      const avgConf = Math.round(rs.reduce((a, b) => a + b.confidence, 0) / rs.length);
      s.sessionStats.averageAccuracy = avgAcc;
      s.sessionStats.averageConfidence = avgConf;
      s.sessionStats.calibrationError = avgConf - avgAcc;
      s.sessionStats.chunksCompleted = Math.min(s.sessionStats.totalChunks, rs.length);
      if (s.sessionStats.chunksCompleted >= s.sessionStats.totalChunks) s.status = 'completed';
    }
  }

  // Ensure folder exists
  const outDir = path.join(process.cwd(), 'mock');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Write pretty JSON
  fs.writeFileSync(path.join(outDir, 'mock_sessions.json'), JSON.stringify(sessions, null, 2));
  fs.writeFileSync(path.join(outDir, 'mock_responses.json'), JSON.stringify(responses, null, 2));

  console.log(`Generated ${sessions.length} sessions -> mock/mock_sessions.json`);
  console.log(`Generated ${responses.length} responses -> mock/mock_responses.json`);
}

// Execute when run directly (ESM)
const isDirect = import.meta.url === `file://${path.join(process.cwd(), 'scripts', 'generateMockData.js')}`;
if (isDirect) main();
