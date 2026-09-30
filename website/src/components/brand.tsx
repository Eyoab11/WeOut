import Link from "next/link";
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      className={`brand ${light ? "brand-light" : ""}`}
      href="/"
      aria-label="WeOut home"
    >
      <svg width="41" height="30" viewBox="0 0 100 62" aria-hidden="true">
        <path d="M3 58 43 3 65 39 48 29 28 54Z" fill="currentColor" />
        <path d="m43 3 8 28-8-7-15 30 20-25 17 10Z" fill="#3E896A" />
        <path d="m49 57 25-46 25 47-19-7-7-17-13 25Z" fill="#80AB94" />
        <path d="m49 57 14-28 10 5 7 17-16-11Z" fill="#286F50" />
      </svg>
      <span>
        WeOut<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
