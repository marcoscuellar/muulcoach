import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-screen grid-cols-[248px_1fr] overflow-hidden bg-paper text-ink">
      <Sidebar />
      <main className="flex flex-col overflow-y-auto">
        <TopBar />
        <div className="min-h-0 flex-1">{children}</div>
      </main>
    </div>
  );
}
