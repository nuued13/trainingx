# Single Users Table Implementation - Complete Summary

## Overview
Successfully consolidated authentication architecture to use **one unified Users table** managed by OAuth and Convex auth library. Removed redundant auth fields, deprecated anonymous access, and simplified password providers.

---

## Changes Made

### 1. ✅ Schema Consolidation ([convex/schema.ts](convex/schema.ts))

**Removed from Users table:**
- `emailVerificationTime: v.optional(v.number())` — Auth library manages verification
- `phoneVerificationTime: v.optional(v.number())` — Auth library manages verification  
- `isAnonymous: v.optional(v.boolean())` — Auth-required: no anonymous access

**Retained in Users table:**
- Core profile: `name`, `image`, `customImageId`
- Contact: `email`, `phone`
- App-specific: `isPaid`, `favoriteColor`, `age`, `location`, `gender`
- Workflow: `needsProfileCompletion`, `preAssessmentCompleted`, `recommendedPath`, `assessmentStarted`

**Indexes retained:**
- `.index("email", ["email"])` — Allows email lookup when needed
- `.index("phone", ["phone"])` — Allows phone lookup when needed

---

### 2. ✅ Auth Provider Consolidation ([convex/auth.ts](convex/auth.ts))

**Active Providers (✅ Kept):**
1. **Google OAuth** — Email normalized via `normalizeEmail()`
2. **Apple OAuth** — Uses `clientSecret` auth method
3. **Resend Magic Link** — Email-based passwordless auth
4. **Email OTP** (`ResendOTP`) — Email verification codes
5. **Password (Default)** — Basic email + password
6. **Password Custom** (`password-custom`) — Signup with `favoriteColor` field
7. **Password with Reset** (`password-with-reset`) — Password + OTP reset via Resend

**Deprecated Providers (❌ Removed):**
- `Anonymous` — Auth-required constraint
- `password-code` — Consolidated into `password-with-reset`
- `password-link` — Replaced by `password-with-reset`
- `TwilioOTP` — SMS-based OTP (removed)
- `TwilioVerify` — Phone verification (removed)

**Imports removed from [convex/auth.ts](convex/auth.ts):**
```typescript
// REMOVED:
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
```

---

### 3. ✅ Auth Callback Cleanup ([convex/auth.ts](convex/auth.ts))

**Updated `afterUserCreatedOrUpdated` callback:**

**Removed:**
```typescript
// Set emailVerificationTime when email OTP is verified
if (type === "verification" && provider.id === "resend-otp") {
  await ctx.db.patch(userId, { emailVerificationTime: Date.now() });
}

// Set phoneVerificationTime when phone OTP is verified
if (type === "verification" && provider.id === "twilio-otp") {
  await ctx.db.patch(userId, { phoneVerificationTime: Date.now() });
}
```

**Retained:**
```typescript
const isOAuth = type === "oauth" || provider.type === "oauth" || provider.type === "oidc";
if (existingUserId === null && isOAuth) {
  // Set profile completion flag for new OAuth users
  await ctx.db.patch(userId, { needsProfileCompletion: true });
}
```

---

### 4. ✅ Seed & Migration Cleanup

**[convex/seed.ts](convex/seed.ts):**
- Removed `isAnonymous: false` from system user creation

**[convex/seedCommunity.ts](convex/seedCommunity.ts):**
- Removed `isAnonymous: false` from community user creation

**[convex/migrations.ts](convex/migrations.ts):**
- Removed `isAnonymous: false` from system user creation
- **Added new migrations:**
  - `cleanupOrphanedAuthAccounts()` — Removes `authAccounts` without matching users
  - `verifyAuthIntegrity()` — Query to audit auth/users consistency

---

### 5. ✅ Context & Type Updates ([contexts/AuthContextProvider.tsx](contexts/AuthContextProvider.tsx))

