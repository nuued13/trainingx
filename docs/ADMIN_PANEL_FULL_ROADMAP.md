# TrainingX Admin Panel - Comprehensive Design

A professional, long-term thinking admin panel to give you complete visibility into every aspect of your platform from all stakeholder perspectives.

---

## 🎯 Executive Summary

After analyzing your platform (30+ data tables, Elo-based adaptive learning, multi-player duels, creator studio, quests/seasons, referrals), I'm proposing a **command-center style admin panel** with 9 key modules organized by stakeholder perspective.

---

## 📊 Proposed Admin Panel Modules

### 1. **Dashboard Overview** (Executive View)

The "war room" snapshot for quick decision-making.

| Metric                              | Data Source                                    | Why It Matters       |
| ----------------------------------- | ---------------------------------------------- | -------------------- |
| Total Users / Growth                | `users` table                                  | Acquisition health   |
| Daily/Weekly Active Users (DAU/WAU) | `practiceAttempts`, `userStats.lastActiveDate` | Engagement pulse     |
| Retention Curves (D1, D7, D30)      | User activity timestamps                       | Long-term stickiness |
| Revenue/Costs (if monetized)        | Future payments + `aiEvaluationLogs.cost`      | Unit economics       |
| AI Evaluation Spend                 | `aiEvaluationLogs`                             | Cost control         |
| Content Health Score                | Moderation flags, completion rates             | Quality at a glance  |

**Key Charts:**

- User growth over time (cohort analysis)
- DAU/MAU ratio trend
- AI cost per active user trend

---

### 2. **User Analytics** (Deep User Understanding)

#### 2.1 User Lifecycle Metrics

| Metric                     | Source                                     | Insight                  |
| -------------------------- | ------------------------------------------ | ------------------------ |
| Signup → First Practice    | `users._creationTime` → `practiceAttempts` | Activation friction      |
| Time to First Duel         | `users._creationTime` → `practiceDuels`    | Social feature adoption  |
| Assessment Completion Rate | `userStats.assessmentComplete`             | Onboarding effectiveness |
| Skill Progression Curves   | `userStats.skills`, `practiceUserSkills`   | Learning velocity        |

#### 2.2 User Segments

| Segment         | Definition                           | Actions                     |
| --------------- | ------------------------------------ | --------------------------- |
| Power Users     | Top 10% by `totalScore`, streaks > 7 | Beta features, testimonials |
| At-Risk         | Active > 3 days ago, streak broken   | Win-back campaigns          |
| Creators        | `creatorDrafts` count > 0            | Creator program             |
| Social Players  | High duel participation              | Community features          |
| Silent Learners | Practice only, no community          | Community nudges            |

#### 2.3 Individual User Deep-Dive

- Full activity timeline
- Skill radar chart progression
- Practice attempt history with AI feedback
- Duel history & win rates
- Badges & achievements earned
- Community contributions
- Referral activity

---

### 3. **Content Analytics** (Learning Content Health)

#### 3.1 Practice Items Performance

| Metric                         | Source                                                               | Why Track               |
| ------------------------------ | -------------------------------------------------------------------- | ----------------------- |
| Elo Distribution               | `practiceItems.elo`                                                  | Difficulty calibration  |
| Elo Convergence Rate           | `practiceItems.eloDeviation`                                         | Item maturity           |
| Completion Rates               | `practiceAttempts`                                                   | Engagement quality      |
| Drop-off Points                | Incomplete `practiceAttempts`                                        | Problem identification  |
| Average Time vs Expected       | `practiceAttempts.timeMs` vs `practiceItemTemplates.recommendedTime` | Content calibration     |
| Correct/Incorrect Distribution | `practiceAttempts.correct`                                           | Difficulty verification |

#### 3.2 Projects & Tracks

| Metric                    | Source                                      | Insight                 |
| ------------------------- | ------------------------------------------- | ----------------------- |
| Project completion funnel | `practiceAttempts` by project               | Content effectiveness   |
| Track popularity          | Attempt counts by `practiceTracks`          | Content demand          |
| Skill coverage gaps       | `practiceItemTemplates.skills` distribution | Curriculum completeness |

#### 3.3 Content Alerts

- Items with high drop-off (> 50%)
- Items never completed
- Items with Elo deviation > 200 (unstable)
- Items flagged for moderation

---

### 4. **Creator Studio Analytics** (UGC Health)

#### 4.1 Creator Pipeline

| Stage             | Status Filter                                        | Track            |
| ----------------- | ---------------------------------------------------- | ---------------- |
| Drafts            | `creatorDrafts.status = "draft"`                     | Work in progress |
| Pending Review    | `status = "pending"`                                 | Review backlog   |
| In Calibration    | `status = "calibrating"` + `practiceCalibrationRuns` | Quality testing  |
| Published         | `status = "published"`                               | Live content     |
| Rejected/Archived | `status = "rejected"` or `"archived"`                | Quality gates    |

#### 4.2 Creator Leaderboard

