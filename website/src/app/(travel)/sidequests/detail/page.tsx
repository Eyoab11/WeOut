import { Suspense } from "react";
import { QuestDetail } from "@/components/details";
export const metadata = { title: "Your SideQuest" };
export default function Page() {
  return (
    <Suspense fallback={<p>Opening your quest…</p>}>
      <QuestDetail />
    </Suspense>
  );
}
