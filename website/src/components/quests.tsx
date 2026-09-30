"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, ArrowUpRight } from "lucide-react";
import { useTravel } from "@/lib/travel-provider";
import { categories } from "@/lib/data";
import {
  Empty,
  Filters,
  Heading,
  QuestCard,
  SearchBox,
  StreakCard,
} from "./ui";
import { QuestForm } from "./forms";
export function Quests() {
  const {
    catalog,
    daily,
    progress,
    participants,
    participantCount,
    live,
    loading,
  } = useTravel();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("Discover");
  const [create, setCreate] = useState(false);
  const found = catalog.filter(
    (q) =>
      (category === "All" || q.category === category) &&
      (q.title + " " + q.description)
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (status === "Discover" ||
        (status === "Active"
          ? progress.started.includes(q.id) && !progress.completed[q.id]
          : !!progress.completed[q.id])),
  );
  return (
    <>
      <Heading
        eyebrow="SMALL ADVENTURES. GOOD STORIES."
        title="Life’s better with a SideQuest."
        description="Break your routine. Follow a new path. Capture the moment."
        action={
          <button className="button" onClick={() => setCreate(true)}>
            <Plus size={18} />
            Create a quest
          </button>
        }
      />
      <div className="workspace-grid">
        <div>
          <section className="panel daily">
            <span className="eyebrow">ONE DAY. ONE SHARED ADVENTURE.</span>
            <h3>{daily.title}</h3>
            <p>{daily.description}</p>
            <div className="row">
              <span className="small muted">
                {daily.minutes} minutes · Resets at midnight UTC
              </span>
              <Link
                className="button small"
                href={`/sidequests/detail?id=${daily.id}`}
              >
                Take the challenge <ArrowUpRight size={16} />
              </Link>
            </div>
          </section>
          <Filters
            options={["Discover", "Active", "Completed"]}
            value={status}
            onChange={setStatus}
          />
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Find your kind of SideQuest"
          />
          <Filters
            options={categories}
            value={category}
            onChange={setCategory}
          />
          {loading && !catalog.length ? (
            <p role="status">Loading SideQuests…</p>
          ) : found.length ? (
            <div className="cards two">
              {found.map((q) => (
                <QuestCard key={q.id} quest={q} />
              ))}
            </div>
          ) : (
            <Empty
              title="A fresh start"
              description={
                status === "Discover"
                  ? "No quests match yet. Try another filter or create your own."
                  : "Your quests will appear here as you join and complete them."
              }
            />
          )}
        </div>
        <aside>
          <StreakCard />
          <section className="panel">
            <span className="eyebrow">BETTER TOGETHER</span>
            <h3 style={{ marginTop: 12 }}>Today’s explorers</h3>
            {live ? (
              <>
                <p>{participantCount} joined the daily challenge</p>
                {participants.map((p, i) => (
                  <div className="nearby-row" key={i}>
                    <strong>{p.name}</strong>
                    <span>
                      {p.completed
                        ? "Moment captured"
                        : "Adventure in progress"}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <p>
                {progress.started.includes(daily.id)
                  ? "You’re in. Add a photo to complete today’s adventure."
                  : "Join today’s challenge and take the first step."}
              </p>
            )}
          </section>
        </aside>
      </div>
      {create && <QuestForm onClose={() => setCreate(false)} />}
    </>
  );
}
