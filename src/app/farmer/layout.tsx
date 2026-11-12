import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function FarmerLayout({ children }: LayoutProps<"/farmer">) {
  return <DashboardShell role="farmer">{children}</DashboardShell>;
}
