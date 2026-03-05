interface Props {
  photoCount: number;
}

export default function Header({ photoCount }: Props) {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-white/[0.07] bg-black/40 backdrop-blur-2xl z-10 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Logo mark */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(68,136,255,0.45)]">
          📸
        </div>
        <div>
          <h1 className="text-white font-bold text-base tracking-tight leading-none mb-0.5">
            3D Photo Booth
          </h1>
          <p className="text-white/35 text-[11px]">Phase 1 — Core 3D Engine</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {photoCount > 0 && (
          <span className="text-white/40 text-xs">
            {photoCount} photo{photoCount !== 1 ? "s" : ""} in scene
          </span>
        )}
        <div className="px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-[11px] font-semibold">
          ✦ LIVE 3D
        </div>
      </div>
    </header>
  );
}