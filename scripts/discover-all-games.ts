/**
 * Comprehensive Game Discovery Script
 * 
 * This script discovers ALL Roblox games by scanning universe IDs
 * and adds them to the database regardless of rating.
 * 
 * Usage:
 *   npx tsx scripts/discover-all-games.ts [startId] [count]
 * 
 * Examples:
 *   npx tsx scripts/discover-all-games.ts           # Start from ID 1, fetch 10,000 games
 *   npx tsx scripts/discover-all-games.ts 100000 5000  # Start from 100000, fetch 5000
 */

import { createClient } from '@supabase/supabase-js';
import { getGameVotes } from '../lib/noblox-client';

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Configuration
const BATCH_SIZE = 50; // Roblox API supports up to 50 universe IDs per request
const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay to respect rate limits
const START_UNIVERSE_ID = parseInt(process.argv[2] || '1');
const GAMES_TO_DISCOVER = parseInt(process.argv[3] || '10000');

// Genre mapping (expanded)
const GENRE_MAPPING: { [key: string]: string[] } = {
  'phantom forces': ['Shooter', 'PvP'],
  'jailbreak': ['Adventure', 'RPG'],
  'natural disaster': ['Survival', 'Co-op'],
  'arsenal': ['Shooter', 'PvP'],
  'adopt me': ['Simulator', 'Co-op'],
  'blox fruits': ['RPG', 'Adventure'],
  'build a boat': ['Sandbox', 'Co-op'],
  'murder mystery': ['Mystery', 'Social'],
  'brookhaven': ['Social', 'Roleplay'],
  'counter blox': ['Shooter', 'PvP'],
  'bee swarm': ['Simulator', 'Adventure'],
  'prison': ['Roleplay', 'Adventure'],
  'tower of hell': ['Obby', 'Platformer'],
  'pet simulator': ['Simulator', 'Co-op'],
  'shindo': ['Fighting', 'RPG'],
  'ninja': ['Fighting', 'RPG'],
  'speed run': ['Obby', 'Racing'],
  'obby': ['Obby', 'Platformer'],
  'royale high': ['Roleplay', 'Social'],
  'doors': ['Horror', 'Adventure'],
  'vehicle': ['Racing', 'Simulator'],
  'simulator': ['Simulator'],
  'tycoon': ['Tycoon', 'Strategy'],
  'sword': ['Fighting', 'Action'],
  'warrior': ['Fighting', 'Action'],
  'fps': ['Shooter', 'PvP'],
  'shooter': ['Shooter'],
  'horror': ['Horror'],
  'scary': ['Horror'],
  'roleplay': ['Roleplay', 'Social'],
  'rpg': ['RPG'],
  'pvp': ['PvP'],
  'battle': ['Fighting', 'PvP'],
  'war': ['Fighting', 'PvP'],
  'racing': ['Racing'],
  'car': ['Racing', 'Simulator'],
  'survival': ['Survival'],
  'zombie': ['Shooter', 'Survival'],
  'fighting': ['Fighting'],
  'tower defense': ['Strategy', 'Tower Defense'],
  'defense': ['Strategy', 'Tower Defense'],
};

function getGenresForGame(title: string): string[] {
  const lowerTitle = title.toLowerCase();
  
  // Collect all matching genres
  const genres = new Set<string>();
  
  for (const [keyword, keywordGenres] of Object.entries(GENRE_MAPPING)) {
    if (lowerTitle.includes(keyword)) {
      keywordGenres.forEach(g => genres.add(g));
    }
  }
  
  // Default genre if no match
  if (genres.size === 0) {
    return ['Adventure'];
  }
  
  return Array.from(genres).slice(0, 3); // Max 3 genres per game
}

function calculateRating(upVotes: number, downVotes: number): number {
  const total = upVotes + downVotes;
  if (total === 0) return 0;
  
  return Math.round((upVotes / total) * 100);
}

/**
 * Fetch games from Roblox API in batch using universe IDs
 */
