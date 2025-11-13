/**
 * API Endpoint Testing Script
 * Tests all endpoints for the Metacognition Learning Engine
 * Run with: node scripts/testEndpoints.js
 */

const BASE_URL = "http://localhost:3000/api";

// Sample test data
const sampleContent = `
Photosynthesis is the process by which plants, algae, and some bacteria convert light energy into chemical energy stored in glucose. This process occurs primarily in the chloroplasts of plant cells, specifically in structures called thylakoids and stroma.

The process has two main stages: light-dependent reactions and light-independent reactions (Calvin cycle). During the light-dependent reactions, which occur in the thylakoid membranes, chlorophyll absorbs light energy. This energy is used to split water molecules (H₂O) in a process called photolysis, releasing oxygen as a byproduct. The energy is also used to produce ATP (adenosine triphosphate) and NADPH, which are energy-carrying molecules.

The light-independent reactions, also known as the Calvin cycle, take place in the stroma of the chloroplast. These reactions use the ATP and NADPH produced in the light-dependent stage to convert carbon dioxide (CO₂) from the atmosphere into glucose (C₆H₁₂O₆). This process is called carbon fixation. The overall equation for photosynthesis is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂.

Photosynthesis is crucial for life on Earth as it produces oxygen and serves as the primary source of organic compounds and energy for most ecosystems. The rate of photosynthesis can be affected by several factors including light intensity, carbon dioxide concentration, temperature, and water availability.
`.trim();

let testSessionId = null;
let testChunkId = null;

// Helper function to make requests
async function makeRequest(method, endpoint, body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    console.log(`\n📤 ${method} ${endpoint}`);
    if (body) console.log("   Body:", JSON.stringify(body, null, 2));

    const response = await fetch(url, options);
    const data = await response.json();

    console.log(`   ✅ Status: ${response.status}`);
    console.log(
      "   Response:",
      JSON.stringify(data, null, 2).substring(0, 500) + "..."
    );

    return { status: response.status, data };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { status: 0, error: error.message };
  }
}

// Test functions
async function test1_GenerateChunks() {
  console.log("\n" + "=".repeat(60));
  console.log("TEST 1: Generate Chunks from Content");
  console.log("=".repeat(60));

  const result = await makeRequest("POST", "/chunks/generate", {
    content: sampleContent,
    title: "Photosynthesis Study Session",
  });

  if (result.status === 200) {
    testSessionId = result.data.sessionId;
    if (result.data.chunks && result.data.chunks.length > 0) {
      testChunkId = result.data.chunks[0].chunkId;
    }
    console.log(`\n   💾 Saved sessionId: ${testSessionId}`);
    console.log(`   💾 Saved chunkId: ${testChunkId}`);
  }

  return result.status === 200;
}

async function test2_GetAllSessions() {
  console.log("\n" + "=".repeat(60));
  console.log("TEST 2: Get All Sessions");
  console.log("=".repeat(60));

  const result = await makeRequest("GET", "/sessions");
  return result.status === 200;
}

async function test3_GetSpecificSession() {
  console.log("\n" + "=".repeat(60));
  console.log("TEST 3: Get Specific Session");
  console.log("=".repeat(60));

  if (!testSessionId) {
    console.log("   ⚠️  Skipping: No session ID available");
    return false;
  }

  const result = await makeRequest("GET", `/sessions/${testSessionId}`);
  return result.status === 200;
}

async function test4_SubmitResponse() {
  console.log("\n" + "=".repeat(60));
  console.log("TEST 4: Submit Chunk Response");
  console.log("=".repeat(60));

  if (!testSessionId || !testChunkId) {
    console.log("   ⚠️  Skipping: No session or chunk ID available");
    return false;
  }

  const result = await makeRequest("POST", "/responses", {
    sessionId: testSessionId,
    chunkId: testChunkId,
    goal: "explain",
    strategy: "self-explain",
    userAnswer:
      "Photosynthesis converts light energy into chemical energy stored in glucose. It happens in chloroplasts through light-dependent reactions that produce ATP and NADPH, and the Calvin cycle that uses CO2 to make glucose.",
    confidence: 75,
  });

  return result.status === 200;
}

async function test5_GetSessionResponses() {
  console.log("\n" + "=".repeat(60));
  console.log("TEST 5: Get Session Responses");
  console.log("=".repeat(60));

  if (!testSessionId) {
    console.log("   ⚠️  Skipping: No session ID available");
    return false;
  }

  const result = await makeRequest(
    "GET",
    `/responses/session/${testSessionId}`
  );
  return result.status === 200;
}

async function test6_GetSessionSummary() {
  console.log("\n" + "=".repeat(60));
  console.log("TEST 6: Get Session Summary");
  console.log("=".repeat(60));

  if (!testSessionId) {
    console.log("   ⚠️  Skipping: No session ID available");
    return false;
  }

  const result = await makeRequest("GET", `/sessions/${testSessionId}/summary`);
  return result.status === 200;
}

async function test7_CompleteChunk() {
  console.log("\n" + "=".repeat(60));
  console.log("TEST 7: Mark Chunk as Complete");
  console.log("=".repeat(60));

  if (!testSessionId || !testChunkId) {
    console.log("   ⚠️  Skipping: No session or chunk ID available");
    return false;
  }

  const result = await makeRequest(
    "PATCH",
    `/sessions/${testSessionId}/complete-chunk`,
    {
      chunkId: testChunkId,
    }
  );
  return result.status === 200;
}

async function test8_GetAllResponses() {
  console.log("\n" + "=".repeat(60));
  console.log("TEST 8: Get All Responses");
  console.log("=".repeat(60));

  const result = await makeRequest("GET", "/responses");
  return result.status === 200;
}

// Run all tests
async function runAllTests() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   Metacognition Learning Engine - API Endpoint Tests      ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log(`\n🌐 Base URL: ${BASE_URL}`);
  console.log("⚡ Starting tests...\n");

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  const tests = [
    { name: "Generate Chunks", fn: test1_GenerateChunks },
    { name: "Get All Sessions", fn: test2_GetAllSessions },
    { name: "Get Specific Session", fn: test3_GetSpecificSession },
    { name: "Submit Response", fn: test4_SubmitResponse },
    { name: "Get Session Responses", fn: test5_GetSessionResponses },
    { name: "Get Session Summary", fn: test6_GetSessionSummary },
    { name: "Complete Chunk", fn: test7_CompleteChunk },
    { name: "Get All Responses", fn: test8_GetAllResponses },
  ];

  for (const test of tests) {
    results.total++;
    const passed = await test.fn();
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay between tests
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total Tests:  ${results.total}`);
  console.log(`✅ Passed:     ${results.passed}`);
  console.log(`❌ Failed:     ${results.failed}`);
  console.log(
    `Success Rate: ${Math.round((results.passed / results.total) * 100)}%`
  );
  console.log("=".repeat(60) + "\n");

  if (results.failed === 0) {
    console.log("🎉 All tests passed! Your API is working correctly.\n");
  } else {
    console.log(
      "⚠️  Some tests failed. Check the output above for details.\n"
    );
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/sessions`);
    return response.status !== 0;
  } catch (error) {
    return false;
  }
}

// Main execution
(async () => {
  console.log("🔍 Checking if server is running...");
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log("❌ Server is not running on http://localhost:3000");
    console.log("📝 Please start the server with: npm run dev:backend");
    console.log("   Then run this script again.\n");
    process.exit(1);
  }

  console.log("✅ Server is running!\n");
  await runAllTests();
})();
