/**
 * Test the real-time Roblox API with correct universe IDs
 */

import { getPopularGames, getEnrichedGame, POPULAR_UNIVERSE_IDS } from '@/lib/roblox-api';

async function main() {
  console.log('Testing real-time Roblox API...\n');
  console.log(`Fetching popular games (universe IDs: ${POPULAR_UNIVERSE_IDS.join(', ')})\n`);
  
  try {
    // Test 1: Get popular games
    console.log('=== Test 1: Get Popular Games ===');
    const games = await getPopularGames(8);
    console.log(`Fetched ${games.length} games:\n`);
    
    games.forEach((game, index) => {
      console.log(`${index + 1}. ${game.name}`);
      console.log(`   Universe ID: ${game.id}`);
      console.log(`   Place ID: ${game.rootPlaceId}`);
      console.log(`   Creator: ${game.creator.name}`);
      console.log(`   Players: ${game.playing.toLocaleString()}`);
      console.log(`   Visits: ${game.visits.toLocaleString()}`);
      console.log(`   Favorites: ${game.favoritedCount.toLocaleString()}`);
      console.log('');
    });
    
    // Test 2: Get enriched game with rating
    if (games.length > 0) {
      console.log('\n=== Test 2: Get Enriched Game (with rating) ===');
      const firstGame = games[0];
      console.log(`Fetching details for: ${firstGame.name}\n`);
      
      const enrichedGame = await getEnrichedGame(parseInt(firstGame.id));
      
      if (!enrichedGame) {
        console.log('❌ Game not found');
        return;
      }
      
      console.log(`Game: ${enrichedGame.name}`);
      console.log(`Rating: ${enrichedGame.rating}%`);
      console.log(`Players: ${enrichedGame.playing.toLocaleString()}`);
    }
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