**Updated User interface:**
```typescript
// REMOVED:
isAnonymous?: boolean;

// RETAINED:
interface User {
  _id: string;
  email?: string;
  name?: string;
  image?: string;
  age?: number;
  location?: string;
  assessmentStarted?: boolean;
  needsProfileCompletion?: boolean;
  isPaid?: boolean;
}
```

---

### 6. ✅ UI Component Cleanup ([components/auth/SignInFormsShowcase.tsx](components/auth/SignInFormsShowcase.tsx))

**Removed imports:**
- `SignInFormAnonymous`
- `SignInFormPassword` (basic)
- `SignInFormPasswordAndResetViaCode`
- `SignInFormPasswordAndVerifyViaCode`
- `SignInFormPhoneCode`

**Simplified auth methods shown:**
- **OTP** → Email OTP only
- **Magic Link** → Resend magic link
- **Password** → Custom signup + reset

**Removed UI tabs:**
- Anonymous signin tab (was commented out)
- SMS/Phone OTP tab
- Email verification tab

---

### 7. ✅ Test Suite Added ([convex/auth.test.ts](convex/auth.test.ts))

**Comprehensive test documentation for:**
- ✅ OAuth signup flow → Users table creation
- ✅ `needsProfileCompletion` workflow
- ✅ Email normalization via `normalizeEmail()`
- ✅ Profile data mapping (email, name, image)
- ✅ Removed verification time fields
- ✅ Active vs deprecated providers
- ✅ Auth/Users 1:1 relationship validation
- ✅ Orphaned account cleanup

---

## Data Integrity & Migration

### Auth System Architecture (Post-Consolidation)

```
┌─────────────────────────────────────────────────────┐
│              Single Logical User                     │
├─────────────────────────────────────────────────────┤
│  Auth Library Tables (managed by Convex):           │
│  ├─ authAccounts[userId] → OAuth credentials       │
│  ├─ authSessions[userId] → Active sessions         │
│  └─ authVerifications → Email/phone verification   │
├─────────────────────────────────────────────────────┤
│  Custom Users Table:                                │
│  ├─ Profile: name, image, email, phone             │
│  ├─ App-specific: age, location, favoriteColor     │
│  ├─ State: needsProfileCompletion, isPaid          │
│  └─ Workflow: assessmentStarted, recommendedPath   │
└─────────────────────────────────────────────────────┘
```

### Running Migrations

```typescript
// Check auth integrity before cleanup:
const status = await ctx.runQuery(api.migrations.verifyAuthIntegrity);

// If orphans found, run cleanup:
await ctx.runMutation(api.migrations.cleanupOrphanedAuthAccounts);

// Verify after:
const status = await ctx.runQuery(api.migrations.verifyAuthIntegrity);
```

---

## OAuth + Users Flow (Updated)

### 1. User Clicks OAuth Button
```
User → Google/Apple OAuth provider
```

### 2. OAuth Callback
```
Auth library receives credentials
→ Creates authAccount + authSession
→ Creates/links users record
→ Calls afterUserCreatedOrUpdated callback
```

### 3. afterUserCreatedOrUpdated Callback
```typescript
if (isOAuth && existingUserId === null) {
  // New OAuth user → set needsProfileCompletion flag
  ctx.db.patch(userId, { needsProfileCompletion: true })
}
```

### 4. Profile Completion
```
User redirected to /profile-completion
→ Form pre-fills: name, image (from OAuth)
→ User enters: age, location
→ completeProfile(name, age, location)
→ Sets: needsProfileCompletion: false
```

### 5. User Access
```
Frontend: getAuthUserId(ctx) → userId
         ctx.db.get(userId) → user document
         User now has full profile in Users table
```

---

## Querying Pattern (Post-Consolidation)

### ✅ Recommended Pattern (OAuth-aware)
```typescript
export const viewer = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return ctx.db.get(userId);
  },
});
```

