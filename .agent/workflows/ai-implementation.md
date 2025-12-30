---
description: AI implementation guidelines for TrainingX
---

# AI Implementation Rules

## Centralized AI Gateway

**All AI calls in this project MUST use the centralized AI gateway.**

### Required Usage

```typescript
import { callAI } from "../lib/ai";

const response = await callAI<MyType>(ctx, {
  feature: "my_feature_name",  // REQUIRED: identifies the feature in logs
  messages: [...],
  userId: userId,              // OPTIONAL: for user attribution
});
```

### Files

- **Gateway:** `convex/lib/ai.ts`
- **Schema:** `aiLogs` table in `convex/schema.ts`

### Rules

1. **NEVER** make direct API calls to OpenAI/Anthropic - use `callAI()` instead
2. **ALWAYS** specify a `feature` string to track costs by feature
3. If `callAI()` cannot handle a specific use case, discuss with the user first before implementing a workaround
4. New AI features automatically get cost tracking when using `callAI()`

### Feature Names (use lowercase_snake_case)

- `evaluation` - Practice prompt evaluation
- `career_coach` - Career coaching features
- `creator_studio` - AI content generation for creators
- `custom_gpt` - Custom GPT assistant interactions
- `matching` - AI career matching
- `assessment` - Assessment grading

### Convex Auth Note

When checking user identity in Convex:

- Use `getAuthUserId(ctx)` to get user ID
- Then lookup email from users table
- Do NOT rely on `identity.email` from `ctx.auth.getUserIdentity()` - it may be empty

### Special Case: careerCoach Files

The `convex/careerCoach/` files use Vercel AI SDK (`generateObject` from `ai` package)
instead of raw fetch calls. These cannot currently use `callAI()`.

**TODO**: Either:

1. Extend `callAI()` to support Vercel AI SDK patterns, or
2. Add manual logging calls after each `generateObject` call

Files affected:

- `convex/careerCoach/index.ts`
- `convex/careerCoach/opportunities.ts`
- `convex/careerCoach/roadmap.ts`
