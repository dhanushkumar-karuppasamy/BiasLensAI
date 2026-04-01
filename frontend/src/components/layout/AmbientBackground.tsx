const orbs = [
  "left-[6%] top-[4%] h-64 w-64 bg-cyan-300/20",
  "right-[8%] top-[10%] h-72 w-72 bg-indigo-300/20",
  "left-[28%] bottom-[8%] h-80 w-80 bg-blue-200/20",
];

export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {orbs.map((orbClass, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-3xl ${orbClass}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-100/70" />
    </div>
  );
}
