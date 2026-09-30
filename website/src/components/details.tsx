"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Bookmark,
  Check,
  Clock3,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { useTravel } from "@/lib/travel-provider";
import { itinerary, places, questImage } from "@/lib/data";
import { Empty, ErrorText, errorMessage } from "./ui";
import { PhotoForm } from "./forms";
export function QuestDetail() {
  const params = useSearchParams();
  const {
    catalog,
    daily,
    progress,
    join,
    loading,
    live,
    error: loadError,
  } = useTravel();
  const quest = [daily, ...catalog].find((q) => q.id === params.get("id"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState(false);
  if (!quest)
    return loading ? (
      <p role="status">Loading your quest…</p>
    ) : (
      <Empty
        title="This quest isn’t available"
        description="It may have been a daily challenge that has ended. Pick a new adventure from SideQuests."
      >
        <Link className="button" href="/sidequests">
          Find a SideQuest
        </Link>
      </Empty>
    );
  const started = progress.started.includes(quest.id),
    complete = !!progress.completed[quest.id];
  return (
    <>
      <Link href="/sidequests" className="back-link">
        <ArrowLeft size={16} />
        Back to SideQuests
      </Link>
      <div className="detail-layout">
        <div className="detail-photo">
          <Image
            src={questImage(quest.category)}
            alt={quest.title}
            fill
            sizes="(max-width:850px) 90vw, 50vw"
            priority
            className="cover"
          />
        </div>
        <div className="detail-copy">
          <span className="eyebrow">
            {quest.category} ·{" "}
            {quest.kind === "daily" ? "TODAY’S CHALLENGE" : quest.tag}
          </span>
          <h1>{quest.title}</h1>
          <p>{quest.description}</p>
          <div className="card-meta">
            <span>
              <Clock3 size={16} />
              {quest.minutes} minutes
            </span>
            <span>
              <MapPin size={16} />
              {quest.distance || "Your area"}
            </span>
          </div>
          <section className="panel" style={{ marginTop: 25 }}>
            <h3>
              {complete ? "You made a memory." : "A moment worth capturing."}
            </h3>
            <p>
              {complete
                ? "Your photo is in Explore and your profile. Keep the good days going."
                : "Join the quest, head out, and post your own photo to complete it. A photo also counts toward your daily streak."}
            </p>
            {complete ? (
              <span className="badge" style={{ marginTop: 15 }}>
                <Check size={15} />
                Completed
              </span>
            ) : started ? (
              <button className="button" onClick={() => setPhoto(true)}>
                Post your photo
              </button>
            ) : (
              <button
                disabled={busy || (live && (loading || !!loadError))}
                className="button"
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    await join(quest.id);
                  } catch (e) {
                    setError(errorMessage(e));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Joining…" : "I’m in — start quest"}
              </button>
            )}
            <ErrorText error={error} />
          </section>
          <p className="small muted" style={{ marginTop: 22 }}>
            {quest.xp} XP is an illustrative label; this version does not award
            an XP balance. Daily challenges use UTC.
          </p>
        </div>
      </div>
      {photo && <PhotoForm quest={quest} onClose={() => setPhoto(false)} />}
    </>
  );
}
export function PlaceDetail() {
  const params = useSearchParams();
  const { local, toggle } = useTravel();
  const place = places.find((p) => p.id === params.get("id"));
  if (!place)
    return (
      <Empty
        title="Place not found"
        description="Explore the sample places to find your next stop."
      >
        <Link href="/home" className="button">
          Explore places
        </Link>
      </Empty>
    );
  return (
    <>
      <Link href="/home" className="back-link">
        <ArrowLeft size={16} />
        Back to places
      </Link>
      <div className="detail-layout">
        <div className="detail-photo">
          <Image
            src={place.image}
            alt={place.name}
            fill
            priority
            sizes="(max-width:850px) 90vw, 50vw"
            className="cover"
          />
        </div>
        <div className="detail-copy">
          <span className="eyebrow">
            {place.category} · {place.tag}
          </span>
          <h1>{place.name}</h1>
          <p>{place.description}</p>
          <div className="card-meta">
            <span>
              <MapPin size={16} />
              Barcelona, Spain · Sample destination
            </span>
          </div>
          <button
            className="button"
            aria-pressed={local.saved.includes(place.id)}
            onClick={() => toggle("saved", place.id)}
          >
            <Bookmark size={17} />
            {local.saved.includes(place.id)
              ? "Saved to your places"
              : "Save this place"}
          </button>
          <a
            className="button secondary"
            href={`https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=16/${place.latitude}/${place.longitude}`}
            target="_blank"
            rel="noreferrer"
          >
            Open map <ExternalLink size={16} />
          </a>
          <p className="small muted" style={{ marginTop: 20 }}>
            Curated inspiration from the mobile app. Details aren’t live venue
            information.
          </p>
        </div>
      </div>
    </>
  );
}
export function TripDetail() {
  const params = useSearchParams();
  const { trips, local, toggle } = useTravel();
  const sample = params.get("id") === "barcelona-sample";
  const trip = trips.find((t) => t.id === params.get("id"));
  if (!trip && !sample)
    return (
      <Empty
        title="This trip isn’t here"
        description="Open one of your plans or start a fresh adventure."
      >
        <Link className="button" href="/trips">
          Your trips
        </Link>
      </Empty>
    );
  const id = trip?.id || "barcelona-sample";
  return (
    <>
      <Link href="/trips" className="back-link">
        <ArrowLeft size={16} />
        Back to trips
      </Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {sample ? "SAMPLE ITINERARY" : trip!.destination}
          </span>
          <h1>{sample ? "A Barcelona weekend" : trip!.title}</h1>
          <p>
            {sample
              ? "Two days of local flavors, city streets, and sea air."
              : `${trip!.starts_on} → ${trip!.ends_on}`}
          </p>
        </div>
        <button
          className="button secondary"
          aria-pressed={local.saved.includes(id)}
          onClick={() => toggle("saved", id)}
        >
          <Bookmark size={17} />
          {local.saved.includes(id) ? "Saved" : "Save trip"}
        </button>
      </div>
      <div className="workspace-grid">
        <section className="panel">
          <h2>{sample ? "The scenic itinerary" : "Your destination"}</h2>
          {sample ? (
            <ol className="timeline">
              {itinerary.map((item) => (
                <li key={item.time}>
                  <time>{item.time}</time>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <>
              <p>{trip!.destination}</p>
              <p className="small" style={{ marginTop: 10 }}>
                Your destination is{" "}
                {trip!.shared ? "shared with travelers" : "private"}.
              </p>
              <a
                className="button secondary"
                style={{ marginTop: 20 }}
                href={`https://www.openstreetmap.org/?mlat=${trip!.latitude}&mlon=${trip!.longitude}#map=12/${trip!.latitude}/${trip!.longitude}`}
                target="_blank"
                rel="noreferrer"
              >
                View destination map <ExternalLink size={16} />
              </a>
            </>
          )}
        </section>
        <aside>
          <section className="panel">
            <h2>A little packing list</h2>
            <p>Saved on this browser for this trip.</p>
            {[
              "Travel documents",
              "Comfortable shoes",
              "Reusable water bottle",
              "Camera & charger",
              "A little curiosity",
            ].map((item) => (
              <label className="check-row" key={item}>
                <input
                  type="checkbox"
                  checked={local.packing.includes(`${id}:${item}`)}
                  onChange={() => toggle("packing", `${id}:${item}`)}
                />
                {item}
              </label>
            ))}
          </section>
        </aside>
      </div>
    </>
  );
}
