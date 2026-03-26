import { useEffect, useState, useRef } from "react";
import {
  Headphones,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Settings,
} from "lucide-react";
import { fetchEpisode, fetchEpisodes, getAudioUrl } from "../lib/api";
import { ProductDeepDive } from "../components/ProductDeepDive";
import {
  AudioPlayerProvider,
  AudioPlayerProgress,
  AudioPlayerTime,
  AudioPlayerDuration,
  useAudioPlayer,
  useAudioPlayerTime,
} from "@/components/ui/audio-player";
import type { Episode, EpisodeSummary, Product, ScriptLine } from "../lib/types";

interface PlayerScreenProps {
  episodeId?: string;
  onBack: () => void;
}

/* ── Dot Grid Background ── */
function DotGrid() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `radial-gradient(circle, #d1d5db 0.8px, transparent 0.8px)`,
        backgroundSize: "24px 24px",
        opacity: 0.4,
      }}
    />
  );
}

/* ── Product Card (floating with blur) ── */
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-xl">
      {/* Gradient visual placeholder */}
      <div className="h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative text-center px-6">
          <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-2">
            Now Discussing
          </p>
          <h3 className="text-white text-2xl font-bold">{product.name}</h3>
          <p className="text-white/80 text-sm mt-1 max-w-md">{product.tagline}</p>
        </div>
        {/* Bottom caption bar like ElevenLabs video */}
        <div className="absolute bottom-0 inset-x-0 bg-black/50 backdrop-blur-sm px-4 py-2">
          <p className="text-white/90 text-xs font-medium truncate text-center">
            {product.tagline}
          </p>
        </div>
      </div>
      {/* Ratings bar */}
      <div className="flex items-center justify-center gap-6 bg-white px-4 py-2 border-t border-gray-100">
        {product.aero_rating > 0 && (
          <span className="text-xs font-semibold text-orange-500">
            AERO: {product.aero_rating}/10
          </span>
        )}
        {product.nova_rating > 0 && (
          <span className="text-xs font-semibold text-emerald-500">
            NOVA: {product.nova_rating}/10
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Transcript Line ── */
function TranscriptLine({
  line,
  isActive,
  lineRef,
  onClick,
}: {
  line: ScriptLine;
  isActive: boolean;
  lineRef?: React.Ref<HTMLDivElement>;
  onClick?: () => void;
}) {
  const isAero = line.speaker === "AERO";

  return (
    <div
      ref={lineRef}
      className="mb-6 cursor-pointer"
      onClick={onClick}
    >
      {/* Speaker label — green like ElevenLabs */}
      <p className="text-sm font-semibold mb-1 text-emerald-500">
        {line.speaker === "AERO" ? "Aero" : "Nova"}
      </p>

      {/* Text — inline highlight on active like ElevenLabs Studio */}
      <p
        className={`text-[17px] leading-[1.8] transition-colors duration-200 ${
          isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
        }`}
        style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
      >
        {isActive
          ? line.text.split(" ").map((word, wi) => (
              <span
                key={wi}
                className="bg-indigo-500/15 rounded-[2px] px-[1px] py-[1px] -mx-[1px]"
              >
                {word}{" "}
              </span>
            ))
          : line.text}
      </p>
    </div>
  );
}

/* ── Main Episode View ── */
function EpisodeView({
  episode,
  onProductClick,
}: {
  episode: Episode;
  onProductClick?: (product: Product) => void;
}) {
  const player = useAudioPlayer();
  const currentTime = useAudioPlayerTime();
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const activeLineRef = useRef<HTMLDivElement>(null);

  const filteredLines = (episode.script || []).filter((l) => l.text.trim());

  useEffect(() => {
    player.setActiveItem({
      id: episode.id,
      src: getAudioUrl(episode.date),
    });
  }, [episode.id]);

  // Calculate start time of a line by index
  const getLineStartTime = (lineIndex: number) => {
    const totalDuration = player.duration || episode.duration_seconds || 1;
    const totalChars = filteredLines.reduce((sum, l) => sum + l.text.length, 0);
    let cumTime = 0;
    for (let i = 0; i < lineIndex; i++) {
      cumTime += (filteredLines[i].text.length / totalChars) * totalDuration;
    }
    return cumTime;
  };

  // Seek to a specific line — wait for browser to confirm seek before playing
  const seekToLine = (lineIndex: number) => {
    const time = getLineStartTime(lineIndex);
    setActiveLineIndex(lineIndex);

    const audio = player.ref.current;
    if (!audio) return;

    // If already playing, just seek — no play needed
    if (!audio.paused) {
      audio.currentTime = time;
      return;
    }

    // If paused: set time, wait for browser to confirm seek, THEN play
    audio.currentTime = time;
    const onSeeked = () => {
      audio.removeEventListener("seeked", onSeeked);
      audio.play().catch(() => {});
    };
    audio.addEventListener("seeked", onSeeked);
  };

  // Track active line — weighted by text length for better sync
  useEffect(() => {
    if (!episode.script || episode.script.length === 0) return;
    const totalDuration = player.duration || episode.duration_seconds || 1;
    const lines = episode.script.filter((l) => l.text.trim());

    // Calculate cumulative time based on character count
    const totalChars = lines.reduce((sum, l) => sum + l.text.length, 0);
    let cumTime = 0;
    let foundIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineDuration = (lines[i].text.length / totalChars) * totalDuration;
      cumTime += lineDuration;
      if (currentTime < cumTime) {
        foundIndex = i;
        break;
      }
      foundIndex = i;
    }

    if (foundIndex !== activeLineIndex) {
      setActiveLineIndex(foundIndex);
      const activeLine = lines[foundIndex];
      if (activeLine?.product_ref) {
        const product = episode.products.find(
          (p) => p.name.toLowerCase() === activeLine.product_ref?.toLowerCase()
        );
        if (product) setCurrentProduct(product);
      }
    }
  }, [currentTime, episode, player.duration, activeLineIndex]);

  // Auto-scroll
  useEffect(() => {
    if (activeLineRef.current && player.isPlaying) {
      activeLineRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeLineIndex, player.isPlaying]);

  return (
    <div className="flex flex-col h-[calc(100svh-64px)]">
      {/* Header */}
      <header className="px-6 py-3 border-b border-gray-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Headphones className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 text-[15px] leading-tight">
                {episode.title}
              </h1>
              <p className="text-xs text-gray-400">
                {new Date(episode.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 bg-white shadow-sm"
          >
            Show Notes
            {showNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Show Notes (collapsible) */}
      {showNotes && (
        <div className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-200/60 px-6 py-4 z-10">
          <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
            {episode.products.map((product) => (
              <button
                key={product.name}
                onClick={() => onProductClick?.(product)}
                className="text-left px-3 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <span className="text-sm font-medium text-gray-800 block truncate">{product.name}</span>
                <span className="text-xs text-gray-400 truncate block mt-0.5">{product.tagline}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transcript with floating product card */}
      <div className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth relative z-0">
        <div className="max-w-3xl mx-auto relative">
          {filteredLines.map((line, i) => (
            <TranscriptLine
              key={i}
              line={line}
              isActive={i === activeLineIndex}
              lineRef={i === activeLineIndex ? activeLineRef : undefined}
              onClick={() => seekToLine(i)}
            />
          ))}
        </div>
        <div className="h-24" />

        {/* Floating Product Card — sits over transcript text like ElevenLabs Studio video */}
        {currentProduct && player.isPlaying && (
          <div className="sticky bottom-24 z-10 flex justify-center pointer-events-none">
            <div className="pointer-events-auto max-w-md w-full mx-6 rounded-2xl overflow-hidden shadow-2xl shadow-black/15 border border-white/60 bg-white/30 backdrop-blur-sm">
              <ProductCard product={currentProduct} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none fixed bottom-[64px] left-0 right-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent z-10" />
    </div>
  );
}

/* ── Sticky Bottom Player Bar (matches ElevenLabs Studio exactly) ── */
function BottomPlayerBar() {
  const player = useAudioPlayer();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
      <div className="max-w-4xl mx-auto">
        {/* Scrub bar — taller touch target */}
        <AudioPlayerProgress className="h-3 rounded-none [&_[data-slot=slider-thumb]]:opacity-100 [&_[data-slot=slider-thumb]>div]:size-3.5 [&_[data-slot=slider-thumb]>div]:bg-gray-900" />

        {/* Controls */}
        <div className="flex items-center px-6 py-2.5 gap-4">
          {/* Left: record dot + play */}
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <button
              onClick={() => (player.isPlaying ? player.pause() : player.play())}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {player.isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
          </div>

          {/* Center: time / duration */}
          <div className="flex-1 flex items-center justify-center gap-1.5 tabular-nums">
            <AudioPlayerTime className="text-sm text-gray-700 font-medium" />
            <span className="text-gray-300 text-sm">/</span>
            <AudioPlayerDuration className="text-sm text-gray-400" />
          </div>

          {/* Right: speed settings */}
          <button
            onClick={() => {
              const speeds = [1, 1.25, 1.5, 2, 0.5, 0.75];
              const currentIdx = speeds.indexOf(player.playbackRate);
              const next = speeds[(currentIdx + 1) % speeds.length];
              player.setPlaybackRate(next);
            }}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Root ── */
export function PlayerScreen({ episodeId, onBack }: PlayerScreenProps) {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [pastEpisodes, setPastEpisodes] = useState<EpisodeSummary[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (episodeId) {
          const ep = await fetchEpisode(episodeId);
          setEpisode(ep);
        }
        const all = await fetchEpisodes();
        setPastEpisodes(all);
        if (!episodeId && all.length > 0) {
          const ep = await fetchEpisode(all[0].id);
          setEpisode(ep);
        }
      } catch {
        setError("No episodes found yet. Generate one first!");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [episodeId]);

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-white">
        <div className="text-gray-400 text-sm">Loading episode...</div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-white gap-4">
        <p className="text-gray-500">{error || "No episodes yet. Generate your first episode!"}</p>
        <button onClick={onBack} className="text-indigo-500 hover:text-indigo-700 text-sm font-medium">
          Back to Setup
        </button>
      </div>
    );
  }

  return (
    <AudioPlayerProvider>
      <div className="min-h-svh bg-white relative">
        <DotGrid />
        <div className="relative z-[1]">
          <EpisodeView
            episode={episode}
            onProductClick={(product) => setSelectedProduct(product)}
          />
          <BottomPlayerBar />
        </div>
      </div>

      {selectedProduct && (
        <ProductDeepDive
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </AudioPlayerProvider>
  );
}
