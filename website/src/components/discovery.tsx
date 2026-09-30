"use client";
import { useState } from "react";
import Link from "next/link";
import { LocateFixed } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Empty, ErrorText, errorMessage } from "./ui";
type Nearby = {
  sharing: boolean;
  status: "exploring" | "traveling";
  people: {
    id: string;
    name: string;
    status: string;
    distance_km: number;
    quests: string[];
  }[];
  quests: { id: string; title: string; distance_km: number }[];
  trips: {
    id: string;
    title: string;
    destination: string;
    name: string;
    starts_on: string;
    ends_on: string;
    distance_km: number;
  }[];
};
export function Discovery() {
  const [data, setData] = useState<Nearby | null>(null);
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function find(sharing?: boolean, status?: string) {
    if (!supabase) return;
    setBusy(true);
    setError("");
    try {
      let point = coordinates;
      if (!point) {
        if (!navigator.geolocation)
          throw new Error("Your browser does not support location.");
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 15000,
            maximumAge: 60000,
          }),
        );
        point = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setCoordinates(point);
      }
      const args = { p_latitude: point.latitude, p_longitude: point.longitude };
      const { error: updateError } = await supabase.rpc("discovery_update", {
        ...args,
        ...(sharing === undefined ? {} : { p_sharing: sharing }),
        ...(status ? { p_status: status } : {}),
      });
      if (updateError) throw updateError;
      const { data: nearby, error } = await supabase.rpc("discovery_nearby", {
        ...args,
        p_radius_km: 25,
      });
      if (error) throw error;
      setData(nearby as Nearby);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel" style={{ marginTop: 28 }}>
      <div className="row">
        <h2>Who’s out there?</h2>
        <button
          className="button small secondary"
          disabled={busy}
          onClick={() => void find()}
        >
          <LocateFixed size={17} />
          {busy ? "Finding…" : data ? "Refresh nearby" : "Explore nearby"}
        </button>
      </div>
      <p>
        Find travelers, SideQuests, and shared trips within 25 km. Your location
        is only requested when you choose to explore nearby.
      </p>
      <ErrorText error={error} />
      {data && (
        <>
          <label className="check-row">
            <input
              type="checkbox"
              checked={data.sharing}
              disabled={busy}
              onChange={(e) => void find(e.target.checked)}
            />
            Let travelers see my approximate location
          </label>
          <p className="small muted">
            Location is rounded to roughly 1 km. Visibility expires after two
            hours without a refresh.
          </p>
          <label className="field" style={{ marginBlock: 15 }}>
            My travel status
            <select
              value={data.status}
              disabled={busy}
              onChange={(e) => void find(undefined, e.target.value)}
            >
              <option value="exploring">Exploring</option>
              <option value="traveling">Traveling</option>
            </select>
          </label>
          {!data.people.length && !data.quests.length && !data.trips.length ? (
            <Empty
              title="A quiet corner of the world"
              description="No shared travelers, quests, or trips in this area yet. Try again later."
            />
          ) : (
            <>
              {data.people.map((p) => (
                <div className="nearby-row" key={p.id}>
                  <strong>{p.name}</strong>
                  <span>
                    {p.status} · {p.distance_km.toFixed(1)} km away
                  </span>
                  {p.quests.length > 0 && (
                    <p className="small">{p.quests.join(" · ")}</p>
                  )}
                </div>
              ))}
              {data.quests.map((q) => (
                <div className="nearby-row" key={q.id}>
                  <Link
                    href={`/sidequests/detail?id=${encodeURIComponent(q.id)}`}
                  >
                    <strong>{q.title} ↗</strong>
                  </Link>
                  <span>SideQuest · {q.distance_km.toFixed(1)} km</span>
                </div>
              ))}
              {data.trips.map((t) => (
                <div className="nearby-row" key={t.id}>
                  <strong>{t.title}</strong>
                  <span>
                    {t.name} · {t.destination} · {t.starts_on} to {t.ends_on}
                  </span>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </section>
  );
}
