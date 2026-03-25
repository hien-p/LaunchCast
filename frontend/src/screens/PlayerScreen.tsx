import { useEffect, useState } from "react";
import { Headphones, ArrowLeft, Clock } from "lucide-react";
import { fetchEpisode, fetchEpisodes } from "../lib/api";
import { AudioPlayer } from "../components/AudioPlayer";
import { ProductDeepDive } from "../components/ProductDeepDive";
import type { Episode, EpisodeSummary, Product } from "../lib/types";

interface PlayerScreenProps {
  episodeId?: string;
  onBack: () => void;
}

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

        // If no specific episode requested, load the latest
        if (!episodeId && all.length > 0) {
          const ep = await fetchEpisode(all[0].id);
          setEpisode(ep);
        }
      } catch (err) {
        setError("No episodes found yet. Generate one first!");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [episodeId]);

  const loadEpisode = async (id: string) => {
    setLoading(true);
    try {
      const ep = await fetchEpisode(id);
      setEpisode(ep);
    } catch {
      setError("Failed to load episode");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <div className="text-text-muted">Loading episode...</div>
      </div>
    );
  }

  return (
    <div className="min-h-svh">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-text-muted hover:text-text-primary transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Settings
          </button>
          <div className="flex items-center gap-2 text-text-secondary">
            <Headphones className="w-4 h-4" />
            <span className="text-sm font-medium">LaunchCast</span>
          </div>
        </div>

        {/* Current Episode Player */}
        {episode ? (
          <AudioPlayer
            episode={episode}
            onProductClick={(product) => setSelectedProduct(product)}
          />
        ) : (
          <div className="bg-surface rounded-2xl p-8 border border-border text-center">
            <p className="text-text-muted">
              {error || "No episodes yet. Generate your first episode!"}
            </p>
          </div>
        )}

        {/* Past Episodes */}
        {pastEpisodes.length > 1 && (
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Past Episodes
            </h3>
            <div className="space-y-2">
              {pastEpisodes
                .filter((ep) => ep.id !== episode?.id)
                .map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => loadEpisode(ep.id)}
                    className="w-full text-left bg-surface rounded-lg p-3 border border-border hover:border-text-muted transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-text-primary">
                          {ep.title || ep.date}
                        </div>
                        <div className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {Math.round(ep.duration_seconds / 60)} min
                          <span className="mx-1">·</span>
                          {ep.product_count} products
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Deep Dive Modal */}
      {selectedProduct && (
        <ProductDeepDive
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
