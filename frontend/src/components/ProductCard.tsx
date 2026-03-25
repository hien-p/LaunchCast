import { ArrowUpRight, ChevronUp } from "lucide-react";
import type { Product } from "../lib/types";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  compact?: boolean;
}

export function ProductCard({ product, onClick, compact }: ProductCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-surface rounded-xl border border-border p-4 hover:border-text-muted transition-colors cursor-pointer ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-text-primary font-semibold text-base truncate">
            {product.name}
          </h3>
          <p className="text-text-secondary text-sm mt-1 line-clamp-2">
            {product.tagline}
          </p>
        </div>

        <div className="flex items-center gap-1 text-text-muted shrink-0">
          <ChevronUp className="w-4 h-4" />
          <span className="text-sm font-mono">{product.upvotes}</span>
        </div>
      </div>

      {!compact && (product.aero_rating > 0 || product.nova_rating > 0) && (
        <div className="flex items-center gap-4 mt-3">
          {product.aero_rating > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-aero">AERO</span>
              <span className="text-sm font-mono text-text-primary">
                {product.aero_rating}/10
              </span>
            </div>
          )}
          {product.nova_rating > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-nova">NOVA</span>
              <span className="text-sm font-mono text-text-primary">
                {product.nova_rating}/10
              </span>
            </div>
          )}
          {product.aero_rating > 0 &&
            product.nova_rating > 0 &&
            Math.abs(product.aero_rating - product.nova_rating) >= 3 && (
              <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">
                Hosts disagree!
              </span>
            )}
        </div>
      )}

      {!compact && product.website_url && (() => {
        try {
          const hostname = new URL(product.website_url).hostname;
          return (
            <div className="flex items-center gap-1 mt-2 text-action text-xs">
              <ArrowUpRight className="w-3 h-3" />
              <span className="truncate">{hostname}</span>
            </div>
          );
        } catch {
          return null;
        }
      })()}
    </button>
  );
}
