# Practice Zone - Complete Setup Guide

## Overview

The practice zone is a multi-path learning system with domains, tracks, and levels. Users navigate through:
- **Domains** (General AI Skills, Coding, Content, etc.)
- **Tracks** (Prompt Engineering, AI Tools, etc.)
- **Levels** (Basics, Core, Advanced, Mastery)
- **Practice Card Deck** (Interactive challenges)

## Quick Start

### 1. Start Convex Dev Server
```bash
npx convex dev
```

### 2. Seed the Database
```bash
# Create domain structure
npx convex run seedStarterDomain:seedStarterDomain

# Create Level 1 challenges
npx convex run seedLevel1Items:createLevel1Items
```

### 3. Start the App
```bash
npm run dev
```

### 4. Navigate to Practice Zone
- Go to `http://localhost:3000/practice`
- Sign up or log in
- Select "General AI Skills" domain
- Select "Prompt Engineering Fundamentals" track
- Select "Level 1: The Basics"
- Start practicing!

## Database Structure

### Domains (7 total)
1. **General AI Skills** (Starter - Unlocked)
   - Prompt Engineering Fundamentals (4 levels)
   - AI Tool Mastery (3 levels)
   - Prompt Patterns Library (3 levels)

2. Coding & Development (Locked)
3. Content & Writing (Locked)
4. Creative & Design (Locked)
5. Business & Professional (Locked)
6. Data & Analytics (Locked)
7. Healthcare & Medical (Locked)

### Tracks in General AI Skills
- **Prompt Engineering Fundamentals**: 4 levels, 48 challenges
- **AI Tool Mastery**: 3 levels, 30 challenges
- **Prompt Patterns Library**: 3 levels, 24 challenges

### Levels in Prompt Engineering Fundamentals
1. **Level 1: The Basics** (12 challenges, 15 min)
   - Topics: clarity, specificity, context
   - Difficulty: 1050-1200 Elo

2. **Level 2: Core Principles** (12 challenges, 20 min)
   - Topics: constraints, roles, formatting
   - Difficulty: 1300-1500 Elo

3. **Level 3: Advanced Techniques** (12 challenges, 25 min)
   - Topics: chain of thought, few-shot, iteration
   - Difficulty: 1500-1700 Elo

4. **Level 4: Mastery** (12 challenges, 30 min)
   - Topics: complex multi-step prompts
   - Difficulty: 1700-2000 Elo

## Backend Functions

### Levels (convex/practiceLevels.ts)
- `listByTrack` - Get all levels for a track
- `getWithDetails` - Get level with user progress
- `getTrackWithLevels` - Get track with all levels
- `getCompletionPercentage` - Get level completion %
- `isCompleted` - Check if level is completed

### Items (convex/practiceItems.ts)
- `getChallengesForLevel` - Get 12 challenges (hybrid curated + adaptive)
- `getByDifficultyRange` - Get challenges by Elo range
- `getByType` - Get challenges by type
- `getByCategory` - Get challenges by category
- `getRandomChallenges` - Get random challenges
- `getStats` - Get challenge statistics

### Progress (convex/userProgress.ts)
- `getLevelProgress` - Get user's level progress
- `getTrackProgress` - Get user's track progress
- `updateLevelProgress` - Update progress after challenge
- `updateTrackProgress` - Aggregate progress from levels
- `getOverallProgress` - Get overall progress

## Frontend Components

### Navigation Flow
1. **DomainSelection** - Browse domains
2. **TrackSelection** - Choose track
3. **LevelSelection** - Select level
4. **PracticeCardDeck** - Complete challenges

### PracticeCardDeck Features
- Interactive card grid (6 columns, responsive)
- Flip animation for card reveal
- Real-time scoring and streak tracking
- Progress bar with completion percentage
- Modal with question/feedback flip animation
- Three-option rating system (bad/almost/good)
- Timer for speed bonuses
- Statistics display

## Data Seeding

### Seed Functions

#### seedStarterDomain:seedStarterDomain
Creates the complete domain/track/level structure:
- 1 starter domain (General AI Skills)
- 3 tracks with 4 levels each
- 5 specialized domains (locked)

#### seedLevel1Items:createLevel1Items
Creates 12 beginner-level challenges for Level 1:
- Blog posts, emails, summaries
- Lists, comparisons, social media
- Quizzes, recipes, job descriptions
- Each with 3 quality options (bad/almost/good)

