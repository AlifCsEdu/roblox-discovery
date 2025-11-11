import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kcjzjxreonqftfwbpytc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjanpqeHJlb25xZnRmd2JweXRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUyMzk3MCwiZXhwIjoyMDc4MDk5OTcwfQ.rKvYwzOKIw31CH12HTgCieI12fvi09N1gQYr3X1_ng0'
);

const sampleGames = [
  {
    roblox_id: 292439477,
    title: 'Phantom Forces',
    description: 'A tactical FPS game with realistic gunplay and intense combat',
    creator: 'StyLiS Studios',
    thumbnail_url: 'https://tr.rbxcdn.com/180DAY-6cbb4e0eb1e82e8e05d70824fd92c7d1/768/432/Image/Webp/noFilter',
    rating: 92,
    total_ratings: 15000,
    player_count_current: 12500,
    player_count_peak: 18000,
    player_count_7d_avg: 11000,
    visits: 1500000000,
    favorite_count: 2500000,
    genres: ['Shooter', 'PvP'],
    is_active: true
  },
  {
    roblox_id: 606849621,
    title: 'Jailbreak',
    description: 'Escape prison and become a master criminal or stop them as a cop',
    creator: 'Badimo',
    thumbnail_url: 'https://tr.rbxcdn.com/180DAY-a6b6a5b6c3a3f4e3f6d6e5c4f8a5b6c3/768/432/Image/Webp/noFilter',
    rating: 89,
    total_ratings: 25000,
    player_count_current: 25000,
    player_count_peak: 40000,
    player_count_7d_avg: 22000,
    visits: 7000000000,
    favorite_count: 5500000,
    genres: ['Adventure', 'RPG'],
    is_active: true
  },
  {
    roblox_id: 189707,
    title: 'Natural Disaster Survival',
    description: 'Survive natural disasters in various maps with friends',
    creator: 'Stickmasterluke',
    thumbnail_url: 'https://tr.rbxcdn.com/180DAY-7dcc5f1fc2f93f9f16e81935ge03d8e2/768/432/Image/Webp/noFilter',
    rating: 91,
    total_ratings: 20000,
    player_count_current: 8500,
    player_count_peak: 15000,
    player_count_7d_avg: 7500,
    visits: 2000000000,
    favorite_count: 3000000,
    genres: ['Survival', 'Co-op'],
    is_active: true
  },
  {
    roblox_id: 286090429,
    title: 'Arsenal',
    description: 'Fast-paced FPS with unique weapons and maps',
    creator: 'ROLVe Community',
    thumbnail_url: 'https://tr.rbxcdn.com/180DAY-8edd6g2gd3g04g0g27f92046hf14e9f3/768/432/Image/Webp/noFilter',
    rating: 88,
    total_ratings: 18000,
    player_count_current: 15000,
    player_count_peak: 25000,
    player_count_7d_avg: 13000,
    visits: 3500000000,
    favorite_count: 4200000,
    genres: ['Shooter', 'PvP'],
    is_active: true
  },
  {
    roblox_id: 920587237,
    title: 'Adopt Me!',
    description: 'Raise and dress cute pets, decorate your house, and play with friends',
    creator: 'Uplift Games',
    thumbnail_url: 'https://tr.rbxcdn.com/180DAY-9fee7h3he4h15h1h38g03157ig25f0g4/768/432/Image/Webp/noFilter',
    rating: 85,
    total_ratings: 35000,
    player_count_current: 180000,
    player_count_peak: 250000,
    player_count_7d_avg: 160000,
    visits: 35000000000,
    favorite_count: 15000000,
    genres: ['Simulator', 'Co-op'],
    is_active: true
  },
  {
    roblox_id: 2753915549,
    title: 'Blox Fruits',
    description: 'Become a master swordsman or a powerful blox fruit user',
    creator: 'Gamer Robot Inc.',
    thumbnail_url: 'https://tr.rbxcdn.com/180DAY-0aff8i4if5i26i2i49h14268jh36g1h5/768/432/Image/Webp/noFilter',
    rating: 93,
    total_ratings: 28000,
    player_count_current: 420000,
    player_count_peak: 600000,
    player_count_7d_avg: 380000,
    visits: 28000000000,
    favorite_count: 12000000,
    genres: ['RPG', 'Adventure'],
    is_active: true
  },
  {
    roblox_id: 537413528,
    title: 'Build A Boat For Treasure',
    description: 'Build a boat and explore to find treasure',
    creator: 'Chillz Studios',
    thumbnail_url: 'https://tr.rbxcdn.com/180DAY-1bgg9j5jg6j37j3j50i25379ki47h2i6/768/432/Image/Webp/noFilter',
    rating: 90,
    total_ratings: 22000,
    player_count_current: 35000,
    player_count_peak: 55000,
    player_count_7d_avg: 32000,
    visits: 8500000000,
    favorite_count: 6800000,
    genres: ['Sandbox', 'Co-op'],
    is_active: true
  },
  {
    roblox_id: 5670218086,
    title: 'BedWars',
    description: 'Protect your bed and destroy the enemy beds to win',
    creator: 'Easy.gg',
    thumbnail_url: 'https://tr.rbxcdn.com/180DAY-2chh0k6kh7k48k4k61j36480lj58i3j7/768/432/Image/Webp/noFilter',
    rating: 87,
    total_ratings: 16000,
    player_count_current: 28000,
    player_count_peak: 45000,
    player_count_7d_avg: 25000,
    visits: 4200000000,
    favorite_count: 3500000,
    genres: ['PvP', 'Co-op'],
    is_active: true
  }
];

async function populate() {
  console.log('🚀 Adding sample games to database...\n');
  
  for (const game of sampleGames) {
    const { error } = await supabase
      .from('games')
      .upsert(game, { onConflict: 'roblox_id' });
    
    if (error) {
      console.log(`❌ Error adding ${game.title}:`, error.message);
    } else {
      console.log(`✅ Added ${game.title} (${game.player_count_current} players)`);
    }
  }
  
  console.log('\n✨ Done! Added', sampleGames.length, 'games');
}

populate();
