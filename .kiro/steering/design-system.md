---
inclusion: manual
---

# TrainingX.AI Design System

## 🎨 Color Palette

### Primary Brand Gradient
```css
--gradient-from: #0074B9; /* Deep Blue */
--gradient-to: #46BC61;   /* Fresh Green */
```
**Usage:** Hero sections, primary CTAs, major headings

### Solid Colors (Use these for most UI elements)

**Primary:**
- `#0074B9` - Primary Blue (buttons, links, active states)
- `#46BC61` - Success Green (achievements, completed states)

**Accent Colors:**
- `#8B5CF6` - Purple (special features, premium)
- `#F59E0B` - Amber (warnings, streaks, fire icons)
- `#EF4444` - Red (errors, penalties)
- `#06B6D4` - Cyan (info, secondary actions)

**Neutrals:**
- `#1E293B` - Dark Slate (sidebar, dark backgrounds)
- `#334155` - Slate (secondary backgrounds)
- `#64748B` - Gray (muted text)
- `#F1F5F9` - Light Gray (light backgrounds)
- `#FFFFFF` - White (cards, primary text on dark)

### Gamification Colors
- **XP/Points:** `#F59E0B` (Amber/Gold)
- **Streak:** `#EF4444` (Red/Fire)
- **Completion:** `#46BC61` (Green/Success)
- **Level Up:** `#8B5CF6` (Purple/Special)

---

## 🎯 Gradient Usage Rules

### ✅ USE GRADIENTS FOR:
1. Hero sections / Landing pages
2. Primary CTA buttons (sparingly)
3. Major section headers
4. Achievement badges (special moments)
5. Progress bars (subtle)

### ❌ AVOID GRADIENTS FOR:
1. Regular buttons (use solid colors)
2. Cards (use solid backgrounds)
3. Text (always solid)
4. Icons (solid colors)
5. Sidebar/Navigation
6. Form inputs
7. Most UI elements

**Rule of thumb:** If you see more than 2-3 gradients on screen, you're using too many.

---

## 🎮 Practice Zone Design

### Background
- **Main area:** Dark gradient `from-emerald-900 via-emerald-800 to-teal-900`
- **Cards:** Solid blue `#3B82F6` with subtle variations
- **Modals:** Dark slate `#1E293B` with blur

### Cards
- **Unanswered:** Solid blue gradient `from-blue-600 to-blue-800`
- **Completed:** Same card + green checkmark badge
- **Hover:** Scale + lift (no color change)

### Stats/HUD
- **Background:** Dark slate `#1E293B` with transparency
- **Borders:** Subtle white/20% opacity
- **Icons:** Colorful (trophy=amber, fire=red, star=cyan)
- **Text:** White primary, emerald-200 secondary

### Buttons
- **Primary:** Solid `#0074B9` (no gradient)
- **Secondary:** White/10% with white/20% border
- **Hover:** Increase opacity/brightness
- **Active:** Slight scale down

### Badges/Achievements
- **Completion checkmark:** Solid green `#46BC61` with white border
- **XP points:** Amber `#F59E0B` with glow
- **Streak:** Red `#EF4444` with fire icon
- **Level badges:** Purple `#8B5CF6` gradient (special moment)

---

## 🎨 Sidebar Design

### Background
- **Base:** Dark slate `#1E293B`
- **Active item:** Subtle blue `#0074B9` with 10% opacity
- **Hover:** White/5% overlay

### Navigation Items
- **Default:** Gray `#64748B`
- **Active:** Primary blue `#0074B9`
- **Hover:** White `#FFFFFF`
- **Icons:** Match text color

### Top Bar
- **Background:** Same as sidebar `#1E293B`
- **Logo:** Full color
- **User stats:** Inline, no gradient
  - Level: White text
  - XP: Amber `#F59E0B`
  - Progress bar: Blue `#0074B9` fill

---

## 📐 Spacing & Layout

### Card Spacing
- Grid gap: `1rem` (mobile), `1.5rem` (desktop)
- Card padding: `1rem`
- Modal padding: `1.5rem` to `2rem`

### Border Radius
- Cards: `0.5rem` (8px)
- Buttons: `0.5rem` (8px)
- Badges: `9999px` (full round)
- Modals: `0.75rem` (12px)

### Shadows
- Cards: `shadow-2xl` (large, dramatic)
- Modals: `shadow-2xl` with backdrop blur
- Buttons: `shadow-lg` on hover
- Badges: `shadow-lg` always

---

## ✨ Animation Principles

### Timing
- **Fast:** 150ms (hover states)
- **Normal:** 300ms (transitions)
- **Slow:** 600ms (page transitions)
- **Celebration:** 1500ms (XP, achievements)

### Easing
- **Hover:** `ease-out`
- **Click:** `ease-in-out`
- **Spring:** Use for playful elements (badges, cards)

### Effects
- **Hover:** Scale 1.05, lift -5px
- **Click:** Scale 0.95
- **Complete:** Particles burst, badge bounce, XP float
- **Shuffle:** Rotate + fade

---

## 🎯 Component Patterns

### Stats Display
```
┌──────────────────┐
│ 🏆 Score        │ ← Icon + Label (gray)
│    30           │ ← Large number (white)
│ ─────────────── │ ← Divider
│ 🔥 Streak       │
│    5x           │
└──────────────────┘
```
- Dark background with transparency
- Colorful icons (not gradient)
- White text for numbers
- Gray text for labels

### Progress Bar
```
━━━━━━━━░░░░░░░░ 45%
```
- Solid color fill (no gradient)
- Gray background
- Percentage on right
- Smooth animation

### Badge
```
  ┌─────┐
  │  ✓  │ ← Solid color
  └─────┘
   (glow)
```
- Solid background color
- White icon/text
- Subtle glow (same color, blurred)
- Round or slightly rounded

---

## 🚫 Don'ts

1. ❌ Don't use gradients on small elements
2. ❌ Don't mix too many colors in one section
3. ❌ Don't use gradient text (hard to read)
4. ❌ Don't animate everything (overwhelming)
5. ❌ Don't use different border radius styles
6. ❌ Don't use more than 3 colors per component
7. ❌ Don't use gradients for functional UI (buttons, inputs)

---

## ✅ Do's

1. ✅ Use solid colors for 90% of UI
2. ✅ Reserve gradients for special moments
3. ✅ Keep animations smooth and purposeful
4. ✅ Use consistent spacing
5. ✅ Make interactive elements obvious
6. ✅ Use color to communicate meaning (green=success, red=error)
7. ✅ Test on dark and light backgrounds

---

## 🎮 Gamification Guidelines

### Rewards (Use color + animation)
- **Small win:** Green checkmark + subtle glow
- **Medium win:** XP float + particles
- **Big win:** Badge + confetti + sound (future)

### Feedback
- **Success:** Green flash
- **Error:** Red shake
- **Progress:** Blue fill animation
- **Streak:** Fire icon pulse

### Hierarchy
1. **Most important:** Gradient or bright solid color
2. **Important:** Solid primary color
3. **Normal:** Neutral with subtle color
4. **Least important:** Gray

---

## 📱 Responsive Considerations

- Mobile: Reduce animations, simplify gradients
- Tablet: Full experience
- Desktop: Full experience + extra polish

---

**Last Updated:** 2024
**Version:** 1.0