### ❌ Avoid Pattern (email lookup)
```typescript
// This still works, but breaks separation of concerns:
const user = await ctx.db.query("users")
  .filter(q => q.eq(q.field("email"), email))
  .first();
```

**Why:** Auth library manages identity via userId, email lookups should only be used in OAuth callbacks where email normalization happens.

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Remove Anonymous** | Auth-required constraint: all users must authenticate |
| **Remove verification times** | Auth library manages verification state internally |
| **Keep favoriteColor** | Custom signup field valuable for onboarding |
| **Keep email/phone indexes** | Useful for admin queries, referral lookups, etc. |
| **Keep password providers** | Fallback for users without OAuth |
| **Single Users table** | Unified identity source, cleaner queries |

---

## Breaking Changes

### For Frontend Components:
- ❌ Cannot check `user?.isAnonymous` (removed)
- ❌ Cannot access `user?.emailVerificationTime` (removed)
- ❌ Cannot access `user?.phoneVerificationTime` (removed)

### For Auth Flows:
- ❌ Cannot sign in with `signIn("anonymous")` (removed)
- ❌ Cannot use `password-code` provider (consolidated)
- ❌ Cannot use `password-link` provider (consolidated)
- ❌ Cannot use `twilio-otp` or `twilio-verify` (removed)

### For Seeding:
- Update any seed scripts creating users with `isAnonymous: false` → remove field

---

## Verification Checklist

- ✅ Schema updated: removed auth fields
- ✅ Auth providers: deprecated legacy, kept OAuth + password
- ✅ Callbacks: removed verification time updates
- ✅ Seed files: removed isAnonymous references
- ✅ Context provider: removed isAnonymous from User type
- ✅ UI components: simplified auth method showcase
- ✅ Tests: added comprehensive test documentation
- ✅ Migrations: added orphan cleanup + integrity check

---

## Files Modified

| File | Changes |
|------|---------|
| [convex/schema.ts](convex/schema.ts) | Removed `emailVerificationTime`, `phoneVerificationTime`, `isAnonymous` |
| [convex/auth.ts](convex/auth.ts) | Removed Anonymous provider, deprecated password providers, cleaned up callbacks |
| [convex/seed.ts](convex/seed.ts) | Removed `isAnonymous: false` |
| [convex/seedCommunity.ts](convex/seedCommunity.ts) | Removed `isAnonymous: false` |
| [convex/migrations.ts](convex/migrations.ts) | Removed `isAnonymous: false`, added cleanup migrations |
| [contexts/AuthContextProvider.tsx](contexts/AuthContextProvider.tsx) | Removed `isAnonymous` from User interface |
| [components/auth/SignInFormsShowcase.tsx](components/auth/SignInFormsShowcase.tsx) | Removed anonymous/unused auth method imports and tabs |
| [convex/auth.test.ts](convex/auth.test.ts) | **NEW** - Comprehensive test documentation |

---

## Next Steps

1. **Run migrations:**
   ```
   npx convex run api.migrations.verifyAuthIntegrity
   npx convex run api.migrations.cleanupOrphanedAuthAccounts
   ```

2. **Test OAuth flows:**
   - Sign up with Google
   - Sign up with Apple
   - Complete profile
   - Verify user record in dashboard

3. **Update any custom components:**
   - Search for `isAnonymous`, `emailVerificationTime`, `phoneVerificationTime` in your code
   - Remove or replace as needed

4. **Monitor auth logs:**
   - Check Convex dashboard for auth errors
   - Verify OAuth users hit profile completion flow

---

## Summary

**From:** Multiple tables (authAccounts, authSessions, users) with overlapping concerns  
**To:** Single unified Users table with clean OAuth integration

Users authenticate via OAuth/password → Auth library creates authAccount/authSession → afterUserCreatedOrUpdated callback ensures Users record exists → Frontend queries via userId, not email → Profile completion drives needsProfileCompletion workflow.

All authentication now flows through one logical user identity with zero anonymous access.
