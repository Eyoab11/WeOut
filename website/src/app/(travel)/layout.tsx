import { AppShell } from "@/components/app-shell";
export default function TravelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
