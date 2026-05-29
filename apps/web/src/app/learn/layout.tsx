'use client';

import { Sidebar } from '@/components/shell/Sidebar';
import { Topbar } from '@/components/shell/Topbar';
import { CommandPalette } from '@/components/shell/CommandPalette';

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[--bg-primary]">
      {/* Global Topbar */}
      <Topbar />

      {/* Body: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Command Palette — always mounted, opens via ⌘K internally */}
      <CommandPalette />
    </div>
  );
}
