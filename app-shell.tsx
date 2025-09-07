import { ReactNode } from "react";
import HeaderBar from "./header-bar";
import SidebarNav from "./sidebar-nav";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar />
      <div className="flex">
        <SidebarNav />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
