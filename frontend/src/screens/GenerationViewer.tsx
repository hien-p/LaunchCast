import { useEffect, useState } from "react";
import {
  Search,
  Globe,
  FileText,
  Mic,
  Music,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useSSE } from "../hooks/useSSE";
import { getProgressSSEUrl } from "../lib/api";
import { ProductCard } from "../components/ProductCard";
import type { Product, SSEEvent } from "../lib/types";

interface GenerationViewerProps {
  onComplete: (episodeId: string) => void;
}

const STEPS = [
  { key: "scraping_ph", label: "Scanning Product Hunt", icon: Search },
  { key: "scraping_website", label: "Deep diving websites", icon: Globe },
  { key: "generating_script", label: "Writing the episode", icon: FileText },
  { key: "synthesizing_voice", label: "Recording voices", icon: Mic },
  { key: "stitching_audio", label: "Mixing the episode", icon: Music },
  { key: "complete", label: "Episode ready!", icon: CheckCircle },
];

export function GenerationViewer({ onComplete }: GenerationViewerProps) {
  const { events, lastEvent } = useSSE(getProgressSSEUrl());
  const [products, setProducts] = useState<Partial<Product>[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>("connected");
  const [error, setError] = useState<string | null>(null);
  const [voiceProgress, setVoiceProgress] = useState({ current: 0, total: 0 });
  const [crawlLogs, setCrawlLogs] = useState<{ message: string; status: "loading" | "success" | "error" }[]>([]);

  useEffect(() => {
    if (!lastEvent) return;

    const { type, data } = lastEvent;

    switch (type) {
      case "scraping_ph":
        setCurrentStep("scraping_ph");
        break;

      case "product_found":
        setCurrentStep("scraping_ph");
        if (data.product) {
          setProducts((prev) => [...prev, data.product as Partial<Product>]);
        }
        break;

      case "deep_dive_start":
        setCurrentStep("scraping_website");
        break;

      case "scraping_website":
        setCurrentStep("scraping_website");
        setCurrentUrl(data.url as string);
        setCrawlLogs((prev) => [...prev, { message: data.message as string, status: "loading" }]);
        break;

      case "website_scraped":
        setCrawlLogs((prev) => {
          const updated = [...prev];
          const lastLoading = updated.findLastIndex((l) => l.status === "loading");
          if (lastLoading >= 0) {
            updated[lastLoading] = { message: data.message as string, status: data.has_website_content ? "success" : "error" };
          }
          return updated;
        });
        break;

      case "deep_dive_complete":
        setCurrentUrl(null);
        setCrawlLogs((prev) => [...prev, { message: data.message as string, status: "success" }]);
        break;

      case "generating_script":
        setCurrentStep("generating_script");
        setCurrentUrl(null);
        break;

      case "script_ready":
        break;

      case "synthesizing_voice":
        setCurrentStep("synthesizing_voice");
        setVoiceProgress({
          current: (data.line_index as number) + 1,
          total: data.total_lines as number,
        });
        break;

      case "stitching_audio":
        setCurrentStep("stitching_audio");
        break;

      case "complete":
        setCurrentStep("complete");
        setTimeout(() => {
          onComplete(data.episode_id as string);
        }, 1500);
        break;

      case "error":
        setError(data.message as string);
        break;
    }
  }, [lastEvent, onComplete]);

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="min-h-svh flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-text-primary">
            Building your episode
          </h1>
          <p className="text-text-secondary text-sm">
            Watch as we scrape, analyze, and record
          </p>
        </div>

        {/* Step Progress */}
        <div className="space-y-2">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = step.key === currentStep;
            const isDone = i < currentStepIndex;
            const isPending = i > currentStepIndex;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-action/10 border border-action/30"
                    : isDone
                    ? "bg-surface/50"
                    : "opacity-40"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive
                      ? "bg-action/20 text-action"
                      : isDone
                      ? "bg-success/20 text-success"
                      : "bg-surface text-text-muted"
                  }`}
                >
                  {isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isDone ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isActive
                      ? "text-text-primary"
                      : isDone
                      ? "text-text-secondary"
                      : "text-text-muted"
                  }`}
                >
                  {step.label}
                  {isActive && step.key === "synthesizing_voice" && voiceProgress.total > 0 && (
                    <span className="text-text-muted font-mono ml-2">
                      ({voiceProgress.current}/{voiceProgress.total})
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live URL Display */}
        {currentUrl && (
          <div className="bg-surface rounded-xl p-3 border border-border">
            <div className="text-xs text-text-muted mb-1">Now scraping</div>
            <div className="text-sm text-action font-mono truncate flex items-center gap-2">
              <Globe className="w-3 h-3 shrink-0 animate-pulse" />
              {currentUrl}
            </div>
          </div>
        )}

        {/* Crawl Logs */}
        {crawlLogs.length > 0 && (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="px-3 py-2 border-b border-border flex items-center gap-2">
              <Globe className="w-3 h-3 text-action" />
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Deep Dive Log
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto p-2 space-y-1 font-mono text-xs">
              {crawlLogs.map((log, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 px-2 py-1 rounded ${
                    log.status === "loading" ? "text-action" : log.status === "success" ? "text-success" : "text-text-muted"
                  }`}
                >
                  {log.status === "loading" ? (
                    <Loader2 className="w-3 h-3 mt-0.5 shrink-0 animate-spin" />
                  ) : (
                    <span className="shrink-0 mt-0.5">{log.status === "success" ? "✓" : "✗"}</span>
                  )}
                  <span className="break-all">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Cards Grid */}
        {products.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Products found ({products.length})
            </div>
            <div className="grid grid-cols-1 gap-2">
              {products.map((product, i) => (
                <div
                  key={i}
                  className="bg-surface rounded-lg p-3 border border-border animate-in fade-in slide-in-from-bottom-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-text-primary">
                        {product.name}
                      </span>
                      <p className="text-xs text-text-muted truncate">
                        {product.tagline}
                      </p>
                    </div>
                    {(product.upvotes ?? 0) > 0 && (
                      <span className="text-xs font-mono text-text-muted">
                        ▲ {product.upvotes}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-error/10 border border-error/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-error">
                Something went wrong
              </div>
              <p className="text-xs text-text-secondary mt-1">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
