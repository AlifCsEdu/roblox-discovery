import type { Metadata } from "next";
import { GENRES } from "@/constants/genres";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  // Find genre by slug
  const genre = GENRES.find((g) => g.slug === slug);
  
  if (!genre) {
    return {
      title: "Genre Not Found",
      description: "The requested genre could not be found.",
    };
  }

  const genreName = genre.name;
  const description = `Discover high-quality ${genreName} games on Roblox. Browse trending ${genreName.toLowerCase()} games with live player counts and ratings. Find your next favorite ${genreName.toLowerCase()} game.`;

  return {
    title: `${genreName} Games`,
    description,
    keywords: [
      `Roblox ${genreName}`,
      `${genreName} games`,
      "Roblox games",
      genreName.toLowerCase(),
      "game discovery",
      "trending games",
    ],
    openGraph: {
      title: `${genreName} Games | RobloxDiscover`,
      description,
      type: "website",
      url: `https://robloxdiscover.com/genres/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${genreName} Games | RobloxDiscover`,
      description: `Discover the best ${genreName} games on Roblox with live stats and ratings.`,
    },
  };
}

export default async function GenreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
