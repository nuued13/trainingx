# Database Seeding Guide

This guide explains how to seed the practice zone with initial data.

## Prerequisites

1. Make sure Convex dev server is running: `npx convex dev`
2. You must have at least one user account created (sign up through the app)

## Seeding Steps

Run these commands in order:

### 1. Seed Domains and Tracks

This creates the domain structure (General AI Skills, Coding, Content, etc.) and tracks within each domain.

```bash
npx convex run seedStarterDomain:seedStarterDomain
```

Expected output:
- Creates "General AI Skills" domain (starter domain)
- Creates 3 tracks: Prompt Engineering Fundamentals, AI Tool Mastery, Prompt Patterns Library
- Creates 4 levels per track
- Creates 5 additional specialized domains (locked by default)

### 2. Seed Level 1 Practice Items

This creates 12 beginner-level practice challenges for Level 1 of the Prompt Engineering Fundamentals track.

```bash
npx convex run seedLevel1Items:createLevel1Items
```

Expected output:
- Creates 12 multiple-choice challenges
- Links them to Level 1: The Basics
- Challenges focus on clarity, specificity, and basic prompt structure

### 3. (Optional) Seed Production Items

If you want additional high-quality practice items (not linked to specific levels):

```bash
npx convex run seedPhase3:seedProductionPracticeItems
```

Then link them to Level 1:

```bash
npx convex run seedLevel1Items:linkItemsToLevel1
```

## Verify Seeding

Check if everything was seeded correctly:

```bash
npx convex run debug:checkPracticeProjects
```

## What Gets Created

### Domains (7 total)
1. **General AI Skills** (starter, unlocked) - 3 tracks
2. Coding & Development (locked) - 12 tracks
3. Content & Writing (locked) - 15 tracks
4. Creative & Design (locked) - 10 tracks
5. Business & Professional (locked) - 14 tracks
6. Data & Analytics (locked) - 9 tracks
7. Healthcare & Medical (locked) - 8 tracks

### Tracks in General AI Skills
1. **Prompt Engineering Fundamentals** (4 levels, 48 challenges)
   - Level 1: The Basics (12 challenges, 15 min)
   - Level 2: Core Principles (12 challenges, 20 min)
   - Level 3: Advanced Techniques (12 challenges, 25 min)
   - Level 4: Mastery (12 challenges, 30 min)

2. **AI Tool Mastery** (3 levels, 30 challenges)
   - Level 1: ChatGPT Basics (10 challenges, 15 min)
   - Level 2: Multi-Tool Proficiency (10 challenges, 20 min)
   - Level 3: Advanced Features (10 challenges, 25 min)

3. **Prompt Patterns Library** (3 levels, 24 challenges)
   - Level 1: Common Patterns (8 challenges, 15 min)
   - Level 2: Advanced Patterns (8 challenges, 20 min)
   - Level 3: Expert Patterns (8 challenges, 25 min)

### Practice Items
- 12 beginner-level challenges for Level 1
- Each challenge has 3 options: bad, almost, good
- Covers topics like blog posts, summaries, emails, lists, comparisons, etc.
- ELO ratings from 1050-1200 (beginner range)

## Troubleshooting

**Error: "Track not found"**
- Run `seedStarterDomain:seedStarterDomain` first

**Error: "No users found"**
- Create a user account by signing up through the app first

**Error: "Level 1 already has items"**
- Items are already seeded, you're good to go!

**Items not showing in practice zone**
- Make sure Convex dev server is running
- Check browser console for errors
- Verify items are linked to a level: `npx convex run debug:checkPracticeProjects`

## Next Steps

After seeding:
1. Navigate to `/practice` in the app
2. Select "General AI Skills" domain
3. Select "Prompt Engineering Fundamentals" track
4. Select "Level 1: The Basics"
5. Start practicing!

## Future Seeding

To add more levels:
1. Create a new seed file: `convex/seedLevel2Items.ts`
2. Follow the same pattern as `seedLevel1Items.ts`
3. Update the level number and difficulty range
4. Run the seed command

## Resetting Data

To clear all practice data and start fresh:

```bash
# Clear all practice items
npx convex run practiceItems:clearAll

# Clear all domains and tracks
# (No function exists yet - would need to create one)
```

**Warning:** This will delete all user progress!
