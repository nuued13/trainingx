# Deployment Errors - Quick Fix Checklist

## ❌ BLOCKING ISSUES (Must fix before deployment)

### 1. Google Fonts Build Failure
**Error:** `Failed to fetch 'Bricolage Grotesque' from Google Fonts`

**Quick Fix:**
```bash
# Download fonts to /public/fonts/
# Then update app/layout.tsx to use local fonts
```

**Files to modify:**
- `app/layout.tsx` (lines 2, 14-24)

---

### 2. Missing Environment Variables
**Error:** Runtime failures due to missing API keys

**Required in Dokploy:**
```bash
# Convex
CONVEX_SITE_URL=https://staging.trainingx.ai
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>

# OpenAI
OPENAI_API_KEY=<your-key>

# LiveKit
LIVEKIT_API_KEY=<your-key>
LIVEKIT_API_SECRET=<your-secret>
LIVEKIT_URL=<your-livekit-url>

# ElevenLabs
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=<your-agent-id>

# Optional
NEXT_PUBLIC_IS_DEV=false
NEXT_PUBLIC_LIVEKIT_AGENT_NAME=<agent-name>
```

---

### 3. Convex Not Deployed
**Error:** Authentication and database will fail

**Quick Fix:**
```bash
# Deploy Convex functions
npx convex deploy --prod

# Add environment variables to Convex dashboard
# Update CONVEX_SITE_URL in Dokploy
```

---

## ⚠️ WARNINGS (Non-blocking but should fix)

### 4. Peer Dependency Warning
```
@auth/core expects nodemailer@^6.8.0: found 7.0.12
```
**Action:** Monitor for email/auth issues in staging

---

## ✅ RESOLVED

### 5. Shiki Package
**Status:** ✅ Fixed by running `pnpm add shiki`

---

## Quick Test Commands

```bash
# Test build locally
pnpm install
pnpm run build

# Test production server
pnpm run start

# Check for errors
pnpm run lint
```

---

## Deployment Ready Checklist

- [ ] Google Fonts issue resolved (local fonts)
- [ ] All environment variables set in Dokploy
- [ ] Convex functions deployed to production
- [ ] Convex environment variables configured
- [ ] Local build succeeds (`pnpm run build`)
- [ ] Production server starts (`pnpm run start`)
- [ ] DNS points to staging.trainingx.ai
- [ ] SSL certificate configured

---

**See DEPLOYMENT_TEST_REPORT.md for full details**
