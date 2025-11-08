/**
 * Convert place IDs to universe IDs for the curated popular games list
 */

const PLACE_IDS = [
  4924922222, // Brookhaven
  2753915549, // Blox Fruits
  920587237,  // Adopt Me
  142823291,  // Murder Mystery 2
  1537690962, // Bee Swarm Simulator
  606849621,  // Jailbreak
  286090429,  // Arsenal
  2317712696, // Anime Defenders
];

async function convertPlaceToUniverse(placeId: number): Promise<number | null> {
  const url = `https://apis.roblox.com/universes/v1/places/${placeId}/universe`;
  const response = await fetch(url);
  
  if (!response.ok) {
    console.error(`Failed to convert place ID ${placeId}: ${response.status}`);
    return null;
  }
  
  const data = await response.json();
  return data.universeId || null;
}

async function main() {
  console.log('Converting place IDs to universe IDs...\n');
  
  const conversions: { placeId: number; universeId: number | null }[] = [];
  
  for (const placeId of PLACE_IDS) {
    const universeId = await convertPlaceToUniverse(placeId);
    conversions.push({ placeId, universeId });
    console.log(`Place ID ${placeId} -> Universe ID ${universeId}`);
    
    // Rate limit: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n\nUpdated POPULAR_UNIVERSE_IDS array:');
  console.log('export const POPULAR_UNIVERSE_IDS = [');
  conversions.forEach(({ universeId, placeId }) => {
    if (universeId) {
      console.log(`  ${universeId}, // Converted from place ID ${placeId}`);
    }
  });
  console.log('];');
}

main();
