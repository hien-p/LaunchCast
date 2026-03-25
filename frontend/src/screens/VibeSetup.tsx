import { useState } from "react";
import { Headphones, Zap, BookOpen, Link } from "lucide-react";
import type { UserPreferences } from "../lib/types";

const INTEREST_TAGS = [
  "Open Source",
  "LLMs & AI",
  "Frontend Tools",
  "Indie SaaS",
  "Backends & Infra",
  "UI/UX Design",
];

interface VibeSetupProps {
  preferences: UserPreferences;
  onToggleInterest: (interest: string) => void;
  onSetPreferences: (update: Partial<UserPreferences>) => void;
  onStart: (phUrl?: string) => void;
}

export function VibeSetup({
  preferences,
  onToggleInterest,
  onSetPreferences,
  onStart,
}: VibeSetupProps) {
  const [phUrl, setPhUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  const hasInterests = preferences.interests.length > 0;
  const hasUrl = phUrl.trim().length > 0;
  const canStart = hasInterests;

  const PH_URL_PATTERN = /^https?:\/\/(www\.)?producthunt\.com\/posts\/[\w-]+$/;

  const handleStart = () => {
    const trimmedUrl = phUrl.trim();

    if (trimmedUrl) {
      if (!PH_URL_PATTERN.test(trimmedUrl)) {
        setUrlError("Paste a valid Product Hunt link, like producthunt.com/posts/product-name");
        return;
      }
      setUrlError(null);
      onStart(trimmedUrl);
    } else {
      onStart();
    }
  };

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-surface px-3 py-1.5 rounded-full border border-border text-sm text-text-secondary">
            <Headphones className="w-4 h-4" />
            LaunchCast
          </div>
          <h1 className="text-3xl font-bold text-text-primary">
            Set your vibe
          </h1>
          <p className="text-text-secondary">
            Pick what you care about. We'll tailor today's episode.
          </p>
        </div>

        {/* Product Hunt URL Input */}
        <div>
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-3">
            Got a specific launch?
          </label>
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="url"
              value={phUrl}
              onChange={(e) => {
                setPhUrl(e.target.value);
                setUrlError(null);
              }}
              placeholder="Paste a Product Hunt link (optional)"
              className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-action transition-colors"
            />
          </div>
          {urlError && (
            <p className="text-xs text-error mt-1.5">{urlError}</p>
          )}
          {hasUrl && !urlError && (
            <p className="text-xs text-text-muted mt-1.5">
              We'll deep-dive this one product instead of today's top launches
            </p>
          )}
        </div>

        {/* Divider */}
        {!hasUrl && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">or browse today's top launches</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        )}

        {/* Interest Tags */}
        <div>
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-3">
            Your Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_TAGS.map((tag) => {
              const selected = preferences.interests.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => onToggleInterest(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selected
                      ? "bg-action text-white"
                      : "bg-surface border border-border text-text-secondary hover:border-text-muted"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <label className="flex items-center justify-between bg-surface rounded-xl p-4 border border-border cursor-pointer">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-warning" />
              <div>
                <div className="text-sm font-medium text-text-primary">
                  Deep Dives Only
                </div>
                <div className="text-xs text-text-muted">
                  Longer episodes, more detail
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.deep_dives_only}
              onChange={(e) =>
                onSetPreferences({ deep_dives_only: e.target.checked })
              }
              className="w-5 h-5 accent-action"
            />
          </label>

          <label className="flex items-center justify-between bg-surface rounded-xl p-4 border border-border cursor-pointer">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-action" />
              <div>
                <div className="text-sm font-medium text-text-primary">
                  Technical Detail
                </div>
                <div className="text-xs text-text-muted">
                  Include code snippets and stack info
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.technical_detail}
              onChange={(e) =>
                onSetPreferences({ technical_detail: e.target.checked })
              }
              className="w-5 h-5 accent-action"
            />
          </label>
        </div>

        {/* Meet the Hosts */}
        <div>
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-3">
            Your Hosts
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-xl p-4 border border-border">
              <div className="w-10 h-10 rounded-lg bg-aero/20 flex items-center justify-center mb-3">
                <span className="text-aero font-bold text-lg">A</span>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Aero</h3>
              <p className="text-xs text-aero font-medium">The Skeptic</p>
              <p className="text-xs text-text-muted mt-1">
                Tears down hype. Finds real engineering value.
              </p>
            </div>
            <div className="bg-surface rounded-xl p-4 border border-border">
              <div className="w-10 h-10 rounded-lg bg-nova/20 flex items-center justify-center mb-3">
                <span className="text-nova font-bold text-lg">N</span>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Nova</h3>
              <p className="text-xs text-nova font-medium">The Optimist</p>
              <p className="text-xs text-text-muted mt-1">
                Sees how tech empowers creators and reshapes markets.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          disabled={!canStart}
          className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${
            canStart
              ? "bg-action text-white hover:bg-action/80 active:scale-[0.98]"
              : "bg-surface text-text-muted border border-border cursor-not-allowed"
          }`}
        >
          {!canStart
            ? "Pick at least one interest to continue"
            : hasUrl
            ? "Deep Dive This Launch"
            : "Start Listening to Today's Hunt"}
        </button>
      </div>
    </div>
  );
}