async function fetchGamesBatch(universeIds: number[]) {
  const url = `https://games.roblox.com/v1/games?universeIds=${universeIds.join(',')}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error: unknown) {
    console.error(`Error fetching batch:`, error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Main discovery function
 */
async function discoverGames() {
  console.log('🚀 Starting comprehensive game discovery...\n');
  console.log(`📊 Configuration:`);
  console.log(`   - Starting Universe ID: ${START_UNIVERSE_ID}`);
  console.log(`   - Games to discover: ${GAMES_TO_DISCOVER}`);
  console.log(`   - Batch size: ${BATCH_SIZE}\n`);

  let currentId = START_UNIVERSE_ID;
  let totalFetched = 0;
  let totalAdded = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  const endId = START_UNIVERSE_ID + GAMES_TO_DISCOVER;

  while (currentId < endId) {
    // Generate batch of universe IDs
    const batchIds: number[] = [];
    for (let i = 0; i < BATCH_SIZE && currentId < endId; i++) {
      batchIds.push(currentId++);
    }

    console.log(`\n📥 Fetching universe IDs ${batchIds[0]} - ${batchIds[batchIds.length - 1]}...`);
    
    // Fetch games for this batch
    const games = await fetchGamesBatch(batchIds);
    totalFetched += games.length;
    
    if (games.length === 0) {
      console.log(`   ⚠️  No games found in this batch`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      continue;
    }

    console.log(`   Found ${games.length} games`);

    // Process each game
    for (const gameInfo of games) {
      try {
        // Skip games with no players and no visits (likely abandoned)
        if (gameInfo.playing === 0 && gameInfo.visits < 100) {
          totalSkipped++;
          continue;
        }

        // Get rating (with fallback)
        let rating = 50; // Default neutral rating
        try {
          const votes = await getGameVotes(gameInfo.rootPlaceId);
          rating = calculateRating(votes.upVotes, votes.downVotes);
        } catch {
          // Use a heuristic based on favorites if votes fail
          const favoriteRatio = gameInfo.visits > 0 
            ? (gameInfo.favoritedCount / gameInfo.visits) * 100000
            : 50;
          rating = Math.min(95, Math.max(10, Math.round(favoriteRatio)));
        }

        // Get genres
        const genres = getGenresForGame(gameInfo.name);

        // Prepare game data
        const gameData = {
          roblox_id: gameInfo.rootPlaceId,
          title: gameInfo.name,
          description: gameInfo.description || `Play ${gameInfo.name} on Roblox`,
          creator: gameInfo.creator?.name || 'Unknown',
          thumbnail_url: null,
          rating,
          total_ratings: 1000,
          player_count_current: gameInfo.playing || 0,
          player_count_peak: Math.round((gameInfo.playing || 0) * 1.5),
          player_count_7d_avg: gameInfo.playing || 0,
          visits: gameInfo.visits || 0,
          favorite_count: gameInfo.favoritedCount || 0,
          genres,
          is_active: true,
        };

        // Insert or update in database
        const { error } = await supabase
          .from('games')
          .upsert(gameData, { onConflict: 'roblox_id' });

        if (error) {
          console.log(`     ❌ ${gameInfo.name}: ${error.message}`);
          totalErrors++;
        } else {
          totalAdded++;
          if (gameInfo.playing > 100) {
            console.log(`     ✅ ${gameInfo.name} (${gameInfo.playing} players, ${rating}%)`);
          }
        }

      } catch (error: unknown) {
        console.log(`     ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
        totalErrors++;
      }
    }

    // Progress update
    console.log(`\n📊 Progress: ${totalAdded} added, ${totalSkipped} skipped, ${totalErrors} errors`);
    console.log(`   Universe IDs scanned: ${currentId - START_UNIVERSE_ID} / ${GAMES_TO_DISCOVER}`);

    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
  }

  console.log('\n\n============================================================');
  console.log('📊 DISCOVERY COMPLETE');
  console.log('============================================================');
  console.log(`✅ Games added/updated: ${totalAdded}`);
  console.log(`⏭️  Games skipped (abandoned): ${totalSkipped}`);
  console.log(`❌ Errors: ${totalErrors}`);
  console.log(`📥 Total games fetched: ${totalFetched}`);
  console.log(`🔍 Universe IDs scanned: ${currentId - START_UNIVERSE_ID}`);
  console.log('============================================================\n');
}

// Run the discovery
discoverGames().catch(console.error);
