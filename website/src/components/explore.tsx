"use client";
import { useState } from "react";
import Image from "next/image";
import { Bookmark, Camera, Heart, Share2 } from "lucide-react";
import { useTravel } from "@/lib/travel-provider";
import { Empty, Filters, Heading, errorMessage, ErrorText } from "./ui";
import { PhotoForm } from "./forms";
const inspiration = [
  {
    id: "lake-story",
    name: "Sofia Carter",
    avatar: "/images/traveler-3.jpg",
    image: "/images/lake-como.jpg",
    place: "Lake Como, Italy",
    caption:
      "No itinerary. Just a lakeside path and nowhere else I needed to be.",
    category: "Nature",
  },
  {
    id: "food-story",
    name: "Alex Rivera",
    avatar: "/images/traveler-2.jpg",
    image: "/images/food.jpg",
    place: "Barcelona, Spain",
    caption:
      "Asked a local for their favorite spot. Found a new favorite of my own.",
    category: "Food",
  },
  {
    id: "coast-story",
    name: "Emma Chen",
    avatar: "/images/traveler-1.jpg",
    image: "/images/coast.jpg",
    place: "Along the coast",
    caption:
      "Sometimes the best part of a trip is the turn you almost didn’t take.",
    category: "Adventure",
  },
];
function Post({
  post,
}: {
  post: {
    id: string;
    name: string;
    image: string;
    place: string;
    caption: string;
    avatar?: string;
    sample?: boolean;
  };
}) {
  const { local, toggle, update } = useTravel();
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  async function share() {
    setError("");
    try {
      const url = new URL("/explore", window.location.origin).href;
      if (navigator.share)
        await navigator.share({
          title: "A little WeOut inspiration",
          text: post.caption,
          url,
        });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      }
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError"))
        setError(errorMessage(e));
    }
  }
  return (
    <article className="card">
      <div className="post-head">
        {post.avatar ? (
          <Image
            src={post.avatar}
            alt=""
            width={38}
            height={38}
            className="avatar"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span className="avatar">{post.name[0]}</span>
        )}
        <div>
          <strong>{post.name}</strong>
          <p>
            {post.place}
            {post.sample ? " · Sample story" : ""}
          </p>
        </div>
      </div>
      <img
        src={post.image}
        alt={post.caption}
        className="post-photo"
        loading="lazy"
      />
      <div className="card-body">
        <div className="row">
          <div>
            <button
              className="icon-button"
              aria-label="Like this story locally"
              aria-pressed={local.liked.includes(post.id)}
              onClick={() => toggle("liked", post.id)}
            >
              <Heart
                size={20}
                fill={local.liked.includes(post.id) ? "currentColor" : "none"}
              />
            </button>
            <button
              className="icon-button"
              aria-label="Share Explore page"
              onClick={() => void share()}
            >
              <Share2 size={19} />
            </button>
          </div>
          <button
            className="icon-button"
            aria-label="Save story on this browser"
            aria-pressed={local.saved.includes(post.id)}
            onClick={() => toggle("saved", post.id)}
          >
            <Bookmark
              size={20}
              fill={local.saved.includes(post.id) ? "currentColor" : "none"}
            />
          </button>
        </div>
        <p style={{ color: "var(--ink)", marginTop: 12 }}>{post.caption}</p>
        {copied && (
          <p className="small" role="status">
            Explore link copied.
          </p>
        )}
        <ErrorText error={error} />
        {(local.comments[post.id] || []).length > 0 && (
          <ul className="comment-list">
            {local.comments[post.id].map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        )}
        <form
          className="comment-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!comment.trim()) return;
            update((s) => ({
              ...s,
              comments: {
                ...s.comments,
                [post.id]: [...(s.comments[post.id] || []), comment.trim()],
              },
            }));
            setComment("");
          }}
        >
          <input
            aria-label="Add a local note"
            placeholder="Add a note, just for you…"
            value={comment}
            maxLength={500}
            onChange={(e) => setComment(e.target.value)}
          />
          <button className="button small" disabled={!comment.trim()}>
            Add
          </button>
        </form>
      </div>
    </article>
  );
}
export function Explore() {
  const { local, progress } = useTravel();
  const [category, setCategory] = useState("All");
  const [create, setCreate] = useState(false);
  const posts = inspiration.filter(
    (p) =>
      category === "All" ||
      p.category === category ||
      (category === "Saved" && local.saved.includes(p.id)),
  );
  const personal = progress.posts.filter(
    (p) =>
      category === "All" ||
      category === "My moments" ||
      (category === "Saved" && local.saved.includes(p.id)),
  );
  return (
    <>
      <Heading
        eyebrow="POSTCARDS FROM OUT THERE"
        title="A world worth getting lost in."
        description="A little inspiration for your next ‘let’s go’."
        action={
          <button className="button" onClick={() => setCreate(true)}>
            <Camera size={18} />
            Share a moment
          </button>
        }
      />
      <Filters
        options={["All", "Nature", "Food", "Adventure", "My moments", "Saved"]}
        value={category}
        onChange={setCategory}
      />
      <p className="small muted" style={{ marginBottom: 22 }}>
        Curated sample stories alongside your photo posts. Likes, saves, and
        notes stay on this browser.
      </p>
      {posts.length + personal.length ? (
        <div className="cards two">
          {personal.map((p) => (
            <Post
              key={p.id}
              post={{ ...p, name: local.profile.name, image: p.photoUri }}
            />
          ))}
          {posts.map((p) => (
            <Post key={p.id} post={{ ...p, sample: true }} />
          ))}
        </div>
      ) : (
        <Empty
          title="Your story starts here"
          description="Share a photo from your next little adventure, or save a story that inspires you."
        />
      )}
      {create && <PhotoForm onClose={() => setCreate(false)} />}
    </>
  );
}
