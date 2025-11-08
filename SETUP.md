# Development Setup Guide

This guide walks you through setting up the Roblox Discovery Platform for local development.

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- Git

## Step-by-Step Setup

### 1. Clone and Install

```bash
git clone <your-repo>
cd roblox-discovery
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in:
   - **Name**: `roblox-discovery` (or your preferred name)
   - **Database Password**: Save this somewhere safe
   - **Region**: Choose closest to you
4. Wait for project to finish setting up (~2 minutes)

### 3. Get Supabase Credentials

1. In your Supabase dashboard, click **Settings** (gear icon)
2. Go to **API** section
3. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - click "Reveal")

### 4. Configure Environment Variables

1. Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 5. Set Up Database

1. In Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file `supabase/migrations/001_initial_schema.sql` in your code editor
4. Copy the entire contents
5. Paste into the SQL Editor in Supabase
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned"

**What this does:**
- Creates 4 tables: `games`, `user_ratings`, `genres`, `search_logs`
- Adds indexes for fast queries
- Sets up Row Level Security (RLS)
- Populates genres table with 20 genres
- Creates triggers for auto-updating timestamps
- Enables full-text search

### 6. Enable Realtime

1. In Supabase dashboard, go to **Database** > **Replication**
2. Find the `games` table in the list
3. Toggle the switch to enable replication
4. Do the same for `user_ratings` table

**What this does:**
- Allows real-time subscriptions to table changes
- Enables live player count updates
- Allows instant rating updates

### 7. Verify Database Setup

1. Go to **Database** > **Tables** in Supabase
2. You should see 4 tables:
   - `games`
   - `user_ratings`
   - `genres`
   - `search_logs`
3. Click on `genres` table
4. You should see 20 rows with different game genres

### 8. Add Sample Data (Optional)

For testing, you can add sample games manually:

1. In Supabase, go to **Database** > **Tables** > `games`
2. Click **Insert** > **Insert row**
3. Fill in:
   ```
   roblox_id: 292439477 (Phantom Forces)
   title: Phantom Forces
   description: A first-person shooter game
   thumbnail_url: https://via.placeholder.com/400x300
   rating: 92
   player_count_current: 15000
   player_count_24h_peak: 25000
   player_count_7d_avg: 18000
   genres: {Shooter, PvP}
   is_active: true
   ```
4. Click **Save**
5. Add a few more games with different genres and ratings

### 9. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 10. Test the Features

**Homepage:**
- Should show trending games and hidden gems
- Search bar should work
- Click "Start Exploring" to go to explore page

**Explore Page:**
- Filter by genre (select multiple)
- Adjust minimum rating slider
- Change sort order
- Scroll down to trigger infinite scroll

**Game Detail Page:**
- Click on any game card
- Should show game details
- Player count should have a green pulsing dot (live updates)
- Related games shown at bottom

**Genre Pages:**
- Click on a genre badge
- Should filter games to that genre only

## Troubleshooting

### "Error: No data found" on homepage

**Cause:** No games in database
**Solution:** Add sample games (see step 8)

### "Realtime not working"

**Cause:** Replication not enabled
**Solution:** 
1. Go to Database > Replication in Supabase
2. Enable for `games` and `user_ratings`
3. Refresh your app

### "API Error: Invalid API key"

**Cause:** Wrong environment variables
**Solution:**
1. Double-check `.env.local` values
2. Restart dev server (`npm run dev`)
3. Clear browser cache

### Build errors with Tailwind

**Cause:** Tailwind v4 uses different syntax
**Solution:** Make sure you're using `@tailwindcss/postcss` in devDependencies

### TypeScript errors

**Cause:** Supabase types might be outdated
**Solution:**
```bash
npx supabase gen types typescript --project-id your-project-id > types/database.ts
```

## Next Steps

After setup is complete, you can:

1. **Populate with Real Data:**
   - Create a script to fetch games from Roblox API
   - Use `lib/noblox-client.ts` functions
   - Insert into database

2. **Customize:**
   - Modify genres in `constants/genres.ts`
   - Adjust rating thresholds
   - Add new features

3. **Deploy:**
   - See main README for deployment instructions
   - Use Vercel for easiest setup

## Development Workflow

```bash
# Start dev server
npm run dev

# Run linter
npm run lint

# Build for production (test locally)
npm run build
npm start
```

## File Watching

The dev server watches these directories:
- `/app` - Page routes
- `/components` - React components
- `/lib` - Utilities and API
- `/types` - TypeScript types
- `app/globals.css` - Tailwind styles

Changes are hot-reloaded automatically.

## Database Changes

When you need to modify the schema:

1. Make changes in Supabase SQL Editor
2. Test thoroughly
3. Save the SQL to a new migration file:
   ```
   supabase/migrations/002_your_change.sql
   ```
4. Commit to version control

## Need Help?

- Check the main [README.md](./README.md)
- Review Supabase docs: https://supabase.com/docs
- Check Next.js docs: https://nextjs.org/docs
- Open an issue on GitHub
