"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Map,
  Mountain,
  Route,
  Users,
  UserRound,
  ArrowUpRight,
} from "lucide-react";
import { Brand } from "./brand";
import { QuestTools } from "./webmcp";
import { useTravel } from "@/lib/travel-provider";
const navigation = [
  { href: "/home", label: "Home", icon: Map },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/sidequests", label: "SideQuests", icon: Mountain },
  { href: "/trips", label: "Trips", icon: Route },
  { href: "/companions", label: "Companions", icon: Users },
  { href: "/profile", label: "Profile", icon: UserRound },
];
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { local, live, ready, error, loading, refresh } = useTravel();
  return (
    <div className="app-shell">
      <QuestTools />
      <aside className="sidebar">
        <Brand />
        <nav aria-label="Travel navigation">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? "active" : ""}
              aria-current={pathname === href ? "page" : undefined}
              title={label}
            >
              <Icon />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="eyebrow">TAKE THE SCENIC ROUTE</span>
          <p>Your next little adventure is closer than you think.</p>
          <Link className="text-link" href="/sidequests">
            Find your SideQuest <ArrowUpRight size={16} />
          </Link>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <Link href="/" className="topbar-caption">
            Places. People. Purpose.
          </Link>
          <div className="topbar-actions">
            {!live && (
              <Link href="/login" className="text-link">
                Log in / Sign up
              </Link>
            )}
            <Link href="/profile" className="avatar" aria-label="Your profile">
              {local.profile.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </Link>
          </div>
        </header>
        <main id="main" className="app-content">
          {!live && (
            <div className="notice">
              <span>
                Preview mode · Sample places and travelers. Your activity stays
                on this browser.
              </span>
              <Link href="/login" className="text-link">
                Sign in <ArrowUpRight size={14} />
              </Link>
            </div>
          )}
          {error && (
            <div className="error" role="alert">
              {error}{" "}
              <button
                className="text-link icon-button"
                disabled={loading}
                onClick={() => void refresh()}
              >
                Retry
              </button>
            </div>
          )}
          {!ready ? (
            <p role="status">Getting your adventures ready…</p>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
