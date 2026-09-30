import type { Metadata } from "next";
import { TravelProvider } from "@/lib/travel-provider";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "WeOut — Go out. Explore more. Together.",
    template: "%s | WeOut",
  },
  description:
    "Find your next little adventure. Discover places, take on SideQuests, plan trips, and meet people who take the scenic route.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <TravelProvider>{children}</TravelProvider>
      </body>
    </html>
  );
}
