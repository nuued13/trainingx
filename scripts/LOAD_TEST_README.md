# Load Test Guide

Quick load test for token validation and scoring performance.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables:**
   ```bash
   # In .env.local or export
   export NEXT_PUBLIC_CONVEX_URL="your-convex-url"
   export TEST_TOKEN="test_token_here"  # Optional - generate via Convex dashboard
   ```

3. **Generate a test token (if needed):**
   - Go to Convex Dashboard → Functions
   - Run: `api.testTokens.generateToken({})`
   - Copy the token and set as `TEST_TOKEN`

## Run Load Test

```bash
npm run load-test
```

## What It Tests

1. **Token Validation** (10 requests)
   - Tests `validateToken` query performance
   - Measures: avg, min, max response times
   - Target: < 100ms average

2. **Concurrent Token Validation** (5 parallel)
   - Tests parallel request handling
   - Verifies no race conditions
   - Target: All complete successfully

3. **Scoring Calculations** (50 iterations)
   - Tests `computePromptScore` and `computeSkillSignals`
   - Pure JavaScript performance
   - Target: < 1ms average

4. **Assessment Scoring** (20 iterations)
   - Tests full assessment result calculation
   - Includes rubric averaging logic
   - Target: < 5ms average

## Expected Results

```
🚀 Starting Load Test for TrainingX.ai
==================================================

🔐 Testing Token Validation (10 requests)...
  First request: 45ms - Valid: true
  ✅ Avg: 52.30ms | Min: 38ms | Max: 78ms | Errors: 0

⚡ Testing Concurrent Token Validation (5 parallel requests)...
  ✅ Completed in 67ms | All valid: true

📊 Testing Scoring Calculations (50 iterations)...
  ✅ Avg: 0.0020ms | Min: 0ms | Max: 1ms

📝 Testing Assessment Scoring (20 iterations)...
  ✅ Avg: 0.1500ms | Min: 0ms | Max: 1ms

==================================================
✅ Load test complete!
```

## Troubleshooting

- **"NEXT_PUBLIC_CONVEX_URL not set"**: Set your Convex URL in environment
- **Token validation errors**: Generate a valid token first
- **High latency**: Check Convex dashboard for function performance
- **Concurrent failures**: May indicate database locking issues
