"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Brand } from "./brand";
import { Field, ErrorText, errorMessage } from "./ui";
import { supabase } from "@/lib/supabase";
import { useTravel } from "@/lib/travel-provider";
export function Auth({ signup = false }: { signup?: boolean }) {
  const router = useRouter();
  const { enterPreview } = useTravel();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (!supabase) {
        enterPreview(String(data.get("username")));
        router.push("/home");
        return;
      }
      const email = String(data.get("email")).trim(),
        password = String(data.get("password"));
      const result = signup
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { display_name: String(data.get("name")).trim() },
              emailRedirectTo: `${window.location.origin}/home`,
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (result.data.session) router.push("/home");
      else
        setMessage(
          "Check your email to confirm your account, then come back to log in.",
        );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main" className="auth-layout">
      <section className="auth-art">
        <Image
          src="/images/coast.jpg"
          alt="A quiet coast waiting to be explored"
          fill
          priority
          sizes="50vw"
          className="cover"
        />
        <Brand light />
        <div>
          <span className="eyebrow" style={{ color: "var(--lime)" }}>
            LESS SCROLLING. MORE LIVING.
          </span>
          <h2>
            Good stories
            <br />
            start with
            <br />
            <em>“let’s go.”</em>
          </h2>
          <p>
            Find your people, explore your world, and make a little room for the
            unexpected.
          </p>
        </div>
      </section>
      <section className="auth-content">
        <div className="auth-mobile-brand">
          <Brand />
        </div>
        <Link className="text-link" href="/">
          ← Back to WeOut
        </Link>
        <h1>
          {!supabase
            ? "Take a look around."
            : signup
              ? "Your next chapter."
              : "Good to see you."}
        </h1>
        <p>
          {!supabase
            ? "Explore WeOut with a local preview profile. No password or account required."
            : signup
              ? "A little curiosity. A world of possibility."
              : "Your next adventure is right where you left it."}
        </p>
        <form className="form" onSubmit={submit}>
          {!supabase ? (
            <Field label="Preview username">
              <input
                name="username"
                autoComplete="username"
                required
                minLength={3}
                maxLength={30}
                pattern="[a-z0-9_]{3,30}"
                defaultValue="alexrivera"
              />
              <small>
                Lowercase letters, numbers, and underscores. This is a local
                preview, not a secure account.
              </small>
            </Field>
          ) : (
            <>
              {signup && (
                <Field label="Your name">
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={80}
                  />
                </Field>
              )}
              <Field label="Email address">
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="Password">
                <input
                  name="password"
                  type="password"
                  autoComplete={signup ? "new-password" : "current-password"}
                  required
                  minLength={signup ? 8 : 1}
                />
                {signup && <small>Use at least 8 characters.</small>}
              </Field>
            </>
          )}
          <ErrorText error={error} />
          {message && (
            <p className="success" role="status">
              {message}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy
              ? "One moment…"
              : !supabase
                ? "Enter preview"
                : signup
                  ? "Create account"
                  : "Log in"}
            <ArrowUpRight size={18} />
          </button>
        </form>
        {supabase && (
          <p className="small">
            {signup ? "Already part of the adventure?" : "New around here?"}{" "}
            <Link href={signup ? "/login" : "/signup"}>
              {signup ? "Log in" : "Create an account"}
            </Link>
          </p>
        )}
        <Link href="/home" className="text-link" style={{ marginTop: 25 }}>
          Explore first <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}
