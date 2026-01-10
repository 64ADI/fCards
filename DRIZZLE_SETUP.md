# Drizzle ORM Setup - Complete! ✓

Drizzle ORM has been successfully installed and configured with your Neon PostgreSQL database.

## 📁 Project Structure

```
fcards/
├── drizzle/                    # Migration files (auto-generated)
├── src/
│   ├── db/
│   │   ├── schema.ts          # Database schema definitions
│   │   ├── index.ts           # Database connection export
│   │   └── queries/
│   │       └── deck-queries.ts # Database query functions
│   └── app/
│       └── dashboard/
│           └── page.tsx       # Dashboard using query functions
├── drizzle.config.ts          # Drizzle Kit configuration
├── .env                       # Environment variables (configured)
└── package.json               # Updated with database scripts
```

## 🔑 Environment Setup

Database URL is configured in `.env`:

```env
DATABASE_URL=your_database_connection_string_here
```

**⚠️ Security Note:** Never commit your `.env` file or expose your database credentials. The `.env` file is already in `.gitignore`.

## 📦 Installed Packages

### Dependencies
- `drizzle-orm` - ORM library
- `@neondatabase/serverless` - Neon database driver
- `dotenv` - Environment variable management

### Dev Dependencies
- `drizzle-kit` - Database migration tool
- `tsx` - TypeScript execution

## 🚀 Available Commands

```bash
# Push schema changes directly to database (quick for development)
npm run db:push

# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## 📊 Database Schema

The schema includes flashcard-related tables:

```typescript
// Decks table - represents a collection of flashcards
export const decksTable = pgTable("decks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 }).notNull(), // Clerk user ID
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Cards table - individual flashcards within a deck
export const cardsTable = pgTable("cards", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deckId: integer().notNull().references(() => decksTable.id, { onDelete: "cascade" }),
  front: text().notNull(),
  back: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
```

## 💻 Usage Examples

### Database Query Functions Pattern

All database operations use helper functions in `src/db/queries/`:

```typescript
// db/queries/deck-queries.ts
import { db } from '@/db';
import { decksTable } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// Fetch all decks for a user
export async function getUserDecks(userId: string) {
  return await db.select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(desc(decksTable.updatedAt));
}

// Create a new deck
export async function createDeck(userId: string, name: string, description?: string) {
  const [newDeck] = await db.insert(decksTable)
    .values({ userId, name, description })
    .returning();
  return newDeck;
}
```

### Using in Server Components

```typescript
// app/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server';
import { getUserDecks } from '@/db/queries/deck-queries';

export default async function DashboardPage() {
  const { userId } = await auth();
  const decks = await getUserDecks(userId);
  // ...
}
```

## 📝 Next Steps

1. **Modify the schema** in `src/db/schema.ts` to match your needs
2. **Push changes** with `npm run db:push`
3. **Use in your app** by importing `db` from `@/db`

## 🔧 Adding New Tables

1. Add table definition to `src/db/schema.ts`:
```typescript
export const newTable = pgTable("new_table", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 }).notNull(), // Clerk user ID
  // ... your fields
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
```

2. Create query functions in `src/db/queries/new-queries.ts`

3. Push to database:
```bash
npm run db:push
```

## 📚 Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Neon Documentation](https://neon.tech/docs)
- [Drizzle with Next.js](https://orm.drizzle.team/docs/get-started-postgresql#nextjs)

## ✅ Setup Status

- ✅ Packages installed
- ✅ Database connection configured
- ✅ Schema created
- ✅ Config file created
- ✅ Schema pushed to database
- ✅ Query functions pattern implemented
- ✅ Clerk authentication integrated

