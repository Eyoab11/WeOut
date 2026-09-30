import { Suspense } from "react";
import { TripDetail } from "@/components/details";
export const metadata = { title: "Your trip plan" };
export default function Page() {
  return (
    <Suspense fallback={<p>Opening your trip…</p>}>
      <TripDetail />
    </Suspense>
  );
}
