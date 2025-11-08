/**
 * Test the votes API to see why rating is 0%
 */

async function testVotesAPI() {
  // Test with Brookhaven's universe ID
  const universeId = 1686885941;
  
  console.log(`Testing votes API for universe ID: ${universeId}\n`);
  
  // Try the votes endpoint
  const url = `https://games.roblox.com/v1/games/votes?universeIds=${universeId}`;
  console.log(`URL: ${url}\n`);
  
  const response = await fetch(url);
  console.log(`Status: ${response.status}`);
  
  const data = await response.json();
  console.log(`Response:`, JSON.stringify(data, null, 2));
}

testVotesAPI();
