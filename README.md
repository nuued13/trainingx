# TrainingX.ai

AI-powered continuous learning platform for prompt engineering and AI skills development.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Convex (serverless backend)
- **Database:** Convex (built-in)
- **AI:** OpenAI API
- **Auth:** Convex Auth (GitHub, Google, Apple, Email/OTP, Password)

## Prerequisites

- Node.js >= 20.9.0
- npm >= 10.8.2
- Convex account (free tier works)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd trainingx
npm install
```

### 2. Set Up Environment Variables

Create `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
AI_EVAL_PROVIDER=openai
AUTH_RESEND_KEY=re_your-resend-key
AUTH_EMAIL=onboarding@yourdomain.com
AUTH_TWILIO_ACCOUNT_SID=your-twilio-account-sid
AUTH_TWILIO_AUTH_TOKEN=your-twilio-auth-token
AUTH_TWILIO_SERVICE_SID=your-twilio-service-sid
AUTH_TWILIO_FROM_NUMBER=+1234567890
AUTH_APPLE_SECRET=your-apple-secret
CONVEX_SITE_URL=https://your-app-domain.com
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your-elevenlabs-agent-id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Required:**
- `NEXT_PUBLIC_CONVEX_URL` - Get from Convex dashboard
- `OPENAI_API_KEY` - Required for AI features

**Optional:**
- Auth providers (Resend, Twilio, Apple) - Only if using those auth methods
- `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` - Only for voice chat feature

### 3. Set Up Convex

```bash
npx convex dev
```

This will:
- Create a new Convex project (if first time)
- Deploy the schema
- Start the Convex development server

Copy the `NEXT_PUBLIC_CONVEX_URL` from the output to your `.env.local`.

### 4. Seed Database

In Convex Dashboard:
1. Go to Functions tab
2. Find `practiceProjects:seedProjects`
3. Click Run
4. Paste contents of `data/projects-seed.json` as the `projects` argument
5. Click Run

Or use CLI:
```bash
npx convex run practiceProjects:seedProjects --arg projects="$(cat data/projects-seed.json)"
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
trainingx/
├── app/                    # Next.js app router pages
│   └── (routes)/           # Route pages
├── components/             # React components
├── convex/                 # Convex backend functions
│   ├── schema.ts           # Database schema
│   └── users.ts            # User management
├── lib/                    # Shared utilities
├── data/                   # Seed data and configs
└── public/                 # Static assets
```

## Key Features

- **Practice Zone:** Level-based prompt engineering challenges
- **Matching System:** Continuous AI career matching based on skills
- **Success Pathways:** AI career opportunities matched to your profile
- **Certificates:** Auto-issued certifications when requirements met
- **User Stats:** Real-time skill tracking across 11 competencies

## Development

### Running Locally

```bash
npm run dev          # Start Next.js dev server
npx convex dev       # Start Convex backend (in separate terminal)
```

### Building for Production

```bash
npm run build
npm start
```

### Database Seeding

See `QUICK_START.md` for detailed seeding instructions.

## Environment Variables

See `.env.example` (if exists) or the Quick Start section above for all required variables.

## Troubleshooting

### Practice page is empty
- Ensure database is seeded (see Step 4 above)
- Check Convex dashboard for `practiceProjects` table data

### Authentication not working
- Verify `NEXT_PUBLIC_CONVEX_URL` is set correctly
- Check Convex auth configuration in `convex/auth.config.ts`

### AI features not working
- Verify `OPENAI_API_KEY` is set
- Check API key has sufficient credits

## Documentation

- `QUICK_START.md` - Practice zone setup guide
- `README_PRACTICE_SETUP.md` - Practice system details
- `docs/` - Additional documentation

## License

Private - All rights reserved
