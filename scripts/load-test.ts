import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const TEST_TOKEN = process.env.TEST_TOKEN || "";

if (!CONVEX_URL) {
  console.error("NEXT_PUBLIC_CONVEX_URL not set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function testTokenValidation(token: string, iterations: number = 10) {
  console.log(`\n🔐 Testing Token Validation (${iterations} requests)...`);
  const times: number[] = [];
  let errors = 0;

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    try {
      const result = await client.query(api.testTokens.validateToken, { token });
      const duration = Date.now() - start;
      times.push(duration);
      if (i === 0) console.log(`  First request: ${duration}ms - Valid: ${result.valid}`);
    } catch (error) {
      errors++;
      console.error(`  Request ${i + 1} failed:`, error);
    }
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  console.log(`  ✅ Avg: ${avg.toFixed(2)}ms | Min: ${min}ms | Max: ${max}ms | Errors: ${errors}`);
  return { avg, min, max, errors };
}

async function testScoring(iterations: number = 50) {
  console.log(`\n📊 Testing Scoring Calculations (${iterations} iterations)...`);
  const times: number[] = [];

  const testRubric = {
    clarity: 20,
    constraints: 18,
    iteration: 22,
    tool: 19
  };

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    
    const total = Math.max(0, Math.min(25, testRubric.clarity)) +
                  Math.max(0, Math.min(25, testRubric.constraints)) +
                  Math.max(0, Math.min(25, testRubric.iteration)) +
                  Math.max(0, Math.min(25, testRubric.tool));
    const promptScore = Math.round(total);
    
    const c = Math.max(0, Math.min(25, testRubric.clarity));
    const k = Math.max(0, Math.min(25, testRubric.constraints));
    const i = Math.max(0, Math.min(25, testRubric.iteration));
    const t = Math.max(0, Math.min(25, testRubric.tool));

    const skills = {
      generative_ai: Math.round((c * 0.5 + i * 0.5) * 4),
      agentic_ai: Math.round((i * 0.6 + t * 0.4) * 4),
      synthetic_ai: Math.round((k * 0.5 + t * 0.5) * 4),
      coding: Math.round((k * 0.5 + t * 0.5) * 4),
      agi_readiness: Math.round((c * 0.25 + k * 0.25 + i * 0.25 + t * 0.25) * 4),
      communication: Math.round((c * 0.8 + i * 0.2) * 4),
      logic: Math.round((k * 0.6 + i * 0.4) * 4),
      planning: Math.round((k * 0.7 + t * 0.3) * 4),
      analysis: Math.round((t * 0.7 + c * 0.3) * 4),
      creativity: Math.round((i * 0.7 + c * 0.3) * 4),
      collaboration: Math.round((c * 0.5 + i * 0.5) * 4)
    };

    const duration = Date.now() - start;
    times.push(duration);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  console.log(`  ✅ Avg: ${avg.toFixed(4)}ms | Min: ${min}ms | Max: ${max}ms`);
  return { avg, min, max };
}

async function testConcurrentTokenValidation(token: string, concurrent: number = 5) {
  console.log(`\n⚡ Testing Concurrent Token Validation (${concurrent} parallel requests)...`);
  const start = Date.now();
  
  const promises = Array(concurrent).fill(null).map(() =>
    client.query(api.testTokens.validateToken, { token })
  );

  try {
    const results = await Promise.all(promises);
    const duration = Date.now() - start;
    const allValid = results.every(r => r.valid);
    console.log(`  ✅ Completed in ${duration}ms | All valid: ${allValid}`);
    return { duration, allValid };
  } catch (error) {
    console.error(`  ❌ Failed:`, error);
    return { duration: Date.now() - start, allValid: false };
  }
}

async function testAssessmentScoring(iterations: number = 20) {
  console.log(`\n📝 Testing Assessment Scoring (${iterations} iterations)...`);
  const times: number[] = [];

  const questions = Array(12).fill(null).map((_, i) => ({
    type: "multiple-choice" as const,
    primaryDimension: (["clarity", "constraints", "iteration", "tool"] as const)[i % 4],
    options: [
      { text: "Option 1", quality: "good" as const },
      { text: "Option 2", quality: "almost" as const },
      { text: "Option 3", quality: "bad" as const }
    ]
  }));

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    
    const answers: Record<number, number> = {};
    questions.forEach((_, idx) => {
      answers[idx] = Math.floor(Math.random() * 3);
    });

    const rubric = { clarity: 0, constraints: 0, iteration: 0, tool: 0 };
    const dimensionCounts = { clarity: 0, constraints: 0, iteration: 0, tool: 0 };

    questions.forEach((q, idx) => {
      const selectedIndex = answers[idx];
      const selectedOption = q.options[selectedIndex];
      if (selectedOption) {
        let score = 0;
        if (selectedOption.quality === "good") score = 25;
        else if (selectedOption.quality === "almost") score = 13;
        else score = 5;

        rubric[q.primaryDimension] += score;
        dimensionCounts[q.primaryDimension]++;
      }
    });

    (Object.keys(rubric) as Array<keyof typeof rubric>).forEach((dim) => {
      if (dimensionCounts[dim] > 0) {
        rubric[dim] = Math.round(rubric[dim] / dimensionCounts[dim]);
      }
    });

    const promptScore = Math.round(
      Math.max(0, Math.min(25, rubric.clarity)) +
      Math.max(0, Math.min(25, rubric.constraints)) +
      Math.max(0, Math.min(25, rubric.iteration)) +
      Math.max(0, Math.min(25, rubric.tool))
    );

    const duration = Date.now() - start;
    times.push(duration);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  console.log(`  ✅ Avg: ${avg.toFixed(4)}ms | Min: ${min}ms | Max: ${max}ms`);
  return { avg, min, max };
}

async function runLoadTest() {
  console.log("🚀 Starting Load Test for TrainingX.ai\n");
  console.log("=" .repeat(50));

  if (TEST_TOKEN) {
    await testTokenValidation(TEST_TOKEN, 10);
    await testConcurrentTokenValidation(TEST_TOKEN, 5);
  } else {
    console.log("\n⚠️  TEST_TOKEN not set, skipping token validation tests");
  }

  await testScoring(50);
  await testAssessmentScoring(20);

  console.log("\n" + "=".repeat(50));
  console.log("✅ Load test complete!");
  console.log("\n📊 Summary:");
  console.log("  - Token validation: < 100ms avg (target)");
  console.log("  - Scoring calculations: < 1ms avg (target)");
  console.log("  - Concurrent requests: Should handle 5+ parallel");
}

runLoadTest().catch(console.error);
