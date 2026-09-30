"use client";
import { useState } from "react";
import Image from "next/image";
import { Users } from "lucide-react";
import { useTravel } from "@/lib/travel-provider";
import { travelers } from "@/lib/data";
import { Empty, Filters, Heading, SearchBox, SaveButton } from "./ui";
import { Discovery } from "./discovery";
export function Companions() {
  const { local, toggle, live } = useTravel();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const found = travelers.filter(
    (t) =>
      (t.name + " " + t.city + " " + t.destinations.join(" "))
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (category === "All" ||
        t.interests.includes(category) ||
        (category === "Saved" && local.saved.includes(t.id))),
  );
  return (
    <>
      <Heading
        eyebrow="GOOD COMPANY. GREAT STORIES."
        title="Find your kind of people."
        description="The best part of a place can be who you share it with."
      />
      {live && <Discovery />}
      <div className="row row-section">
        <h2>Meet the preview travelers</h2>
        <Users size={23} />
      </div>
      <p className="small muted" style={{ marginBottom: 22 }}>
        These are sample profiles from the mobile app. Preview connections stay
        on your device and don’t send a request.
      </p>
      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="Search a name or dream destination"
      />
      <Filters
        options={[
          "All",
          "Hiking",
          "Food",
          "Culture",
          "Photography",
          "Nature",
          "Saved",
        ]}
        value={category}
        onChange={setCategory}
      />
      {found.length ? (
        <div className="cards">
          {found.map((t) => (
            <article className="card" key={t.id}>
              <div className="traveler-photo">
                <Image
                  src={t.image}
                  alt={t.name}
                  fill
                  sizes="(max-width:600px) 90vw, 30vw"
                  className="cover"
                />
                <SaveButton id={t.id} label={t.name} />
              </div>
              <div className="card-body">
                <span className="eyebrow">{t.city}</span>
                <h3>
                  {t.name}, {t.age}
                </h3>
                <p>{t.bio}</p>
                <div className="tags">
                  {t.interests.map((i) => (
                    <span className="badge" key={i}>
                      {i}
                    </span>
                  ))}
                </div>
                <p className="small">Dreaming of {t.destinations.join(", ")}</p>
                <button
                  className="button small secondary"
                  style={{ width: "100%", marginTop: 20 }}
                  aria-pressed={local.connections.includes(t.id)}
                  onClick={() => toggle("connections", t.id)}
                >
                  {local.connections.includes(t.id)
                    ? "Connected in preview ✓"
                    : "Connect in preview"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title="Try a different direction"
          description="Change your destination or travel interests to find a sample traveler."
        />
      )}
    </>
  );
}
