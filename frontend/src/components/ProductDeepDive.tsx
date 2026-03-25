import { X, ExternalLink, ChevronUp } from "lucide-react";
import type { Product } from "../lib/types";

interface ProductDeepDiveProps {
  product: Product;
  onClose: () => void;
}

export function ProductDeepDive({ product, onClose }: ProductDeepDiveProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface-elevated border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface-elevated border-b border-border p-4 flex items-center justify-between z-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-text-primary truncate">
              {product.name}
            </h2>
            <p className="text-sm text-text-secondary truncate">
              {product.tagline}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Stats Bar */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-text-muted">
              <ChevronUp className="w-4 h-4" />
              <span className="text-sm font-mono">{product.upvotes} upvotes</span>
            </div>
            {product.website_url && (
              <a
                href={product.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-action text-sm hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                Visit website
              </a>
            )}
            {product.ph_url && (
              <a
                href={product.ph_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-aero text-sm hover:underline"
              >
                View on PH
              </a>
            )}
          </div>

          {/* Host Ratings */}
          {(product.aero_rating > 0 || product.nova_rating > 0) && (
            <div className="bg-surface rounded-xl p-4 border border-border">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Host Ratings
              </h3>
              <div className="flex items-center gap-6">
                {product.aero_rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-aero/20 flex items-center justify-center">
                      <span className="text-aero font-bold text-sm">A</span>
                    </div>
                    <div>
                      <div className="text-xs text-text-muted">Aero (Skeptic)</div>
                      <div className="text-lg font-mono font-bold text-aero">
                        {product.aero_rating}/10
                      </div>
                    </div>
                  </div>
                )}
                {product.nova_rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-nova/20 flex items-center justify-center">
                      <span className="text-nova font-bold text-sm">N</span>
                    </div>
                    <div>
                      <div className="text-xs text-text-muted">Nova (Optimist)</div>
                      <div className="text-lg font-mono font-bold text-nova">
                        {product.nova_rating}/10
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PH vs Website Comparison */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              What Product Hunt says
            </h3>
            <div className="bg-surface rounded-lg p-3 border border-border">
              <p className="text-sm text-text-secondary">
                {product.ph_description || "No description available."}
              </p>
            </div>

            {product.website_content && (
              <>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  What Firecrawl found on their website
                </h3>
                <div className="bg-surface rounded-lg p-3 border border-border">
                  <p className="text-sm text-text-secondary whitespace-pre-line line-clamp-[20]">
                    {product.website_content.slice(0, 1000)}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Features */}
          {product.features.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Key Features
              </h3>
              <ul className="space-y-1.5">
                {product.features.map((feature, i) => (
                  <li
                    key={i}
                    className="text-sm text-text-secondary flex items-start gap-2"
                  >
                    <span className="text-action mt-1">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pricing */}
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Pricing
            </h3>
            <div className="bg-surface rounded-lg p-3 border border-border">
              {product.pricing?.free_tier ? (
                <span className="inline-flex items-center gap-1 text-success text-sm font-medium">
                  <span className="w-2 h-2 bg-success rounded-full" />
                  Free tier available
                </span>
              ) : (
                <span className="text-sm text-text-muted">
                  No free tier detected
                </span>
              )}
            </div>
          </div>

          {/* Target Audience */}
          {product.target_audience && (
            <div>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Target Audience
              </h3>
              <p className="text-sm text-text-secondary capitalize">
                {product.target_audience}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
