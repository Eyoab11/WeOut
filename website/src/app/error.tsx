"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="wrap final-cta">
      <h1>A small detour.</h1>
      <p style={{ marginBlock: 25 }}>
        We couldn’t load this page. Give it another try.
      </p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
