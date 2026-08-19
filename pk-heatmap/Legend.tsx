export default function Legend() {
  return (
    <div className="w-[240px] rounded-xl border border-white/15 bg-[#0d1319]/95 px-4 py-3 shadow-panel backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-200">Key</span>
        <span className="text-[10px] text-slate-500">Competitive intensity</span>
      </div>
      <div
        className="h-3 w-full rounded-full ring-1 ring-inset ring-white/10"
        style={{
          background:
            "linear-gradient(to right, #ffe600 0%, #ffab00 25%, #ff6600 50%, #cc1f1f 75%, #650000 100%)",
        }}
      />
      <div className="mt-1 flex justify-between text-[10px] text-slate-500">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] font-medium">
        <span className="text-yellow-300">Low</span>
        <span className="text-orange-400">Moderate</span>
        <span className="text-red-500">High</span>
        <span className="text-red-700">Highest</span>
      </div>
    </div>
  );
}
