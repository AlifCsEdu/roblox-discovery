import type { Metadata } from "next";
import { getEnrichedGame, placeIdToUniverseId } from "@/lib/roblox-api";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const placeId = parseInt(id);

  try {
    // Convert place ID to universe ID
    const universeId = await placeIdToUniverseId(placeId);
    
    if (!universeId) {
      console.warn(`[METADATA] No universe ID found for place ID: ${placeId}`);
      return {
        title: "Game Not Found",
        description: "The requested game could not be found.",
      };
    }

    // Fetch game details
    const game = await getEnrichedGame(universeId);
    
    if (!game) {
      console.warn(`[METADATA] Game not found for universe ID: ${universeId}`);
      return {
        title: "Game Not Found",
        description: "The requested game could not be found.",
      };
    }
    
    const playingCount = game.playing ?? 0;
    const description = game.description?.slice(0, 155) || `Play ${game.name} on Roblox. ${playingCount.toLocaleString()} players online now!`;
    const rating = game.rating ? `${Math.round(game.rating)}%` : "N/A";

    return {
      title: game.name,
      description,
      keywords: [
        game.name,
        "Roblox game",
        game.creator.name,
        "play Roblox",
        "game details",
        "player stats",
      ],
      openGraph: {
        title: `${game.name} | RobloxDiscover`,
        description,
        type: "website",
        url: `https://robloxdiscover.com/games/${id}`,
      },
      twitter: {
        card: "summary_large_image",
        title: `${game.name} | RobloxDiscover`,
        description: `${game.name} - Rating: ${rating} • ${playingCount.toLocaleString()} playing now • By ${game.creator.name}`,
      },
    };
  } catch (error) {
    console.error('[METADATA] Error generating metadata for game:', placeId, error);
    return {
      title: "Game Details",
      description: "View game details, ratings, and player statistics on RobloxDiscover.",
    };
  }
}

export default async function GameLayout({ children }: { children: React.ReactNode }) {
  return children;
}
