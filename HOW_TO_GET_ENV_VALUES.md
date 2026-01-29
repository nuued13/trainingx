# How to Get Environment Values for Load Test

## 1. NEXT_PUBLIC_CONVEX_URL

### Method 1: Convex Dashboard (Easiest)
1. Go to: https://dashboard.convex.dev
2. Select your TrainingX project
3. Click **Settings** → **Deployment**
4. Copy the **Deployment URL** (format: `https://xxxxx.convex.cloud`)
5. Use this as your `NEXT_PUBLIC_CONVEX_URL`

### Method 2: From Terminal
```bash
# If you have Convex CLI running
npx convex dev

# The URL will be shown in the output, or check:
cat .env.local | grep CONVEX_URL
```

### Method 3: Check Existing .env.local
```bash
# Check if you already have it set
cat .env.local
# Look for: NEXT_PUBLIC_CONVEX_URL=https://...
```

---

## 2. TEST_TOKEN (Optional - for token validation tests)

### Generate via Convex Dashboard:
1. Go to: https://dashboard.convex.dev
2. Select your TrainingX project
3. Click **Functions** tab
4. Find: `testTokens:generateToken`
5. Click **Run** button
6. Enter args: `{}` (empty object)
7. Copy the `token` value from response (format: `test_1234567890_abc123`)

**Note:** If you don't set `TEST_TOKEN`, the load test will still run but skip token validation tests. Scoring tests will still run.

---

## Quick Setup Commands

```bash
# 1. Get Convex URL from dashboard, then:
export NEXT_PUBLIC_CONVEX_URL="https://your-deployment.convex.cloud"

# 2. Generate token from dashboard, then:
export TEST_TOKEN="test_1234567890_abc123"

# 3. Run load test
npm run load-test
```

---

## Alternative: Use .env.local file

Create/edit `.env.local`:
```bash
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
TEST_TOKEN=test_1234567890_abc123
```

Then the load test will automatically read from `.env.local` (if using dotenv).
