import { Suspense } from "react";
import { PlaceDetail } from "@/components/details";
export const metadata = { title: "A place worth discovering" };
export default function Page() {
  return (
    <Suspense fallback={<p>Opening the place…</p>}>
      <PlaceDetail />
    </Suspense>
  );
}
