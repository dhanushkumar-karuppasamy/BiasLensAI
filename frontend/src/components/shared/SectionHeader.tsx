type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
};

export function SectionHeader({ eyebrow, title, description, className }: SectionHeaderProps) {
  return (
    <div className={className ?? "mb-7 max-w-3xl space-y-3"}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
      <h2 className="text-balance text-3xl font-semibold leading-tight text-gradient-subtle md:text-4xl">{title}</h2>
      <p className="text-sm leading-relaxed text-slate-600 md:text-base">{description}</p>
    </div>
  );
}
