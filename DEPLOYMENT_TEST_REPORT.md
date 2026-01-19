# Deployment Test Report - TrainingX.AI Staging

**Date:** January 19, 2026  
**Target Environment:** Hostinger Dokploy - staging.trainingx.ai  
**Source Branch:** staging  
**Test Status:** ⚠️ ISSUES IDENTIFIED

---

## Executive Summary

The deployment test identified **3 critical issues** and **2 warnings** that must be resolved before successfully deploying to staging.trainingx.ai on Hostinger Dokploy.

### Critical Issues
1. ❌ **Google Fonts fetch failure** - Build fails when fetching fonts from Google APIs
2. ❌ **Missing environment variables** - Required API keys and configuration not set
3. ❌ **Convex configuration incomplete** - CONVEX_SITE_URL not configured

### Warnings
1. ⚠️ **Shiki package externalization** - Package dependency issue (RESOLVED by adding shiki)
2. ⚠️ **Peer dependency mismatch** - nodemailer version mismatch

---

## 1. Build Test Results

### Environment
- **Node Version:** v20.19.6 ✅ (meets requirement >= 20.9.0)
- **npm Version:** 10.8.2 ✅ (meets requirement >= 10.8.2)
- **Package Manager:** pnpm v10.28.1 ✅
- **Next.js Version:** 16.0.10 (Turbopack)

### Build Command
```bash
pnpm run build
```

### Build Status: ❌ FAILED

**Primary Error:**
```
Error: Turbopack build failed with 2 errors:
next/font: error:
Failed to fetch `Bricolage Grotesque` from Google Fonts.
Failed to fetch `Space Grotesk` from Google Fonts.
```

**Affected Files:**
- `app/layout.tsx` (lines 2, 14-24)

---

## 2. Critical Issues Details

### Issue #1: Google Fonts Fetch Failure ❌

**Severity:** CRITICAL  
**Impact:** Blocks production build

**Description:**
The Next.js build process fails when attempting to fetch Google Fonts (Bricolage Grotesque and Space Grotesk) during the build phase.

**Location:**
```typescript
// app/layout.tsx:2,14-24
import { Bricolage_Grotesque, Space_Grotesk } from "next/font/google";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage-grotesque",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});
```

**Root Cause:**
- Build environment may have network restrictions blocking fonts.googleapis.com
- Dokploy build environment may not have internet access during build phase
- Google Fonts API may be blocked by firewall rules

**Solutions (Choose one):**

**Option A: Pre-download fonts (RECOMMENDED)**
1. Download font files from Google Fonts
2. Place in `/public/fonts` directory
3. Use `next/font/local` instead of `next/font/google`
4. Update app/layout.tsx:
```typescript
import localFont from 'next/font/local';

const bricolageGrotesque = localFont({
  src: '../public/fonts/BricolageGrotesque-Variable.woff2',
  variable: '--font-bricolage-grotesque',
  display: 'swap',
});

const spaceGrotesk = localFont({
  src: '../public/fonts/SpaceGrotesk-Variable.woff2',
  variable: '--font-space-grotesk',
  display: 'swap',
});
```

**Option B: Configure network access**
- Ensure Dokploy build environment allows access to fonts.googleapis.com
- Whitelist fonts.gstatic.com for font file downloads

**Option C: Use system fonts fallback**
- Replace Google Fonts with system font stack temporarily
- Acceptable for staging if typography is not critical

---

### Issue #2: Missing Environment Variables ❌

**Severity:** CRITICAL  
**Impact:** Application runtime failures for specific features

**Required Environment Variables:**

