# fCards - Flashcard Learning Platform

A modern, full-stack flashcard application built with Next.js, featuring AI-powered card generation, spaced repetition, and subscription-based access control.

## 🚀 Features

- **Flashcard Management**: Create, edit, and organize flashcard decks
- **AI-Powered Generation**: Generate flashcards using Hugging Face AI models (Pro feature)
- **Study Sessions**: Interactive study sessions with progress tracking
- **Subscription Tiers**: Free and Pro plans with feature gating via Clerk Billing
- **User Authentication**: Secure authentication with Clerk
- **Modern UI**: Beautiful, responsive interface built with shadcn/ui and Tailwind CSS

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **PostgreSQL database** (Neon recommended)
- **Clerk account** for authentication
- **Hugging Face account** (for AI features)

## 🛠️ Installation

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd fcards
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Hugging Face AI (for Pro features)
HUGGINGFACE_API_KEY=your_huggingface_api_key
HUGGINGFACE_MODEL=meta-llama/Meta-Llama-3-8B-Instruct

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

**⚠️ Security Note**: Never commit your `.env.local` file. It's already in `.gitignore`.

### Step 4: Database Setup

1. **Push schema to database**:
   ```bash
   npm run db:push
   ```

2. **Optional - Open Drizzle Studio** (database GUI):
   ```bash
   npm run db:studio
   ```

### Step 5: Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3001](http://localhost:3001)

## 📁 Project Structure

```
fcards/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── actions/           # Server actions
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── pricing/           # Pricing page
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   └── ui/               # shadcn/ui components
│   ├── db/                    # Database layer
│   │   ├── queries/          # Database query functions
│   │   └── schema.ts         # Drizzle ORM schema
│   ├── lib/                  # Utility functions
│   └── middleware.ts         # Next.js middleware
├── drizzle/                   # Database migrations
├── public/                    # Static assets
└── package.json
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server (port 3001)

# Production
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate migration files
npm run db:migrate   # Apply migrations
npm run db:studio    # Open Drizzle Studio

# Linting
npm run lint         # Run ESLint
```

## 🏗️ Architecture

### Data Flow

1. **Server Components** → Fetch data using query functions
2. **Client Components** → Display UI and handle interactions
3. **Server Actions** → Handle mutations (authenticate, validate, call queries)
4. **Query Functions** → Pure database operations with Drizzle ORM

### Key Patterns

- **Authentication**: All routes protected via Clerk middleware
- **Data Security**: Every query filters by `userId` to ensure data isolation
- **Feature Gating**: Uses Clerk Billing to check plan/feature access
- **Type Safety**: Zod schemas for validation, TypeScript for types
- **Database**: Drizzle ORM with PostgreSQL (Neon)

## 🔐 Security Checklist

✅ All API routes authenticate users  
✅ All database queries filter by `userId`  
✅ Environment variables never committed  
✅ No hardcoded secrets in codebase  
✅ Server-side validation with Zod  
✅ User data isolation enforced  

## 📦 Key Dependencies

- **Next.js 16** - React framework
- **Clerk** - Authentication & billing
- **Drizzle ORM** - Type-safe database queries
- **shadcn/ui** - UI component library
- **Framer Motion** - Animations
- **Vercel AI SDK** - AI integration
- **Tailwind CSS** - Styling

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Ensure all environment variables from `.env.local` are set in your deployment platform.

## 📝 Database Migrations

When modifying the schema:

1. Update `src/db/schema.ts`
2. Run `npm run db:push` (development) or `npm run db:generate` (production)
3. Commit migration files in `drizzle/` directory

## 🐛 Troubleshooting

### Build Errors

- Ensure all TypeScript types are correct
- Run `npm run build` to check for errors
- Clear `.next` folder and rebuild if needed

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database is accessible
- Ensure SSL mode is set if required

### Authentication Issues

- Verify Clerk keys are correct
- Check middleware configuration
- Ensure routes are properly protected

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [shadcn/ui Components](https://ui.shadcn.com)

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ using Next.js, Clerk, and Drizzle ORM**