| Metric                | Source                                 |
| --------------------- | -------------------------------------- |
| Total items published | `creatorProfiles.stats.publishedItems` |
| Total plays           | `creatorProfiles.stats.totalPlays`     |
| Average rating        | `creatorProfiles.stats.averageRating`  |
| Adoption rate         | `creatorProfiles.stats.adoptionRate`   |
| Remix count           | `creatorProfiles.stats.remixCount`     |

#### 4.3 Review Queue

- Items pending review with preview
- Quick approve/reject with templates
- Bulk actions for moderation

---

### 5. **Engagement & Gamification** (Retention Levers)

#### 5.1 Streaks & Daily Drills

| Metric                   | Source                                     |
| ------------------------ | ------------------------------------------ |
| Streak distribution      | `practiceStreaks.currentStreak`            |
| Streak recovery rate     | `practiceStreaks.repairTokens` usage       |
| Daily drill completion % | `practiceDailyDrills.status = "completed"` |
| Best times of day        | Timestamps analysis                        |

#### 5.2 Duels Performance

| Metric               | Source                              |
| -------------------- | ----------------------------------- |
| Daily duel count     | `practiceDuels` by date             |
| Avg players per duel | `practiceDuels.participants.length` |
| Duel completion rate | `status = "completed"` / total      |
| Popular duel times   | Timestamp patterns                  |
| Matchmaking fairness | Win rate distribution               |

#### 5.3 Quests & Seasons

| Metric                     | Source                                  |
| -------------------------- | --------------------------------------- |
| Active quest participation | `practiceUserQuests` count              |
| Quest completion rates     | `status = "completed"`                  |
| Season engagement          | `practiceSeasons.participantCount`      |
| Reward claim rates         | `practiceUserQuests.claimedAt` presence |

---

### 6. **Community Health** (Social Features)

#### 6.1 Posts & Engagement

| Metric                  | Source                        |
| ----------------------- | ----------------------------- |
| Posts per day           | `posts.createdAt`             |
| Avg engagement per post | `posts.upvotes + comments`    |
| Top contributors        | `userStats.communityActivity` |
| Unanswered questions    | Posts with 0 replies          |

#### 6.2 Moderation Dashboard

| Queue              | Source                                       | Priority    |
| ------------------ | -------------------------------------------- | ----------- |
| Pending Flags      | `practiceModerationFlags.status = "pending"` | 🔴 High     |
| In Review          | `status = "reviewing"`                       | 🟡 Medium   |
| Recent Resolutions | Last 7 days resolved                         | Audit trail |

---

### 7. **AI Operations** (Cost & Performance)

#### 7.1 Cost Tracking

| Metric                             | Source                             |
| ---------------------------------- | ---------------------------------- |
| Total spend (daily/weekly/monthly) | `aiEvaluationLogs.cost`            |
| Cost per evaluation                | Aggregated                         |
| Cost per active user               | Total cost / DAU                   |
| Token usage breakdown              | `promptTokens`, `completionTokens` |

#### 7.2 Performance Metrics

| Metric              | Source                       |
| ------------------- | ---------------------------- |
| Average latency     | `aiEvaluationLogs.latencyMs` |
| Success rate        | `aiEvaluationLogs.success`   |
| Error patterns      | `errorMessage` analysis      |
| Provider comparison | By `provider` field          |

#### 7.3 Alerts

- Cost spike detection
- Latency degradation
- Error rate increase

---

### 8. **Growth & Referrals** (Acquisition)

#### 8.1 Referral Program

| Metric                 | Source                         |
| ---------------------- | ------------------------------ |
| Total referral codes # | `practiceReferrals` count      |
| Conversion rate        | `status = "completed"` / total |
| Top referrers          | By `referrerId`                |
| Reward distribution    | `rewards` field                |

#### 8.2 Share Cards

| Metric            | Source                             |
| ----------------- | ---------------------------------- |
| Cards generated   | `practiceShareCards` count by type |
| View counts       | `viewCount`                        |
| Viral coefficient | Views / cards generated            |

---

### 9. **System Health** (Platform Operations)

#### 9.1 Feature Flags

- Toggle UI connected to `featureFlags` table
- Quick enable/disable with audit log
- Percentage rollouts (future)

#### 9.2 Data Integrity

| Check              | Description             |
| ------------------ | ----------------------- |
| Orphaned records   | userStats without users |
| Invalid references | Broken foreign keys     |
| Stale data         | Old unfinished attempts |

---

## 🏗️ Technical Implementation

### Backend (Convex Functions)

#### [NEW] `convex/admin.ts`

Main admin query/mutation file with role-based access control.

**Key Functions:**