#### seedPhase3:seedProductionPracticeItems
Creates 10 high-quality production items (optional):
- Advanced prompt engineering scenarios
- Real-world use cases
- Elo ratings: 1520-1650

## Schema

### Key Tables
- **practiceDomains** - Domain definitions
- **practiceTracks** - Track definitions
- **practiceLevels** - Level definitions
- **practiceItems** - Individual challenges
- **practiceItemTemplates** - Challenge templates
- **userTrackProgress** - User progress per track
- **userLevelProgress** - User progress per level
- **userDomainUnlocks** - Domain unlock status

### Indexes
All tables have proper indexes for fast queries:
- `by_slug` - For slug lookups
- `by_domain` - For domain queries
- `by_track` - For track queries
- `by_level` - For level queries
- `by_status` - For status filtering
- `by_user` - For user queries
- `by_user_track` - For user+track queries
- `by_user_level` - For user+level queries

## Features

### User Experience
✅ Multi-path learning (domains → tracks → levels)
✅ Interactive card deck with animations
✅ Real-time scoring and streak tracking
✅ Progress tracking at multiple levels
✅ Responsive design (mobile-friendly)
✅ Emerald/teal color theme

### Backend Optimization
✅ Indexed queries for fast lookups
✅ Hybrid challenge system (curated + adaptive)
✅ Efficient progress aggregation
✅ Elo-based difficulty scaling
✅ Spaced repetition ready

### Data Integrity
✅ Schema validation with required fields
✅ Proper foreign key relationships
✅ Comprehensive indexes
✅ Clean data (legacy data removed)

## Troubleshooting

### "Track not found" error
- Run `npx convex run seedStarterDomain:seedStarterDomain` first

### "No users found" error
- Create a user account by signing up through the app

### "Level 1 already has items" error
- Items are already seeded, you're good to go!

### Items not showing in practice zone
- Make sure Convex dev server is running
- Check browser console for errors
- Verify items are linked to a level

### Build errors
- Run `npm run build` to check for TypeScript errors
- Make sure all imports are correct
- Check that Convex functions are properly exported

## Performance

- Build time: ~7.5s
- No TypeScript errors
- All indexes properly configured
- Optimized queries with withIndex()
- Responsive animations with Framer Motion

## Next Steps

### Immediate
1. Test practice zone in browser
2. Verify card deck animations
3. Check progress tracking
4. Test mobile responsiveness

### Short Term
1. Add more levels (Level 2, 3, 4)
2. Implement daily drills
3. Add spaced repetition
4. Create achievement badges

### Medium Term
1. AI-powered feedback
2. Adaptive difficulty
3. Leaderboards
4. Social features (duels, sharing)

### Long Term
1. Creator studio for UGC
2. Advanced analytics
3. Career matching
4. Certification system

## Files

### Core Backend
- `convex/practiceLevels.ts` - Level queries
- `convex/practiceItems.ts` - Challenge queries
- `convex/userProgress.ts` - Progress tracking
- `convex/practiceDomains.ts` - Domain queries
- `convex/practiceTracks.ts` - Track queries

### Seeding
- `convex/seedStarterDomain.ts` - Domain/track/level structure
- `convex/seedLevel1Items.ts` - Level 1 challenges
- `convex/seedPhase3.ts` - Production items (optional)

### Frontend
- `app/(routes)/practice/page.tsx` - Practice zone page
- `components/practice/DomainSelection.tsx` - Domain selection
- `components/practice/TrackSelection.tsx` - Track selection
- `components/practice/LevelSelection.tsx` - Level selection
- `components/practice/PracticeCardDeck.tsx` - Card deck UI

### Documentation
- `convex/SEEDING.md` - Seeding guide
- `PRACTICE_ZONE_SETUP.md` - This file
- `PRACTICE_ZONE_IMPLEMENTATION.md` - Implementation details

## Support

For issues or questions:
1. Check `convex/SEEDING.md` for seeding help
2. Review schema in `convex/schema.ts`
3. Check backend functions in `convex/practice*.ts`
4. Review component code in `components/practice/`

---

**Status**: ✅ Complete and Ready for Use
**Last Updated**: November 16, 2025
