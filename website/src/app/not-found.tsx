import Link from "next/link";
import { Brand } from "@/components/brand";
export default function NotFound() {
  return (
    <main id="main" className="wrap final-cta">
      <Brand />
      <h1 style={{ marginBlock: 30 }}>A little off the trail.</h1>
      <p>That page isn’t here. There’s still plenty to explore.</p>
      <Link href="/home" className="button">
        Find your way back
      </Link>
    </main>
  );
}
