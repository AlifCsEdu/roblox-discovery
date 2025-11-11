/**
 * Test Search Functionality
 * Run: npx ts-node scripts/test-search.ts
 */

import { getRolimonsGames, classifyGenres, batchPlaceIdToUniverseId, getBatchGameVotes, calculateRating } from '../lib/roblox-api';
import { searchGames, type SearchableGame } from '../lib/utils/search';

async function testSearch() {
  console.log('\n🔍 Testing Search Functionality\n');
  
  // Step 1: Fetch games
  console.log('1️⃣ Fetching games from Rolimons...');
  const rolimonsGames = await getRolimonsGames();
  console.log(`✅ Fetched ${rolimonsGames.length} games\n`);
  
  // Step 2: Convert to searchable format
  console.log('2️⃣ Converting to searchable format...');
  const searchableGames: SearchableGame[] = rolimonsGames.map(game => ({
    placeId: game.placeId,
    name: game.name,
    playerCount: game.playerCount,
    thumbnailUrl: game.thumbnailUrl,
    genres: classifyGenres(game.name),
  }));
  console.log(`✅ Converted ${searchableGames.length} games\n`);
  
  // Step 3: Test search without rating filter
  console.log('3️⃣ Testing search: "blox" (no rating filter)...');
  const searchResults = searchGames(searchableGames, 'blox', {
    limit: 10,
    sortBy: 'relevance',
  });
  console.log(`✅ Found ${searchResults.length} results`);
  if (searchResults.length > 0) {
    console.log('   Top 3 results:');
    searchResults.slice(0, 3).forEach((game, i) => {
      console.log(`   ${i + 1}. ${game.name} (${game.playerCount} players)`);
    });
  }
  console.log('');
  
  // Step 4: Test search with rating filter
  console.log('4️⃣ Testing search: "simulator" WITH rating filter (80-100)...');
  const ratedSearchResults = searchGames(searchableGames, 'simulator', {
    minRating: 80,
    maxRating: 100,
    limit: 30, // Request more since rating filter will reduce
    sortBy: 'relevance',
  });
  console.log(`✅ Found ${ratedSearchResults.length} initial results (before fetching ratings)\n`);
  
  // Step 5: Fetch ratings for results (simulate API behavior)
  console.log('5️⃣ Fetching ratings for results...');
  const placeIds = ratedSearchResults.slice(0, 10).map(g => parseInt(g.placeId));
  const universeMap = await batchPlaceIdToUniverseId(placeIds);
  const universeIds = Array.from(universeMap.values());
  const votesMap = await getBatchGameVotes(universeIds);
  
  console.log(`✅ Got universe IDs for ${universeMap.size}/${placeIds.length} games`);
  console.log(`✅ Got votes for ${votesMap.size}/${universeIds.length} games\n`);
  
  // Step 6: Apply ratings and filter
  console.log('6️⃣ Applying ratings and filtering...');
  const gamesWithRatings = ratedSearchResults.slice(0, 10).map(game => {
    const universeId = universeMap.get(parseInt(game.placeId));
    const votes = universeId ? votesMap.get(universeId) : null;
    const rating = votes ? calculateRating(votes.upVotes, votes.downVotes) : null;
    
    return {
      ...game,
      rating,
      totalRatings: votes ? votes.upVotes + votes.downVotes : 0,
    };
  });
  
  console.log(`✅ All games with ratings:`);
  gamesWithRatings.forEach((game, i) => {
    console.log(`   ${i + 1}. ${game.name}: rating=${game.rating}, votes=${game.totalRatings}`);
  });
  console.log('');
  
  // Check if we have any valid ratings
  const hasAnyValidRatings = gamesWithRatings.some(g => g.rating !== null && g.rating > 0);
  console.log(`7️⃣ Has any valid ratings: ${hasAnyValidRatings}\n`);
  
  if (hasAnyValidRatings) {
    // Filter by rating
    const filtered = gamesWithRatings.filter(game => {
      if (game.rating === null || game.rating === 0) return false;
      return game.rating >= 80 && game.rating <= 100;
    });
    
    console.log(`✅ After rating filter (80-100): ${filtered.length} games`);
    if (filtered.length > 0) {
      console.log('   Filtered results:');
      filtered.forEach((game, i) => {
        console.log(`   ${i + 1}. ${game.name}: ${game.rating}% (${game.totalRatings} votes)`);
      });
    }
  } else {
    console.log('⚠️  No valid ratings found - rating filter would be skipped (as expected when API fails)');
  }
  
  console.log('\n✅ Search test complete!\n');
}

testSearch().catch(console.error);
