"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, Pencil } from "lucide-react";
import { useTravel } from "@/lib/travel-provider";
import { categories, places } from "@/lib/data";
import {
  Empty,
  ErrorText,
  Field,
  Filters,
  Modal,
  PlaceCard,
  QuestCard,
  StreakCard,
  errorMessage,
} from "./ui";
export function Profile() {
  const { local, progress, catalog, trips, update, saveProfile, leave, live } =
    useTravel();
  const router = useRouter();
  const [tab, setTab] = useState("Memories");
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(local.profile);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const savedPlaces = places.filter((p) => local.saved.includes(p.id));
  const savedQuests = catalog.filter((q) => local.saved.includes(q.id));
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (
        draft.name.trim().length < 2 ||
        !/^[a-z0-9_]{3,30}$/.test(draft.username)
      )
        throw new Error(
          "Add a name and a username of 3–30 lowercase letters, numbers, or underscores.",
        );
      await saveProfile({ ...draft, name: draft.name.trim() });
      setEdit(false);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="profile-cover">
        <Image
          src="/images/mountains.jpg"
          alt="A mountain horizon"
          fill
          sizes="90vw"
          className="cover"
        />
      </div>
      <div className="profile-header">
        <span className="profile-avatar">
          {local.profile.name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")}
        </span>
        <div>
          <h1>{local.profile.name}</h1>
          <p>@{local.profile.username}</p>
        </div>
        <button
          className="button secondary small"
          onClick={() => {
            setDraft(local.profile);
            setError("");
            setEdit(true);
          }}
        >
          <Pencil size={15} />
          Edit profile
        </button>
      </div>
      <div className="workspace-grid">
        <div>
          <p className="profile-text">{local.profile.bio}</p>
          <div className="tags">
            {local.profile.style.map((t) => (
              <span className="badge" key={t}>
                {t}
              </span>
            ))}
          </div>
          <div className="stats">
            <div className="stat">
              <strong>{progress.posts.length}</strong>
              <span>Moments captured</span>
            </div>
            <div className="stat">
              <strong>{Object.keys(progress.completed).length}</strong>
              <span>Quests completed</span>
            </div>
            <div className="stat">
              <strong>{trips.length}</strong>
              <span>Trips planned</span>
            </div>
          </div>
          <Filters
            options={["Memories", "Saved places", "My quests"]}
            value={tab}
            onChange={setTab}
          />
          {tab === "Memories" ? (
            progress.posts.length ? (
              <div className="cards two">
                {progress.posts.map((p) => (
                  <article key={p.id} className="card">
                    <img
                      src={p.photoUri}
                      alt={p.caption}
                      className="post-photo"
                      loading="lazy"
                    />
                    <div className="card-body">
                      <span className="eyebrow">{p.place}</span>
                      <p>{p.caption}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <Empty
                title="Start collecting moments"
                description="Your photos and completed SideQuests will find a home here."
              />
            )
          ) : tab === "Saved places" ? (
            savedPlaces.length + savedQuests.length ? (
              <div className="cards two">
                {savedPlaces.map((p) => (
                  <PlaceCard key={p.id} place={p} />
                ))}
                {savedQuests.map((q) => (
                  <QuestCard key={q.id} quest={q} />
                ))}
              </div>
            ) : (
              <Empty
                title="Keep a little inspiration"
                description="Tap the bookmark on a place or SideQuest to save it here."
              />
            )
          ) : (
            <div className="cards two">
              {catalog
                .filter((q) => progress.started.includes(q.id))
                .map((q) => (
                  <QuestCard key={q.id} quest={q} />
                ))}
              {!catalog.some((q) => progress.started.includes(q.id)) && (
                <Empty
                  title="Your next quest awaits"
                  description="Join a SideQuest and start a new story."
                />
              )}
            </div>
          )}
        </div>
        <aside>
          <StreakCard />
          <section className="panel">
            <h3>Your WeOut account</h3>
            <p>
              {live
                ? "Trips, profile details, and quest progress use your WeOut account. Inspiration saves and notes stay on this browser."
                : "You’re exploring in preview mode. Your activity stays on this browser, under your preview username."}
            </p>
            <button
              disabled={busy}
              className="icon-button"
              style={{ marginTop: 15 }}
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  await leave();
                  router.push("/");
                } catch (e) {
                  setError(errorMessage(e));
                } finally {
                  setBusy(false);
                }
              }}
            >
              <LogOut size={17} />
              {live ? "Sign out" : "Leave preview"}
            </button>
          </section>
          <ErrorText error={!edit ? error : ""} />
        </aside>
      </div>
      {edit && (
        <Modal title="A little about you" onClose={() => setEdit(false)}>
          <form className="form" onSubmit={submit}>
            <Field label="Name">
              <input
                required
                minLength={2}
                maxLength={80}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </Field>
            <Field label="Username">
              <input
                required
                pattern="[a-z0-9_]{3,30}"
                value={draft.username}
                onChange={(e) =>
                  setDraft({ ...draft, username: e.target.value })
                }
              />
            </Field>
            <Field label="Your story">
              <textarea
                maxLength={500}
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
              />
            </Field>
            <span className="field">Your travel style</span>
            <div className="tags">
              {categories.slice(1).map((c) => (
                <button
                  type="button"
                  className="chip"
                  aria-pressed={draft.style.includes(c)}
                  key={c}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      style: draft.style.includes(c)
                        ? draft.style.filter((s) => s !== c)
                        : [...draft.style, c],
                    })
                  }
                >
                  {c}
                </button>
              ))}
            </div>
            <ErrorText error={error} />
            <button className="button" disabled={busy}>
              {busy ? "Saving…" : "Save profile"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