```typescript
// Dashboard overview
getAdminDashboardStats()

// User analytics
getUserGrowthMetrics(days: number)
getUserSegments()
getUserDetails(userId: Id<"users">)

// Content analytics
getContentHealthMetrics()
getItemPerformance(itemId?: Id<"practiceItems">)
getProjectFunnels()

// Creator studio
getCreatorPipeline()
getReviewQueue(limit: number)
approveContent(draftId: Id<"creatorDrafts">)
rejectContent(draftId: Id<"creatorDrafts">, reason: string)

// Engagement
getStreakDistribution()
getDuelAnalytics(days: number)
getQuestAnalytics()

// Community
getCommunityHealth()
getModerationQueue()

// AI Operations
getAIOperationsMetrics(days: number)

// Growth
getReferralAnalytics()
getShareCardMetrics()

// System
getFeatureFlags()
updateFeatureFlag(key: string, enabled: boolean)
```

#### [MODIFY] `convex/schema.ts`

Add admin role to users or create admin users table:

```typescript
adminUsers: defineTable({
  userId: v.id("users"),
  role: v.string(), // "super_admin" | "moderator" | "analyst"
  permissions: v.array(v.string()),
  createdAt: v.number(),
});
```

---

### Frontend (Next.js App)

#### [NEW] `app/(routes)/admin/page.tsx`

Main admin dashboard with overview cards and charts.

#### [NEW] `app/(routes)/admin/users/page.tsx`

User analytics with search, filters, segments.

#### [NEW] `app/(routes)/admin/content/page.tsx`

Content health dashboard with item drilldowns.

#### [NEW] `app/(routes)/admin/creators/page.tsx`

Creator studio management and review queue.

#### [NEW] `app/(routes)/admin/engagement/page.tsx`

Streaks, duels, quests, seasons analytics.

#### [NEW] `app/(routes)/admin/community/page.tsx`

Community health and moderation.

#### [NEW] `app/(routes)/admin/ai-ops/page.tsx`

AI cost tracking and performance.

#### [NEW] `app/(routes)/admin/growth/page.tsx`

Referrals and viral metrics.

#### [NEW] `app/(routes)/admin/settings/page.tsx`

Feature flags and system health.

#### [NEW] `components/admin/`

Reusable admin components:

- `AdminLayout.tsx` - Sidebar navigation
- `StatsCard.tsx` - Metric display cards
- `DataTable.tsx` - Sortable, filterable tables
- `Charts.tsx` - Recharts wrappers for consistent styling
- `UserDetails.tsx` - User deep-dive modal
- `ReviewQueue.tsx` - Content review interface

---

## 🎨 UI/UX Design

### Design Philosophy

- **Dark mode first** - Reduces eye strain for heavy dashboard use
- **Information hierarchy** - Most critical metrics at top
- **Drill-down navigation** - Click any metric to explore deeper
- **Real-time updates** - Convex subscriptions for live data
- **Responsive tables** - Work on any screen size

### Color Coding

| Color     | Meaning                   |
| --------- | ------------------------- |
| 🟢 Green  | Healthy, positive trend   |
| 🟡 Yellow | Warning, needs attention  |
| 🔴 Red    | Critical, action required |
| 🔵 Blue   | Informational, neutral    |

---

## 🔒 Security

### Access Control

1. **Role-based access** - Different views for super_admin vs moderator
2. **Audit logging** - Track all admin actions
3. **IP allowlisting** (optional) - Restrict admin access
4. **2FA requirement** (optional) - Extra security

---

## 📈 Long-term Roadmap

### Phase 1 (MVP)

- Dashboard overview
- User analytics (basic)
- Content health
- AI cost tracking

### Phase 2

- Creator studio management
- Moderation queue
- Engagement metrics

### Phase 3

- Advanced user segments
- A/B testing dashboard
- Revenue analytics (when monetized)
- Automated alerts/notifications

### Phase 4

- Predictive analytics (churn prediction)
- LTV modeling
- Content recommendations engine dashboard

---

## Verification Plan

### Manual Testing

1. **Authentication**: Verify only admin users can access `/admin` routes
2. **Data accuracy**: Cross-check displayed metrics with raw database queries
3. **Real-time updates**: Verify charts update when new data is inserted
4. **Responsive design**: Test on mobile, tablet, and desktop

### Automated Testing

- Unit tests for admin Convex functions
- Integration tests for data aggregation accuracy

---

## User Review Required

> [!IMPORTANT] > **Before proceeding, I need your input on:**
>
> 1. **Which modules are highest priority?** I can phase the implementation.
> 2. **Do you need a separate admin user system?** Or can we use email allowlist?
> 3. **Any specific metrics you care about most?** I can prioritize those.
> 4. **Design preferences?** Dark/light mode, specific component library?
> 5. **Real-time vs. periodic refresh?** Convex supports real-time, but adds complexity.

---

## Summary

This admin panel will give you complete visibility into:

- **Users**: Who they are, how they're progressing, who's at risk
- **Content**: What's working, what's broken, calibration status
- **Creators**: UGC pipeline health, review queue management
- **Engagement**: Gamification effectiveness, social features health
- **Costs**: AI spend tracking and optimization opportunities
- **Growth**: Referral program effectiveness, viral metrics

Ready to build this when you approve the approach!