| Variable | Purpose | Required For | Status |
|----------|---------|--------------|--------|
| `CONVEX_SITE_URL` | Convex Auth configuration | Authentication | ❌ Missing |
| `OPENAI_API_KEY` | OpenAI API access | Prompt scoring | ❌ Missing |
| `LIVEKIT_API_KEY` | LiveKit voice/video | Voice chat feature | ❌ Missing |
| `LIVEKIT_API_SECRET` | LiveKit authentication | Voice chat feature | ❌ Missing |
| `LIVEKIT_URL` | LiveKit server URL | Voice chat feature | ❌ Missing |
| `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` | ElevenLabs voice AI | Voice chat widget | ❌ Missing |
| `NEXT_PUBLIC_LIVEKIT_AGENT_NAME` | LiveKit agent config | Voice chat display | ⚠️ Optional |
| `NEXT_PUBLIC_IS_DEV` | Development mode flag | Feature flags | ⚠️ Optional |
| `PROMPT_SCORING_MODEL` | AI model selection | Prompt evaluation | ⚠️ Optional (defaults to gpt-5-nano) |

**Action Required:**
1. Set all required environment variables in Dokploy dashboard
2. Obtain API keys from respective services:
   - Convex: https://dashboard.convex.dev
   - OpenAI: https://platform.openai.com/api-keys
   - LiveKit: https://cloud.livekit.io
   - ElevenLabs: https://elevenlabs.io/app/conversational-ai

**Dokploy Configuration:**
- Navigate to: Project → Environment Variables
- Add each variable with appropriate values
- For staging: Set `NEXT_PUBLIC_IS_DEV=false`

---

### Issue #3: Convex Configuration ❌

**Severity:** CRITICAL  
**Impact:** Authentication and database functionality will fail

**Description:**
The Convex backend requires proper configuration for the staging environment.

**Location:**
```typescript
// convex/auth.config.ts:4
domain: process.env.CONVEX_SITE_URL
```

**Required Actions:**

1. **Set CONVEX_SITE_URL**
   ```
   CONVEX_SITE_URL=https://staging.trainingx.ai
   ```

2. **Deploy Convex functions**
   ```bash
   npx convex deploy --prod
   ```

3. **Configure Convex environment variables**
   - Log in to Convex dashboard
   - Select your project
   - Add all required API keys to Convex environment
   - Redeploy Convex functions

4. **Update Dokploy with Convex deployment URL**
   - Add `NEXT_PUBLIC_CONVEX_URL` with your Convex deployment URL
   - Add `CONVEX_DEPLOYMENT` if using Convex dev vs prod

---

## 3. Warnings (Non-Blocking)

### Warning #1: Shiki Package Externalization ⚠️

**Status:** ✅ RESOLVED

**Description:**
The `shiki` syntax highlighting package was not properly installed as a direct dependency, causing Turbopack warnings about package externalization.

**Solution Implemented:**
```bash
pnpm add shiki
```

**Impact:** No longer blocking build, warnings eliminated.

---

### Warning #2: Peer Dependency Mismatch ⚠️

**Severity:** LOW  
**Status:** ⚠️ MONITOR

**Description:**
```
@auth/core 0.37.4
└── ✕ unmet peer nodemailer@^6.8.0: found 7.0.12
```

**Impact:**
- Non-blocking for build
- May cause runtime issues with email authentication features
- @auth/core expects nodemailer v6.x but project uses v7.x

**Recommendation:**
- Monitor for authentication/email issues in staging
- Consider downgrading nodemailer to 6.x if issues occur
- Or wait for @auth/core update to support nodemailer 7.x

---

## 4. Deployment Checklist

### Pre-Deployment Tasks

- [ ] **Resolve Google Fonts Issue**
  - [ ] Download fonts locally OR
  - [ ] Configure network access in Dokploy
  
- [ ] **Set Environment Variables in Dokploy**
  - [ ] CONVEX_SITE_URL
  - [ ] NEXT_PUBLIC_CONVEX_URL
  - [ ] OPENAI_API_KEY
  - [ ] LIVEKIT_API_KEY
  - [ ] LIVEKIT_API_SECRET
  - [ ] LIVEKIT_URL
  - [ ] NEXT_PUBLIC_ELEVENLABS_AGENT_ID
  - [ ] NEXT_PUBLIC_IS_DEV=false

- [ ] **Convex Setup**
  - [ ] Deploy Convex functions to production
  - [ ] Configure Convex environment variables
  - [ ] Verify Convex deployment URL
  - [ ] Test Convex authentication

