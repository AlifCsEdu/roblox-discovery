/**
 * Database Population Script
 * 
 * This script fetches popular Roblox games and populates the database.
 * Run with: npx tsx scripts/populate-db.ts
 */

import { createClient } from '@supabase/supabase-js';
import { getGameDetails, getGameVotes } from '../lib/noblox-client';

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Popular Roblox game IDs to seed the database
const POPULAR_GAME_IDS = [
  // Top tier games (>100K players)
  920587237,  // Adopt Me!
  2753915549, // Blox Fruits
  
  // Very popular (10K-100K players)
  606849621,  // Jailbreak
  142823291,  // Murder Mystery 2
  2041312716, // Brookhaven
  4924922222, // Brookhaven RP
  
  // Popular shooters/action (1K-50K)
  292439477,  // Phantom Forces
  286090429,  // Arsenal
  301549746,  // Counter Blox
  
  // Building/sandbox games
  537413528,  // Build A Boat For Treasure
  1537690962, // Bee Swarm Simulator
  
  // Survival/adventure
  189707,     // Natural Disaster Survival
  155615604,  // Prison Life
  1962086868, // Tower of Hell
  
  // Simulators
  734159876,  // Pet Simulator X
  2041312716, // Brookhaven
  
  // Fighting/PvP
  183364845,  // Speed Run 4
  1224212277, // Mad City
  891852901,  // Shindo Life
  
  // Obby/platformers
  1962086868, // Tower of Hell
  2677609345, // Mega Easy Obby
  
  // Social/RP
  4483381587, // Royale High
  
  // Horror
  2184151436, // Doors
  
  // Sports/racing
  569994010,  // Vehicle Simulator
  
  // Strategy
  286090429,  // Arsenal
];

// Map game titles to genres (since Roblox API doesn't provide genres)
const GENRE_MAPPING: { [key: string]: string[] } = {
  'phantom forces': ['Shooter', 'PvP'],
  'jailbreak': ['Adventure', 'RPG'],
  'natural disaster': ['Survival', 'Co-op'],
  'arsenal': ['Shooter', 'PvP'],
  'adopt me': ['Simulator', 'Co-op'],
  'blox fruits': ['RPG', 'Adventure'],
  'build a boat': ['Sandbox', 'Co-op'],
  'lucky blocks': ['PvP', 'Fighting'],
  'zombie': ['Shooter', 'Survival'],
  'mad city': ['Adventure', 'Action'],
  'bedwars': ['PvP', 'Strategy'],
  'murder mystery': ['Mystery', 'Social'],
  'brookhaven': ['Social', 'Roleplay'],
  'counter blox': ['Shooter', 'PvP'],
  'bee swarm': ['Simulator', 'Adventure'],
  'prison life': ['Roleplay', 'Adventure'],
  'tower of hell': ['Obby', 'Platformer'],
  'pet simulator': ['Simulator', 'Co-op'],
  'shindo life': ['Fighting', 'RPG'],
  'speed run': ['Obby', 'Racing'],
  'mega easy obby': ['Obby', 'Platformer'],
  'royale high': ['Roleplay', 'Social'],
  'doors': ['Horror', 'Adventure'],
  'vehicle simulator': ['Racing', 'Simulator'],
};

function getGenresForGame(title: string): string[] {
  const lowerTitle = title.toLowerCase();
  
  for (const [keyword, genres] of Object.entries(GENRE_MAPPING)) {
    if (lowerTitle.includes(keyword)) {
      return genres;
    }
  }
  
  // Default genres if no match
  return ['Adventure'];
}

function calculateRating(upVotes: number, downVotes: number): number {
  const total = upVotes + downVotes;
  if (total === 0) return 0;
  
  return Math.round((upVotes / total) * 100);
}

async function populateDatabase() {
  console.log('🚀 Starting database population...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const robloxId of POPULAR_GAME_IDS) {
    try {
      console.log(`📥 Fetching game ${robloxId}...`);
      
      // Fetch game details from Roblox
      const gameInfo = await getGameDetails(robloxId);
      
      // Fetch votes
      let rating = 85; // Default rating
      try {
        const votes = await getGameVotes(robloxId);
        rating = calculateRating(votes.upVotes, votes.downVotes);
      } catch (error) {
        console.log(`  ⚠️  Could not fetch votes, using default rating`);
      }

      // Only add games with 80%+ rating
      if (rating < 80) {
        console.log(`  ⏭️  Skipping ${gameInfo.name} (rating: ${rating}%)`);
        continue;
      }

      // Get genres
      const genres = getGenresForGame(gameInfo.name);

      // Prepare game data
      const gameData = {
        roblox_id: robloxId,
        title: gameInfo.name,
        description: gameInfo.description || `Play ${gameInfo.name} on Roblox`,
        creator: gameInfo.creator || 'Unknown',
        thumbnail_url: gameInfo.thumbnailUrl || null,
        rating,
        total_ratings: 1000,
        player_count_current: gameInfo.playing || 0,
        player_count_peak: Math.round((gameInfo.playing || 0) * 1.5),
        player_count_7d_avg: gameInfo.playing || 0,
        visits: gameInfo.visits || 0,
        favorite_count: Math.round((gameInfo.visits || 0) / 100),
        genres,
        is_active: true,
      };

      // Insert or update in database
      const { error } = await supabase
        .from('games')
        .upsert(gameData, { onConflict: 'roblox_id' });

      if (error) {
        console.error(`  ❌ Error inserting ${gameInfo.name}:`, error.message);
        errorCount++;
      } else {
        console.log(`  ✅ Added ${gameInfo.name} (${rating}% rating, ${genres.join(', ')})`);
        successCount++;
      }

      // Wait 1 second between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error: any) {
      console.error(`  ❌ Error processing game ${robloxId}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  ✅ Successfully added: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log('\n✨ Done!');
}

// Run the script
populateDatabase().catch(console.error);
