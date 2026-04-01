import type { PropsWithChildren } from "react";
import { cn } from "../../lib/cn";

type SectionContainerProps = PropsWithChildren<{
  className?: string;
  id?: string;
}>;

export function SectionContainer({ children, className, id }: SectionContainerProps) {
  return (
    <section id={id} className={cn("mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10", className)}>
      {children}
    </section>
  );
}
