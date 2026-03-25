import { useRef, useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import type { Episode, Product } from "../lib/types";
import { getAudioUrl } from "../lib/api";

interface AudioPlayerProps {
  episode: Episode;
  onProductClick?: (product: Product) => void;
}

export function AudioPlayer({ episode, onProductClick }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Find current product segment
      const product = episode.products.find(
        (p) =>
          audio.currentTime >= p.segment_start_seconds &&
          audio.currentTime < p.segment_end_seconds
      );
      setCurrentProduct(product || null);
    };

    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, [episode]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
  };

  const seekToProduct = (product: Product) => {
    seekTo(product.segment_start_seconds);
    if (!isPlaying) {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-6">
      <audio ref={audioRef} src={getAudioUrl(episode.date)} preload="metadata" />

      {/* Player Controls */}
      <div className="bg-surface-elevated rounded-2xl p-6 border border-border">
        <h2 className="text-lg font-semibold text-text-primary mb-1">
          {episode.title}
        </h2>
        <p className="text-sm text-text-muted mb-4">
          {new Date(episode.date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>

        {/* Progress Bar */}
        <div
          className="w-full h-2 bg-border rounded-full cursor-pointer mb-3 group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            seekTo(pct * duration);
          }}
        >
          <div
            className="h-full bg-action rounded-full transition-all relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-text-muted font-mono mb-4">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => skip(-15)}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 bg-action rounded-full flex items-center justify-center hover:bg-action/80 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </button>

          <button
            onClick={() => skip(30)}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {currentProduct && (
          <div className="mt-4 text-center">
            <span className="text-xs text-text-muted">Now discussing</span>
            <p className="text-sm text-text-primary font-medium">
              {currentProduct.name}
            </p>
          </div>
        )}
      </div>

      {/* Show Notes */}
      <div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Show Notes
        </h3>
        <div className="space-y-2">
          {episode.products.map((product) => (
            <button
              key={product.name}
              onClick={() => {
                seekToProduct(product);
                onProductClick?.(product);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                currentProduct?.name === product.name
                  ? "bg-action/10 border border-action/30"
                  : "bg-surface hover:bg-surface-elevated border border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <span className="text-text-primary font-medium text-sm">
                    {product.name}
                  </span>
                  <span className="text-text-muted text-xs ml-2">
                    {product.tagline}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  {product.aero_rating > 0 && (
                    <span className="text-xs font-mono text-aero">
                      {product.aero_rating}
                    </span>
                  )}
                  {product.nova_rating > 0 && (
                    <span className="text-xs font-mono text-nova">
                      {product.nova_rating}
                    </span>
                  )}
                  <span className="text-xs text-text-muted font-mono">
                    {formatTime(product.segment_start_seconds)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
