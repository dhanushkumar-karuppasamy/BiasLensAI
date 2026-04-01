import type { PropsWithChildren } from "react";
import { AppSidebar } from "./AppSidebar";
import { AmbientBackground } from "./AmbientBackground";
import { SectionTabs } from "./SectionTabs";
import { TopNav } from "./TopNav";

type PageShellProps = PropsWithChildren<{
  title?: string;
}>;

export function PageShell({ children }: PageShellProps) {
  return (
    <div data-theme="light" className="relative min-h-screen overflow-x-hidden">
      <AmbientBackground />
      <div className="relative z-10 flex min-h-screen">
        <AppSidebar />
        <div className="min-w-0 flex-1">
          <TopNav />
          <SectionTabs />
          <main className="mx-auto max-w-[1280px] px-2 pb-10 md:px-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
