"use client";
import { useRef, useState } from "react";
import { Camera, LocateFixed, Sparkles } from "lucide-react";
import { useTravel } from "@/lib/travel-provider";
import {
  CATEGORIES,
  generateQuest,
  questSchema,
  type StoredQuest,
} from "@/lib/quest-model";
import { Field, Modal, ErrorText, errorMessage } from "./ui";
export function QuestForm({ onClose }: { onClose: () => void }) {
  const { createQuest } = useTravel();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>("Adventure");
  const [minutes, setMinutes] = useState(30);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = questSchema.parse({ title, description, category, minutes });
      await createQuest({
        ...data,
        id: crypto.randomUUID(),
        kind: generated ? "generated" : "custom",
        xp: Math.min(150, 50 + data.minutes),
        tag: generated ? "FOR YOU" : "COMMUNITY",
        distance: "Your area",
      });
      onClose();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="A little adventure, your way" onClose={onClose}>
      <form className="form" onSubmit={save}>
        <div className="form-row">
          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Time available (minutes)">
            <input
              type="number"
              min={5}
              max={180}
              required
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            />
          </Field>
        </div>
        <button
          type="button"
          className="button secondary"
          onClick={() => {
            const q = generateQuest(
              category,
              Math.max(5, Math.min(180, minutes || 30)),
            );
            setTitle(q.title);
            setDescription(q.description);
            setGenerated(true);
          }}
        >
          <Sparkles size={17} />
          Suggest an idea
        </button>
        <p className="small muted">
          Suggestions come from the same curated templates as the app.
        </p>
        <Field label="Quest title">
          <input
            required
            minLength={4}
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Find a new favorite corner"
          />
        </Field>
        <Field label="What’s the adventure?">
          <textarea
            required
            minLength={15}
            maxLength={1000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what to discover and photograph…"
          />
        </Field>
        <ErrorText error={error} />
        <button disabled={busy} className="button">
          {busy ? "Saving…" : "Create SideQuest"}
        </button>
      </form>
    </Modal>
  );
}
async function preparePhoto(file: File): Promise<{ blob: Blob; uri: string }> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type))
    throw new Error("Choose a JPEG, PNG, or WebP photo.");
  if (file.size > 20 * 1024 * 1024)
    throw new Error("Choose a photo smaller than 20 MB.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Could not prepare the photo. Try a different browser.");
  }
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not prepare photo."))),
      "image/jpeg",
      0.8,
    ),
  );
  if (blob.size > 8 * 1024 * 1024)
    throw new Error("Choose a smaller photo (under 8 MB).");
  return { blob, uri: canvas.toDataURL("image/jpeg", 0.8) };
}
export function PhotoForm({
  quest,
  onClose,
}: {
  quest?: StoredQuest;
  onClose: () => void;
}) {
  const { publish } = useTravel();
  const [photo, setPhoto] = useState<{ blob: Blob; uri: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const request = useRef<{
    id: string;
    caption: string;
    place: string;
    photo: { blob: Blob; uri: string };
  } | null>(null);
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || preparing) return;
    setError("");
    if (!photo) {
      setError("Add your own photo to capture the moment.");
      return;
    }
    const data = new FormData(e.currentTarget);
    const caption =
        request.current?.caption ?? String(data.get("caption") || "").trim(),
      place = request.current?.place ?? String(data.get("place") || "").trim();
    if (caption.length < 5 || !place) {
      setError("Add a caption of at least 5 characters and a location.");
      return;
    }
    setBusy(true);
    try {
      if (!request.current)
        request.current = { id: crypto.randomUUID(), caption, place, photo };
      const saved = request.current;
      await publish(
        {
          id: saved.id,
          caption: saved.caption,
          place: saved.place,
          photoUri: saved.photo.uri,
          createdAt: new Date().toISOString(),
          questId: quest?.id,
          questTitle: quest?.title,
        },
        saved.photo.blob,
      );
      onClose();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={quest ? "Capture your SideQuest" : "Share a little moment"}
      onClose={onClose}
    >
      <form className="form" onSubmit={save}>
        {quest && (
          <p className="small">
            {quest.title} · A photo completes your quest and counts toward
            today’s streak.
          </p>
        )}
        <Field label="Your photo">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy || !!request.current}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError("");
              setPhoto(null);
              setPreparing(true);
              try {
                setPhoto(await preparePhoto(file));
              } catch (e) {
                setError(errorMessage(e));
              } finally {
                setPreparing(false);
              }
            }}
          />
          <small>JPEG, PNG or WebP · up to 20 MB before compression.</small>
        </Field>
        {preparing && <p role="status">Preparing your photo…</p>}
        {photo && (
          <img
            src={photo.uri}
            alt="Your selected photo"
            className="form-preview"
          />
        )}
        <Field label="The story behind it">
          <textarea
            name="caption"
            required
            minLength={5}
            maxLength={1000}
            disabled={busy || !!request.current}
            placeholder="What made you stop and look?"
          />
        </Field>
        <Field label="Place">
          <input
            name="place"
            required
            maxLength={200}
            disabled={busy || !!request.current}
            placeholder="A city, neighborhood, or trail"
          />
        </Field>
        <ErrorText error={error} />
        {request.current && error && (
          <p className="small muted">
            Retry will use your original photo and caption to avoid duplicate
            posts.
          </p>
        )}
        <button className="button" disabled={busy || preparing}>
          <Camera size={18} />
          {busy
            ? "Publishing…"
            : request.current
              ? "Retry publication"
              : quest
                ? "Post photo & complete quest"
                : "Publish photo"}
        </button>
      </form>
    </Modal>
  );
}
export function TripForm({ onClose }: { onClose: () => void }) {
  const { saveTrip, live } = useTravel();
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const d = new FormData(e.currentTarget);
    try {
      const start = String(d.get("start")),
        end = String(d.get("end"));
      if (end < start)
        throw new Error("Your end date must be on or after your start date.");
      if (
        !lat.trim() ||
        !lng.trim() ||
        !Number.isFinite(Number(lat)) ||
        !Number.isFinite(Number(lng)) ||
        Math.abs(Number(lat)) > 90 ||
        Math.abs(Number(lng)) > 180
      )
        throw new Error("Add valid destination coordinates.");
      await saveTrip({
        title: String(d.get("title")).trim(),
        destination: String(d.get("destination")).trim(),
        starts_on: start,
        ends_on: end,
        latitude: Number(lat),
        longitude: Number(lng),
        shared: d.get("shared") === "on",
      });
      onClose();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  function locate() {
    if (!navigator.geolocation) {
      setError("Location is unavailable. Enter destination coordinates below.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLat(String(p.coords.latitude));
        setLng(String(p.coords.longitude));
        setLocating(false);
      },
      () => {
        setError(
          "Location access was unavailable. Enter the destination coordinates below.",
        );
        setLocating(false);
      },
      { timeout: 15000 },
    );
  }
  return (
    <Modal title="Make room for adventure" onClose={onClose}>
      <form className="form" onSubmit={save}>
        <Field label="Trip name">
          <input
            name="title"
            required
            minLength={2}
            maxLength={100}
            placeholder="A weekend by the sea"
          />
        </Field>
        <Field label="Destination">
          <input
            name="destination"
            required
            minLength={2}
            maxLength={200}
            placeholder="Barcelona, Spain"
          />
        </Field>
        <div className="form-row">
          <Field label="Start date">
            <input type="date" name="start" required />
          </Field>
          <Field label="End date">
            <input type="date" name="end" required />
          </Field>
        </div>
        <div className="form-row">
          <Field label="Destination latitude">
            <input
              type="number"
              step="any"
              min={-90}
              max={90}
              required
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
          </Field>
          <Field label="Destination longitude">
            <input
              type="number"
              step="any"
              min={-180}
              max={180}
              required
              value={lng}
              onChange={(e) => setLng(e.target.value)}
            />
          </Field>
        </div>
        <button
          type="button"
          disabled={locating}
          className="text-link icon-button"
          onClick={locate}
        >
          <LocateFixed size={17} />
          {locating
            ? "Finding location…"
            : "Use my current location as the destination"}
        </button>
        {live ? (
          <label className="check-row">
            <input type="checkbox" name="shared" />
            Share this destination with nearby travelers
          </label>
        ) : (
          <p className="small muted">
            This plan is saved on this browser. It won’t book anything or be
            shared.
          </p>
        )}
        <ErrorText error={error} />
        <button className="button" disabled={busy || locating}>
          {busy ? "Saving…" : "Save trip"}
        </button>
      </form>
    </Modal>
  );
}
