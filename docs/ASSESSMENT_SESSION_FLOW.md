# Assessment Session Flow - Implementation Guide

## Overview
This feature implements a complete assessment → results → learning zone flow with:
- Digital thumbprint generation from assessment answers
- Progressive pathway matching (one at a time)
- Signup gate for anonymous users
- Session-based tracking

## Architecture

### Database Schema
- `assessmentSessions`: Stores completed assessments with digital thumbprints
- `successPathways`: Contains 20+ career/learning pathways across 4 categories

### Flow
1. User completes assessment
2. System generates digital thumbprint (skills + weights)
3. Creates assessment session in DB
4. Redirects to `/results?sessionId={id}`
5. Results page shows best match progressively
6. After viewing 2 pathways, shows signup gate (anonymous users)
7. User can continue to learning zone

## Setup & Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Convex Dev Environment
```bash
npx convex dev
```

### 3. Seed Success Pathways
In the Convex dashboard (usually opens automatically), run:
```javascript
await api.seedSuccessPathways.seedSuccessPathways()
```

Or using the Convex CLI:
```bash
npx convex run seedSuccessPathways:seedSuccessPathways
```

### 4. Start Next.js Dev Server
```bash
npm run dev
```

### 5. Test the Flow

#### As Anonymous User:
1. Go to http://localhost:3000/assessment
2. Complete the assessment
3. You'll be redirected to `/results?sessionId={sessionId}`
4. View the first pathway match
5. Click "See Next Match" to view more
6. After 2 pathways, you'll see the signup gate
7. Click "Continue to Learning Zone" to see the welcome page

#### As Authenticated User:
1. Sign in first at http://localhost:3000/enter
2. Go to http://localhost:3000/assessment
3. Complete the assessment
4. View all pathway matches without signup gate
5. Continue to learning zone

## Key Files

### Backend (Convex)
- `convex/schema.ts` - Database schema definitions
- `convex/assessmentSessions.ts` - Session CRUD operations
- `convex/matching.ts` - Matching algorithm and queries
- `convex/successPathways.ts` - Pathway CRUD operations
- `convex/seedSuccessPathways.ts` - Database seeding

### Frontend (Next.js)
- `app/(routes)/assessment/page.tsx` - Assessment flow with session creation
- `app/(routes)/results/page.tsx` - Progressive pathway display
- `app/(routes)/learning/page.tsx` - Learning zone welcome

## Matching Algorithm

The matching algorithm:
1. Calculates match scores between user's digital thumbprint and pathways
2. Considers both skill presence and weight/importance
3. Filters out already-seen pathways
4. Returns the single best unseen match
5. Tracks seen pathways in the session

Score calculation:
```javascript
score = (userWeight * pathwayWeight) / totalPathwayWeight
normalized to 0-100 scale
```

## API Endpoints

### Mutations
- `assessmentSessions.createSession(userId?, answers, digitalThumbprint)` → sessionId
- `assessmentSessions.markPathwayAsSeen(sessionId, pathwayId)` → boolean
- `successPathways.createPathway(...)` → pathwayId

### Queries
- `assessmentSessions.getSessionById(sessionId)` → Session
- `matching.getMatchesForSession(sessionId)` → { pathway, matchScore, remainingMatches }
- `matching.getSessionMatchStats(sessionId)` → Stats
- `successPathways.getPathways(filters?)` → Pathway[]

## Categories

1. **Creative & Design** - UX/UI, graphic design, brand strategy, motion graphics
2. **Technical & Development** - Frontend, backend, full-stack, mobile, DevOps
3. **Business & Strategy** - Product management, marketing, business analysis
4. **Data & Analytics** - Data analysis, data science, data engineering

## Seeded Pathways

The seed file includes 20+ pathways covering:
- Beginner, intermediate, and advanced difficulty levels
- Salary ranges from $45k-$170k
- Time to learn: 4-12 months
- Market demand levels (high/medium/low)
- Detailed next steps and resources

## Future Enhancements

- [ ] Add more pathways (target 80-120 total)
- [ ] Add user favorites/bookmarking
- [ ] Add pathway comparison feature
- [ ] Add personalized learning plans
- [ ] Add progress tracking per pathway
- [ ] Add AI-generated pathway recommendations
- [ ] Add community features (pathway reviews, discussions)

## Troubleshooting

### Session not found
- Ensure sessionId is in the URL
- Check that the session was created successfully
- Verify Convex is running

### No matches found
- Ensure pathways are seeded
- Check that pathways are marked as `isActive: true`
- Verify digital thumbprint is generated correctly

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Clear `.next` folder and rebuild
- Check Convex schema is deployed

## Development Notes

- Sessions are tracked by `sessionId` for authenticated users and `sessionToken` for anonymous
- Digital thumbprint uses the same skill calculations as the existing assessment system
- Pathways marked as seen are tracked in the session to enable progressive disclosure
- Signup gate appears after 2 pathway views for anonymous users
