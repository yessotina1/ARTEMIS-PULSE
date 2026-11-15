import { AppShell } from "@/components/layout/app-shell";

export default function PlannerLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
