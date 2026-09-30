"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { useTravel } from "@/lib/travel-provider";
import { places } from "@/lib/data";
import {
  Empty,
  Filters,
  Heading,
  PlaceCard,
  QuestCard,
  SearchBox,
  StreakCard,
} from "./ui";
import { Discovery } from "./discovery";
export function Home() {
  const { local, daily, live, catalog } = useTravel();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const found = places.filter(
    (p) =>
      (category === "All" || category === p.category) &&
      (p.name + " " + p.description + " Barcelona")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <Heading
        eyebrow="A GOOD DAY TO GET OUT"
        title={`Hey ${local.profile.name.split(" ")[0]}, where to?`}
        description="A new perspective is closer than you think."
      />
      <div className="banner">
        <Image
          src="/images/lake-como.jpg"
          alt="A peaceful lakeside destination"
          fill
          priority
          sizes="90vw"
          className="cover"
        />
        <div>
          <span className="eyebrow">FOLLOW YOUR CURIOSITY</span>
          <h2>
            A little detour.
            <br />A whole new story.
          </h2>
          <p>Find something worth stepping outside for.</p>
          <Link className="button" href="/sidequests">
            Find a SideQuest <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
      <div className="workspace-grid">
        <div>
          <div className="row row-section">
            <h2>Places to put on your radar</h2>
            <span className="small muted">
              <MapPin size={13} /> Barcelona · inspiration
            </span>
          </div>
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search sample places"
          />
          <Filters
            options={["All", "Nature", "Food", "Culture"]}
            value={category}
            onChange={setCategory}
          />
          {found.length ? (
            <div className="cards two">
              {found.map((p) => (
                <PlaceCard place={p} key={p.id} />
              ))}
            </div>
          ) : (
            <Empty
              title="Take a different route"
              description="Try another place name or category."
            />
          )}
          <div className="row row-section">
            <h2>A little adventure awaits</h2>
            <Link href="/sidequests" className="text-link">
              View all <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="cards two">
            {catalog.slice(0, 2).map((q) => (
              <QuestCard key={q.id} quest={q} />
            ))}
          </div>
          {live && <Discovery />}
        </div>
        <aside>
          <section className="panel daily">
            <span className="eyebrow">TODAY’S SHARED CHALLENGE</span>
            <h3>{daily.title}</h3>
            <p>{daily.description}</p>
            <Link
              className="button small"
              href={`/sidequests/detail?id=${daily.id}`}
            >
              Make today count <ArrowUpRight size={16} />
            </Link>
          </section>
          <StreakCard />
        </aside>
      </div>
    </>
  );
}
