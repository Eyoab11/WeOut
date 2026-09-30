"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Plus } from "lucide-react";
import { useTravel } from "@/lib/travel-provider";
import { dayKey } from "@/lib/quest-model";
import { Empty, ErrorText, Filters, Heading, errorMessage } from "./ui";
import { TripForm } from "./forms";
export function Trips() {
  const { trips, live, shareTrip, local } = useTravel();
  const [tab, setTab] = useState("Upcoming");
  const [create, setCreate] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const sampleSaved =
    tab === "Saved" && local.saved.includes("barcelona-sample");
  const found = trips.filter((t) =>
    tab === "Saved"
      ? local.saved.includes(t.id)
      : tab === "Past"
        ? t.ends_on < dayKey()
        : t.ends_on >= dayKey(),
  );
  return (
    <>
      <Heading
        eyebrow="SOMETHING TO LOOK FORWARD TO"
        title="Your next chapter is out there."
        description="Big getaways, little weekends, and everything in between."
        action={
          <button className="button" onClick={() => setCreate(true)}>
            <Plus size={18} />
            Plan a trip
          </button>
        }
      />
      <div className="banner">
        <Image
          src="/images/barcelona.jpg"
          alt="Barcelona city rooftops"
          fill
          sizes="90vw"
          className="cover"
        />
        <div>
          <span className="eyebrow">A LITTLE INSPIRATION</span>
          <h2>
            Two days.
            <br />
            Endless possibilities.
          </h2>
          <p>A sample Barcelona itinerary to get the ideas flowing.</p>
          <Link
            href="/trips/detail?id=barcelona-sample"
            className="button small"
          >
            Explore the sample plan <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
      <Filters
        options={["Upcoming", "Past", "Saved"]}
        value={tab}
        onChange={setTab}
      />
      <ErrorText error={error} />
      {found.length || sampleSaved ? (
        <div className="cards two">
          {sampleSaved && (
            <article className="card">
              <div className="card-body">
                <span className="eyebrow">SAMPLE ITINERARY</span>
                <h3>A Barcelona weekend</h3>
                <p>Two days of local flavors, city streets, and sea air.</p>
                <Link
                  className="text-link"
                  href="/trips/detail?id=barcelona-sample"
                >
                  Open your saved inspiration <ArrowUpRight size={16} />
                </Link>
              </div>
            </article>
          )}
          {found.map((t) => (
            <article className="card" key={t.id}>
              <div className="card-body">
                <span className="eyebrow">{t.destination}</span>
                <h3>{t.title}</h3>
                <div className="card-meta">
                  <span>
                    <CalendarDays size={16} />
                    {t.starts_on} → {t.ends_on}
                  </span>
                </div>
                {live && (
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={t.shared}
                      disabled={!!busy}
                      onChange={async (e) => {
                        setBusy(t.id);
                        setError("");
                        try {
                          await shareTrip(t.id, e.target.checked);
                        } catch (e) {
                          setError(errorMessage(e));
                        } finally {
                          setBusy("");
                        }
                      }}
                    />
                    Share destination with travelers
                  </label>
                )}
                <Link href={`/trips/detail?id=${t.id}`} className="text-link">
                  Open your plan <ArrowUpRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title={
            tab === "Upcoming"
              ? "Make room for adventure"
              : `No ${tab.toLowerCase()} trips yet`
          }
          description="Choose a destination, pick your dates, and turn ‘one day’ into a plan."
        >
          <button className="button small" onClick={() => setCreate(true)}>
            Plan your next trip <Plus size={16} />
          </button>
        </Empty>
      )}
      {create && <TripForm onClose={() => setCreate(false)} />}
    </>
  );
}
