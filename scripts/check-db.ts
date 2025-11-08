import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkDatabase() {
  // Get total count
  const { count: totalCount, error: countError } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting games:', countError);
    return;
  }

  console.log(`\n📊 Total games in database: ${totalCount}\n`);

  // Get sample games with different ratings
  const { data: allGames, error: allError } = await supabase
    .from('games')
    .select('title, rating, player_count_current, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (allError) {
    console.error('Error fetching games:', allError);
    return;
  }

  console.log('📝 Latest 10 games added:');
  allGames?.forEach((game, i) => {
    console.log(`${i + 1}. ${game.title}`);
    console.log(`   Rating: ${game.rating}% | Players: ${game.player_count_current}`);
    console.log(`   Added: ${new Date(game.created_at).toISOString()}\n`);
  });

  // Get rating distribution
  const { data: ratingDist, error: ratingError } = await supabase
    .from('games')
    .select('rating');

  if (!ratingError && ratingDist) {
    const above80 = ratingDist.filter(g => g.rating && g.rating >= 80).length;
    const below80 = ratingDist.filter(g => !g.rating || g.rating < 80).length;
    console.log(`\n📈 Rating Distribution:`);
    console.log(`   >= 80%: ${above80} games`);
    console.log(`   < 80%:  ${below80} games`);
  }
}

checkDatabase().catch(console.error);
