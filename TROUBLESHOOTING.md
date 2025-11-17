# Troubleshooting - Practice Zone Issues

## Issue: "Loading practice cards..." stuck

### Cause
The browser cache or Convex dev server hasn't picked up the new data/code.

### Solution

#### Step 1: Refresh the Browser
```
Press: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```
This does a hard refresh and clears the cache.

#### Step 2: Check Convex Dev Server
Make sure it says "Convex functions ready!" in the terminal:
```
✔ 16:50:07 Convex functions ready! (17.9s)
```

#### Step 3: Verify Data Was Seeded
```bash
npx convex run debug:checkPhase1Status
```

Should show:
```
itemsSeeded: true
tracksSeeded: true
```

#### Step 4: Check Browser Console
Open DevTools (F12) and check Console tab for errors.

You should see debug logs like:
```
PracticeCardDeck Debug: {
  levelId: "...",
  userId: "...",
  practiceItems: [...],
  itemsCount: 12
}
```

---

## Issue: "No challenges found"

### Cause
The items weren't seeded or weren't linked to the level.

### Solution

#### Step 1: Verify Items Exist
```bash
npx convex run debug:checkPhase1Status
```

Check that `itemsSeeded: true`

#### Step 2: Re-seed if Needed
```bash
npx convex run seedLevel1Items:createLevel1Items
```

#### Step 3: Refresh Browser
Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

---

## Issue: Console Shows Errors

### Common Errors

**"Level not found"**
- Make sure you ran `npx convex run seedStarterDomain:seedStarterDomain` first
- This creates the domain/track/level structure

**"No users found"**
- Sign up or log in first
- The seeding function needs a user account

**"Query failed"**
- Check Convex dashboard for errors
- Restart Convex dev server: `npx convex dev`

---

## Complete Troubleshooting Checklist

- [ ] Convex dev server running (`npx convex dev`)
- [ ] App running (`npm run dev`)
- [ ] Browser hard refreshed (Ctrl+Shift+R)
- [ ] Logged in to app
- [ ] Seeded domains (`npx convex run seedStarterDomain:seedStarterDomain`)
- [ ] Seeded items (`npx convex run seedLevel1Items:createLevel1Items`)
- [ ] No console errors (F12 → Console)
- [ ] Convex shows "functions ready"

---

## Debug Steps

### 1. Check Convex Status
```bash
npx convex run debug:checkPhase1Status
```

Expected output:
```
{
  phase1Tables: {
    items: 12,
    tracks: 3,
    templates: 1,
    ...
  },
  status: {
    itemsSeeded: true,
    tracksSeeded: true,
    templatesSeeded: true
  }
}
```

### 2. Check Browser Console
Open DevTools (F12) and look for:
- Debug logs from PracticeCardDeck
- Any error messages
- Network errors

### 3. Check Convex Dashboard
- Go to Convex dashboard
- Check practiceItems table
- Verify items have `levelId` set
- Verify items have `type` and `category` fields

### 4. Restart Everything
```bash
# Stop Convex
Ctrl+C

# Stop app
Ctrl+C

# Restart Convex
npx convex dev

# In another terminal, restart app
npm run dev

# Hard refresh browser
Ctrl+Shift+R
```

---

## If Still Stuck

### Option 1: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty cache and hard refresh"

### Option 2: Clear Convex Local Data
```bash
# Stop Convex
Ctrl+C

# Remove local data
rm -rf .convex

# Restart
npx convex dev
```

### Option 3: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for failed requests
5. Check response for errors

---

## Expected Behavior

### When Everything Works

1. Navigate to `/practice`
2. Select "General AI Skills" domain
3. Select "Prompt Engineering Fundamentals" track
4. Select "Level 1: The Basics"
5. See 12 challenge cards
6. Click a card
7. See question and 3 options
8. Rate the prompt
9. See feedback animation
10. Progress bar updates

### Loading States

- **"Loading practice cards..."** - Fetching data from Convex
- **"No challenges found"** - Items weren't seeded or linked

---

## Quick Fixes

| Issue | Fix |
|-------|-----|
| Stuck loading | Hard refresh (Ctrl+Shift+R) |
| No items | Run `npx convex run seedLevel1Items:createLevel1Items` |
| No tracks | Run `npx convex run seedStarterDomain:seedStarterDomain` |
| Console errors | Check Convex dev server output |
| Still broken | Restart everything (Convex + app + browser) |

---

## Getting Help

If you're still stuck:

1. **Check console** (F12 → Console tab)
2. **Check Convex output** (terminal running `npx convex dev`)
3. **Run debug command** (`npx convex run debug:checkPhase1Status`)
4. **Restart everything** (Convex, app, browser)
5. **Re-seed data** (`npx convex run seedLevel1Items:createLevel1Items`)

---

**Most Common Fix**: Hard refresh the browser (Ctrl+Shift+R)