- [ ] **Test Local Build**
  - [ ] Run `pnpm run build` successfully
  - [ ] Run `pnpm run start` to test production build
  - [ ] Verify all pages load correctly

### Dokploy Configuration

- [ ] **Project Settings**
  - [ ] Set Node version to 20.x
  - [ ] Set build command: `pnpm run build`
  - [ ] Set start command: `pnpm run start`
  - [ ] Enable port 3000

- [ ] **Build Settings**
  - [ ] Install command: `pnpm install`
  - [ ] Build command: `pnpm run build`
  - [ ] Output directory: `.next`

- [ ] **Domain Configuration**
  - [ ] Point staging.trainingx.ai to Dokploy app
  - [ ] Configure SSL certificate
  - [ ] Test DNS resolution

### Post-Deployment Verification

- [ ] **Smoke Tests**
  - [ ] Homepage loads
  - [ ] Authentication works
  - [ ] Database queries work (Convex)
  - [ ] Voice chat initializes
  - [ ] Prompt scoring works
  - [ ] No console errors

- [ ] **Feature Tests**
  - [ ] User registration/login
  - [ ] Practice zone loads
  - [ ] AI evaluation works
  - [ ] LiveKit voice chat connects
  - [ ] Certificate generation works

---

## 5. Recommended Deployment Approach

### Phase 1: Fix Critical Issues (Required)
1. Resolve Google Fonts issue (2-4 hours)
   - Download fonts locally
   - Update layout.tsx
   - Test build
2. Configure environment variables (1 hour)
   - Obtain all API keys
   - Set in Dokploy
3. Deploy Convex backend (1 hour)
   - Deploy to production
   - Configure auth domain
   - Test connection

### Phase 2: Deploy to Dokploy (Estimated: 2-3 hours)
1. Push changes to staging branch
2. Configure Dokploy project
3. Trigger deployment
4. Monitor build logs
5. Verify deployment success

### Phase 3: Post-Deployment Testing (Estimated: 1-2 hours)
1. Run smoke tests
2. Test critical user flows
3. Check error logs
4. Performance testing
5. Document any issues

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Build fails due to fonts | HIGH | HIGH | Pre-download fonts locally |
| Missing API keys cause runtime errors | HIGH | HIGH | Set all env vars before deployment |
| Convex connection fails | MEDIUM | HIGH | Test Convex deployment separately |
| Network restrictions in Dokploy | MEDIUM | MEDIUM | Test with simple build first |
| Database migration issues | LOW | HIGH | Backup data before deployment |

---

## 7. Support & Resources

### Documentation
- Next.js Font Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Convex Deployment: https://docs.convex.dev/production/hosting
- Dokploy Documentation: https://dokploy.com/docs

### Configuration Files
- `.nixpacks.toml` - Node version configuration
- `next.config.ts` - Next.js build settings
- `convex/auth.config.ts` - Convex auth configuration
- `package.json` - Dependencies and scripts

### Build Commands
```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm run start

# Run linter
pnpm run lint
```

---

## 8. Next Steps

### Immediate Actions (Priority: CRITICAL)
1. **Fix Google Fonts Issue**
   - Owner: Development Team
   - Timeline: 1-2 days
   - Action: Download fonts locally and update code

2. **Obtain API Keys**
   - Owner: DevOps/Admin
   - Timeline: 1 day
   - Action: Create accounts and generate keys for all services

3. **Configure Dokploy Environment**
   - Owner: DevOps
   - Timeline: 1 day
   - Action: Set up project and environment variables

### Follow-up Actions
1. Test deployment in staging environment
2. Document deployment process
3. Create runbook for future deployments
4. Set up monitoring and alerting
5. Plan production deployment

---

## 9. Contact & Questions

For questions about this report or deployment issues:
- Create an issue in the GitHub repository
- Tag @jenidub for deployment questions
- Reference this report: `DEPLOYMENT_TEST_REPORT.md`

---

**Report Generated:** January 19, 2026  
**Last Updated:** January 19, 2026  
**Version:** 1.0  
**Status:** ⚠️ DEPLOYMENT BLOCKED - CRITICAL ISSUES IDENTIFIED
