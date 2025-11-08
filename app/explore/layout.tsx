import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Games",
  description: "Explore high-quality Roblox games with advanced filters. Search by genre, rating, and sort by trending, top-rated, or newest games. Discover your next favorite game.",
  keywords: ["Roblox explore", "game filters", "Roblox genres", "quality games", "game discovery"],
  openGraph: {
    title: "Explore Games | RobloxDiscover",
    description: "Explore high-quality Roblox games with advanced filters and genre-based search.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Games | RobloxDiscover",
    description: "Explore high-quality Roblox games with advanced filters and genre-based search.",
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
