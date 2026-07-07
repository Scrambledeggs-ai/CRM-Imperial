import { Sidebar } from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-content">
      <Sidebar />
      <main className="flex-1 px-8 py-8 sm:px-11 sm:py-8">{children}</main>
    </div>
  );
}
