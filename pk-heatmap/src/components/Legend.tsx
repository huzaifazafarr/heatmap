export default function Legend() {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111820] px-4 py-3 shadow-panel">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
        Competitive intensity
      </div>
      <div
        className="h-2.5 w-full rounded-full"
        style={{ background: "linear-gradient(to right, #0ca30c, #fab219, #d03b3b)" }}
      />
      <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
        <span>Low competition</span>
        <span>Moderate</span>
        <span>Highly competitive</span>
      </div>
    </div>
  );
}
