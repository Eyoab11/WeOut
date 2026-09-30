"use client";
import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Bookmark,
  Check,
  Clock3,
  Compass,
  Flame,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { useTravel } from "@/lib/travel-provider";
import { questImage, places } from "@/lib/data";
import { dayKey, streakFor, type StoredQuest } from "@/lib/quest-model";
export function Heading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder = "Search for your next adventure",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="search">
      <Search />
      <input
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
export function Filters({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="filters" aria-label="Filter options">
      {options.map((option) => (
        <button
          className={`chip ${value === option ? "active" : ""}`}
          key={option}
          aria-pressed={value === option}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
export function Empty({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <Compass size={35} />
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function SaveButton({ id, label }: { id: string; label: string }) {
  const { local, toggle } = useTravel();
  const active = local.saved.includes(id);
  return (
    <button
      className="save-button"
      aria-label={`${active ? "Unsave" : "Save"} ${label}`}
      aria-pressed={active}
      onClick={() => toggle("saved", id)}
    >
      <Bookmark size={18} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
export function QuestCard({ quest }: { quest: StoredQuest }) {
  const { progress } = useTravel();
  return (
    <article className="card">
      <div className="card-media">
        <Link href={`/sidequests/detail?id=${encodeURIComponent(quest.id)}`}>
          <Image
            src={questImage(quest.category)}
            alt={quest.title}
            fill
            sizes="(max-width: 600px) 90vw, 30vw"
            className="cover"
          />
        </Link>
        <span className="badge">
          {progress.completed[quest.id]
            ? "COMPLETED"
            : progress.started.includes(quest.id)
              ? "IN PROGRESS"
              : quest.tag}
        </span>
        <SaveButton id={quest.id} label={quest.title} />
      </div>
      <div className="card-body">
        <span className="eyebrow">{quest.category}</span>
        <h3>
          <Link href={`/sidequests/detail?id=${encodeURIComponent(quest.id)}`}>
            {quest.title}
          </Link>
        </h3>
        <p>{quest.description}</p>
        <div className="card-meta">
          <span>
            <Clock3 size={14} />
            {quest.minutes} min
          </span>
          <span>
            <MapPin size={14} />
            {quest.distance || "Your area"}
          </span>
        </div>
        <div className="card-actions">
          <span className="badge">{quest.xp} XP · preview</span>
          <Link
            className="text-link"
            href={`/sidequests/detail?id=${encodeURIComponent(quest.id)}`}
          >
            View quest <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}
export function PlaceCard({ place }: { place: (typeof places)[number] }) {
  return (
    <article className="card">
      <div className="card-media">
        <Link href={`/place?id=${place.id}`}>
          <Image
            src={place.image}
            alt={place.name}
            fill
            sizes="(max-width: 600px) 90vw, 30vw"
            className="cover"
          />
        </Link>
        <span className="badge">{place.tag}</span>
        <SaveButton id={place.id} label={place.name} />
      </div>
      <div className="card-body">
        <span className="eyebrow">{place.category}</span>
        <h3>
          <Link href={`/place?id=${place.id}`}>{place.name}</Link>
        </h3>
        <p>{place.description}</p>
        <div className="card-actions">
          <span className="small muted">Barcelona · Sample place</span>
          <Link
            href={`/place?id=${place.id}`}
            aria-label={`View ${place.name}`}
          >
            <ArrowUpRight size={19} />
          </Link>
        </div>
      </div>
    </article>
  );
}
export function StreakCard() {
  const { progress } = useTravel();
  const streak = streakFor(progress.days);
  return (
    <section className="panel streak">
      <Flame size={26} />
      <h2>Keep the good days going.</h2>
      <div className="streak-number">
        {streak.current} <span>day streak</span>
      </div>
      <p>
        One photo. One reason to get out.
        <br />
        Your longest streak: {streak.longest} days.
      </p>
      <div className="week">
        {Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setUTCDate(date.getUTCDate() - 6 + i);
          const key = dayKey(date);
          const done = progress.days.includes(key);
          return (
            <span
              key={key}
              className={done ? "done" : ""}
              title={`${key}${done ? ": photo posted" : ""}`}
            >
              {done ? (
                <Check size={14} />
              ) : (
                date.toLocaleDateString("en", {
                  weekday: "narrow",
                  timeZone: "UTC",
                })
              )}
            </span>
          );
        })}
      </div>
    </section>
  );
}
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const node = ref.current;
    node?.showModal();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      node?.close();
      document.body.style.overflow = prev;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={id}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) {
          const r = ref.current.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="dialog-heading">
        <h2 id={id}>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function ErrorText({ error }: { error: string }) {
  return error ? (
    <p className="error" role="alert">
      {error}
    </p>
  ) : null;
}
export function errorMessage(e: unknown) {
  return typeof e === "object" && e !== null && "message" in e
    ? String(e.message)
    : "Something went wrong. Please try again.";
}
