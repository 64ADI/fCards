# fCards

A flashcard app built with Next.js. Create decks, study with spaced repetition, and generate cards with AI (if you're on the Pro plan).

## What it does

- Create and manage flashcard decks
- Study sessions with progress tracking
- AI-powered flashcard generation (Pro feature via Hugging Face)
- Free tier with limits, Pro tier with unlimited everything
- Authentication handled by Clerk

## Getting started

You'll need Node.js 18+ and a PostgreSQL database (I use Neon, but any Postgres works).

### 1. Clone and install

```bash
git clone <your-repo-url>
cd fcards
npm install
```

### 2. Set up environment variables

Create a `.env.local` file:

```env
DATABASE_URL=your_postgresql_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
HUGGINGFACE_MODEL=meta-llama/Meta-Llama-3-8B-Instruct
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
### 3. Set up the database

Push the schema to your database:

```bash
npm run db:push
```

If you want to explore the database visually, you can run:

```bash
npm run db:studio
```

### 4. Run it

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3000) in your browser.

## Project structure

Pretty standard Next.js App Router setup:

- `src/app/` - Pages and routes
- `src/app/actions/` - Server actions for mutations
- `src/components/` - React components (UI stuff in `components/ui/`)
- `src/db/queries/` - Database query functions
- `src/db/schema.ts` - Database schema
- `drizzle/` - Migration files

## How it works

The app follows a pretty straightforward pattern:

1. Server components fetch data using functions in `db/queries/`
2. Client components handle UI and user interactions
3. Server actions (in `app/actions/`) handle mutations - they authenticate, validate with Zod, then call the query functions
4. All database queries filter by `userId` to keep data isolated

Authentication is handled by Clerk middleware, and feature gating uses Clerk Billing to check if users have the right plan/features.

## Tech stack

- Next.js 16 (App Router)
- Clerk (auth + billing)
- Drizzle ORM (database)
- shadcn/ui (components)
- Framer Motion (animations)
- Tailwind CSS (styling)

## License

MIT License - see [LICENSE](LICENSE) for details.
