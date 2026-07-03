import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6">{children}</main>
      </div>
    </div>
  );
}
