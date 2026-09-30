"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import {
  applyPhotoPost,
  blankProgress,
  dailyQuest,
  dayKey,
  type PhotoPost,
  type Progress,
  type StoredQuest,
} from "./quest-model";
import { quests } from "./data";
export type Trip = {
  id: string;
  title: string;
  destination: string;
  starts_on: string;
  ends_on: string;
  latitude: number;
  longitude: number;
  shared: boolean;
};
type Profile = { name: string; username: string; bio: string; style: string[] };
type Local = {
  profile: Profile;
  saved: string[];
  liked: string[];
  connections: string[];
  trips: Trip[];
  progress: Progress;
  packing: string[];
  comments: Record<string, string[]>;
};
type Dashboard = {
  day: string;
  catalog: StoredQuest[];
  daily: StoredQuest;
  started: string[];
  completed: Record<string, string>;
  days: string[];
  posts: (PhotoPost & { storagePath: string })[];
  participants: { name: string; completed: boolean }[];
  participant_count: number;
};
const initial = (): Local => ({
  profile: {
    name: "Alex Rivera",
    username: "alexrivera",
    bio: "Exploring new places, meeting amazing people, and taking the scenic route.",
    style: ["Adventure", "Nature", "Food"],
  },
  saved: [],
  liked: [],
  connections: [],
  trips: [],
  progress: blankProgress(),
  packing: [],
  comments: {},
});
type Context = {
  local: Local;
  user: User | null;
  ready: boolean;
  live: boolean;
  error: string;
  loading: boolean;
  catalog: StoredQuest[];
  daily: StoredQuest;
  progress: Progress;
  trips: Trip[];
  participants: Dashboard["participants"];
  participantCount: number;
  update: (fn: (value: Local) => Local) => void;
  toggle: (
    key: "saved" | "liked" | "connections" | "packing",
    id: string,
  ) => void;
  refresh: () => Promise<void>;
  enterPreview: (name: string) => void;
  leave: () => Promise<void>;
  join: (id: string) => Promise<void>;
  createQuest: (q: StoredQuest) => Promise<void>;
  publish: (post: PhotoPost, file: Blob) => Promise<void>;
  saveTrip: (trip: Omit<Trip, "id">) => Promise<void>;
  shareTrip: (id: string, shared: boolean) => Promise<void>;
  saveProfile: (profile: Profile) => Promise<void>;
};
const TravelContext = createContext<Context | null>(null);
export function TravelProvider({ children }: { children: React.ReactNode }) {
  const [local, setLocal] = useState<Local>(initial);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [owner, setOwner] = useState("preview:alexrivera");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [liveTrips, setLiveTrips] = useState<Trip[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const ownerRef = useRef(owner);
  ownerRef.current = owner;
  const [today, setToday] = useState(dayKey());
  useEffect(() => {
    const timer = setInterval(() => setToday(dayKey()), 30000);
    return () => clearInterval(timer);
  }, []);
  const loadLocal = useCallback((key: string, account?: User) => {
    ownerRef.current = key;
    setLoading(false);
    setDashboard(null);
    setLiveTrips([]);
    setError("");
    let state = initial();
    if (account)
      state.profile = {
        name: account.user_metadata?.display_name || "Traveler",
        username: "traveler_" + account.id.replaceAll("-", "").slice(0, 12),
        bio: "",
        style: [],
      };
    else if (key !== "preview:alexrivera")
      state.profile = {
        ...state.profile,
        name: key.slice(8),
        username: key.slice(8),
      };
    try {
      const raw = localStorage.getItem(`weout-web:${key}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed.profile &&
          Array.isArray(parsed.saved) &&
          parsed.progress?.posts
        )
          state = { ...state, ...parsed };
      }
    } catch {
      setError(
        "Browser storage is unavailable. Changes will last for this visit.",
      );
    }
    setLocal(state);
    setOwner(key);
  }, []);
  useEffect(() => {
    let active = true;
    try {
      const name = sessionStorage.getItem("weout-preview") || "alexrivera";
      loadLocal(`preview:${name}`);
    } catch {}
    if (!supabase) {
      setReady(true);
      return;
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const next = session?.user || null;
      setUser(next);
      const key = next ? `user:${next.id}` : "preview:alexrivera";
      if (key !== ownerRef.current) loadLocal(key, next || undefined);
      setReady(true);
    });
    supabase.auth.getSession().then(({ error }) => {
      if (active && error) {
        setError(error.message);
        setReady(true);
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadLocal]);
  const update = useCallback((fn: (value: Local) => Local) => setLocal(fn), []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(`weout-web:${owner}`, JSON.stringify(local));
    } catch {
      setError(
        "Could not save this change on this device. Browser storage may be full.",
      );
    }
  }, [local, owner, ready]);
  const refresh = useCallback(async () => {
    if (!supabase || !user) return;
    const requestOwner = owner;
    setLoading(true);
    setError("");
    try {
      const [q, t, p] = await Promise.all([
        supabase.rpc("quest_dashboard"),
        supabase.from("travel_trips").select("*").order("starts_on"),
        supabase
          .from("profiles")
          .select("username,display_name,bio,travel_preferences")
          .eq("id", user.id)
          .maybeSingle(),
      ]);
      if (q.error) throw q.error;
      if (t.error) throw t.error;
      if (p.error) throw p.error;
      const data = q.data as Dashboard;
      if (data.posts.length) {
        const { data: signed, error } = await supabase.storage
          .from("quest-evidence")
          .createSignedUrls(
            data.posts.map((post) => post.storagePath),
            3600,
          );
        if (error) throw error;
        data.posts = data.posts.map((post, i) => ({
          ...post,
          photoUri: signed?.[i]?.signedUrl || "",
        }));
      }
      if (ownerRef.current !== requestOwner) return;
      setDashboard(data);
      setLiveTrips(t.data as Trip[]);
      if (p.data) {
        const profile = p.data;
        setLocal((s) => ({
          ...s,
          profile: {
            ...s.profile,
            name: profile.display_name || "Traveler",
            username: profile.username,
            bio: profile.bio || "",
            style: profile.travel_preferences || [],
          },
        }));
      }
    } catch (e) {
      if (ownerRef.current === requestOwner)
        setError(
          e instanceof Error
            ? e.message
            : (e as { message?: string }).message ||
                "Could not load your adventures.",
        );
    } finally {
      if (ownerRef.current === requestOwner) setLoading(false);
    }
  }, [user, owner]);
  useEffect(() => {
    void refresh();
    if (!user) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 30000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh, user]);
  const live = !!user && !!supabase;
  const daily = live
    ? dashboard?.daily || dailyQuest(today)
    : dailyQuest(today);
  const catalog = live
    ? dashboard?.catalog || []
    : [...quests, ...local.progress.quests];
  const progress: Progress = live
    ? {
        quests: dashboard?.catalog || [],
        started: dashboard?.started || [],
        completed: dashboard?.completed || {},
        days: dashboard?.days || [],
        posts: dashboard?.posts || [],
      }
    : local.progress;
  const toggle = (
    key: "saved" | "liked" | "connections" | "packing",
    id: string,
  ) =>
    update((s) => ({
      ...s,
      [key]: s[key].includes(id)
        ? s[key].filter((v) => v !== id)
        : [...s[key], id],
    }));
  async function join(id: string) {
    if (live) {
      const { error } = await supabase!.rpc("quest_join", { p_quest_id: id });
      if (error) throw error;
      await refresh();
    } else
      update((s) => ({
        ...s,
        progress: {
          ...s.progress,
          started: [...new Set([...s.progress.started, id])],
        },
      }));
  }
  async function createQuest(q: StoredQuest) {
    if (live) {
      const { error } = await supabase!.from("quest_catalog").insert({
        id: q.id,
        title: q.title,
        description: q.description,
        category: q.category,
        minutes: q.minutes,
        xp: q.xp,
        kind: q.kind,
        creator_id: user!.id,
      });
      if (error) throw error;
      await refresh();
    } else
      update((s) => ({
        ...s,
        progress: { ...s.progress, quests: [...s.progress.quests, q] },
      }));
  }
  async function publish(post: PhotoPost, file: Blob) {
    if (live) {
      const path = `${user!.id}/${post.id}.jpg`;
      const { error: uploadError } = await supabase!.storage
        .from("quest-evidence")
        .upload(path, file, { contentType: "image/jpeg", upsert: false });
      if (uploadError && !/already exists|duplicate/i.test(uploadError.message))
        throw uploadError;
      const { error } = await supabase!.rpc("quest_publish_photo", {
        p_id: post.id,
        p_caption: post.caption,
        p_place: post.place,
        p_storage_path: path,
        p_quest_id: post.questId || null,
      });
      if (error) throw error;
      await refresh();
    } else {
      const quest = post.questId
        ? [daily, ...catalog].find((q) => q.id === post.questId)
        : undefined;
      const next = applyPhotoPost(local.progress, post, quest);
      localStorage.setItem(
        `weout-web:${owner}`,
        JSON.stringify({ ...local, progress: next }),
      );
      update((s) => ({ ...s, progress: next }));
    }
  }
  async function saveTrip(trip: Omit<Trip, "id">) {
    if (live) {
      const { error } = await supabase!.from("travel_trips").insert(trip);
      if (error) throw error;
      await refresh();
    } else
      update((s) => ({
        ...s,
        trips: [...s.trips, { ...trip, id: crypto.randomUUID() }],
      }));
  }
  async function shareTrip(id: string, shared: boolean) {
    if (live) {
      const { error } = await supabase!
        .from("travel_trips")
        .update({ shared })
        .eq("id", id);
      if (error) throw error;
      await refresh();
    } else
      update((s) => ({
        ...s,
        trips: s.trips.map((t) => (t.id === id ? { ...t, shared } : t)),
      }));
  }
  async function saveProfile(profile: Profile) {
    if (live) {
      const row = {
        id: user!.id,
        username: profile.username,
        display_name: profile.name,
        bio: profile.bio,
        travel_preferences: profile.style,
      };
      const { data, error: readError } = await supabase!
        .from("profiles")
        .select("id")
        .eq("id", user!.id)
        .maybeSingle();
      if (readError) throw readError;
      const { error } = data
        ? await supabase!
            .from("profiles")
            .update({
              username: row.username,
              display_name: row.display_name,
              bio: row.bio,
              travel_preferences: row.travel_preferences,
            })
            .eq("id", user!.id)
        : await supabase!.from("profiles").insert(row);
      if (error) throw error;
    }
    update((s) => ({ ...s, profile }));
  }
  function enterPreview(name: string) {
    const normalized =
      name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 30) || "alexrivera";
    try {
      sessionStorage.setItem("weout-preview", normalized);
    } catch {}
    loadLocal(`preview:${normalized}`);
    setReady(true);
  }
  async function leave() {
    if (user && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    setUser(null);
    setDashboard(null);
    setLiveTrips([]);
    loadLocal("preview:alexrivera");
  }
  return (
    <TravelContext.Provider
      value={{
        local,
        user,
        ready,
        live,
        error,
        loading,
        catalog,
        daily,
        progress,
        trips: live ? liveTrips : local.trips,
        participants: dashboard?.participants || [],
        participantCount: dashboard?.participant_count || 0,
        update,
        toggle,
        refresh,
        enterPreview,
        leave,
        join,
        createQuest,
        publish,
        saveTrip,
        shareTrip,
        saveProfile,
      }}
    >
      {children}
    </TravelContext.Provider>
  );
}
export function useTravel() {
  const value = useContext(TravelContext);
  if (!value) throw new Error("TravelProvider is missing.");
  return value;
}
