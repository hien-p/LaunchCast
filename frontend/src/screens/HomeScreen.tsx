import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Headphones, Play, Plus, Clock, Podcast } from "lucide-react";
import { fetchEpisodes } from "../lib/api";
import type { EpisodeSummary } from "../lib/types";

const Cd = lazy(() => import("../components/ascii/cd"));

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function EpisodeCard({
  episode,
  onClick,
}: {
  episode: EpisodeSummary;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left w-full transition-all duration-200 hover:scale-[1.02]"
    >
      <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-black shadow-xl shadow-black/30">
        {/* CD ASCII animation background */}
        <div
          className="absolute inset-0 overflow-hidden ascii-card-bg"
          style={{ color: "#ffffff", backgroundColor: "#000000" }}
        >
          <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-[#7c6cf6] to-[#f97316]" />}>
            <Cd />
          </Suspense>
        </div>

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Sheen effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.1) 100%)",
            mixBlendMode: "overlay",
          }}
        />

        {/* Border glow */}
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {episode.product_count > 0 && (
            <div className="bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
              {episode.product_count} products
            </div>
          )}
          {episode.duration_seconds > 0 && (
            <div className="bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(episode.duration_seconds)}
            </div>
          )}
        </div>

        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center z-10">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 scale-75 group-hover:scale-100 shadow-xl">
            <Play className="w-6 h-6 text-gray-900 ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* Title at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className="text-[14px] font-bold text-white leading-snug line-clamp-2 drop-shadow-lg">
            {episode.title || `Episode — ${formatDate(episode.date)}`}
          </h3>
          <p className="text-[12px] text-white/60 mt-1">
            {formatDate(episode.date)}
          </p>
        </div>
      </div>
    </button>
  );
}

export function HomeScreen() {
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState<EpisodeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEpisodes()
      .then(setEpisodes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-svh bg-[#fafafa]">
      {/* Background texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url(/assets/ascii-dark.gif)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
        }}
      />

      <div className="relative z-[1]">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c6cf6] to-[#f97316] flex items-center justify-center">
                <Headphones className="w-4 h-4 text-white" />
              </div>
              <span className="text-[15px] font-bold text-gray-900 tracking-tight">LaunchCast</span>
            </div>
            <button
              onClick={() => navigate("/setup")}
              className="flex items-center gap-1.5 text-[13px] font-medium text-white bg-[#7c6cf6] hover:bg-[#6b5ce6] px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Episode
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c6cf6] to-[#f97316] flex items-center justify-center shadow-lg shadow-[#7c6cf6]/20">
              <Podcast className="w-5 h-5 text-white" />
            </div>
            <span className="text-[13px] font-medium text-[#7c6cf6] bg-[#7c6cf6]/10 px-3 py-1 rounded-full">
              AI Podcast Studio
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
            Your Episodes
          </h1>
          <p className="text-[15px] text-gray-500 max-w-lg">
            AI-generated podcast episodes covering the latest product launches.
            Each episode features Aero & Nova breaking down what's new.
          </p>
        </section>

        {/* Episodes grid */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c6cf6] to-[#f97316] flex items-center justify-center animate-pulse">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm text-gray-400">Loading episodes...</p>
              </div>
            </div>
          ) : episodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Podcast className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No episodes yet</h3>
              <p className="text-sm text-gray-500 mb-6">Create your first AI podcast episode to get started.</p>
              <button
                onClick={() => navigate("/setup")}
                className="flex items-center gap-2 text-sm font-medium text-white bg-[#7c6cf6] hover:bg-[#6b5ce6] px-5 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Generate Episode
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Episodes
                  <span className="ml-2 text-[13px] font-normal text-gray-400">
                    {episodes.length} {episodes.length === 1 ? "episode" : "episodes"}
                  </span>
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {episodes.map((ep) => (
                  <EpisodeCard
                    key={ep.id}
                    episode={ep}
                    onClick={() => navigate(`/episodes/${ep.id}`)}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
