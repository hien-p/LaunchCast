import { X, ExternalLink, ChevronUp } from "lucide-react";
import Markdown from "react-markdown";
import type { Product } from "../lib/types";

interface ProductDeepDiveProps {
  product: Product;
  onClose: () => void;
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose-dd">
      <Markdown
        components={{
          h1: ({ children }) => <h1 className="text-base font-bold text-text-primary mt-4 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-bold text-text-primary mt-4 mb-1.5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold text-text-primary mt-3 mb-1">{children}</h3>,
          p: ({ children }) => <p className="text-sm text-text-secondary leading-relaxed mb-2">{children}</p>,
          ul: ({ children }) => <ul className="space-y-1 my-2 ml-1">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-1 my-2 ml-1 list-decimal list-inside">{children}</ol>,
          li: ({ children }) => (
            <li className="text-sm text-text-secondary flex items-start gap-2">
              <span className="text-action mt-1.5 shrink-0 w-1 h-1 rounded-full bg-current" />
              <span>{children}</span>
            </li>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer"
              className="text-action hover:underline">
              {children}
            </a>
          ),
          strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
          em: ({ children }) => <em className="italic text-text-secondary">{children}</em>,
          code: ({ children }) => (
            <code className="text-xs bg-surface px-1.5 py-0.5 rounded font-mono text-text-secondary border border-border">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-surface rounded-lg p-3 border border-border overflow-x-auto my-2 text-xs">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-action/40 pl-3 my-2 text-text-muted italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-border my-4" />,
          img: ({ src, alt }) => (
            <img src={src} alt={alt || ""}
              className="rounded-lg max-w-full h-auto my-3 border border-border"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}

export function ProductDeepDive({ product, onClose }: ProductDeepDiveProps) {
  const hasImage = product.image_url && product.image_url.startsWith("http");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface-elevated border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-xl max-h-[85vh] overflow-y-auto">
        {/* Hero image */}
        {hasImage && (
          <div className="w-full h-44 overflow-hidden rounded-t-2xl sm:rounded-t-2xl">
            <img src={product.image_url} alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
        )}

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
          <button onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Stats Bar */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1 text-text-muted">
              <ChevronUp className="w-4 h-4" />
              <span className="text-sm font-mono">{product.upvotes} upvotes</span>
            </div>
            {product.website_url && (
              <a href={product.website_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-action text-sm hover:underline">
                <ExternalLink className="w-3 h-3" />
                Visit website
              </a>
            )}
            {product.ph_url && (
              <a href={product.ph_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-aero text-sm hover:underline">
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
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-aero/15 flex items-center justify-center">
                      <span className="text-aero font-bold">A</span>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted">Aero (Skeptic)</div>
                      <div className="text-xl font-mono font-bold text-aero">
                        {product.aero_rating}<span className="text-sm text-text-muted">/10</span>
                      </div>
                    </div>
                  </div>
                )}
                {product.nova_rating > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-nova/15 flex items-center justify-center">
                      <span className="text-nova font-bold">N</span>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted">Nova (Optimist)</div>
                      <div className="text-xl font-mono font-bold text-nova">
                        {product.nova_rating}<span className="text-sm text-text-muted">/10</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PH Description */}
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              What Product Hunt says
            </h3>
            <div className="bg-surface rounded-xl p-4 border border-border">
              <MarkdownContent content={product.ph_description || "No description available."} />
            </div>
          </div>

          {/* Firecrawl Website Content */}
          {product.website_content && (
            <div>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                What Firecrawl found on their website
              </h3>
              <div className="bg-surface rounded-xl p-4 border border-border max-h-[400px] overflow-y-auto">
                <MarkdownContent content={product.website_content.slice(0, 2000)} />
              </div>
            </div>
          )}

          {/* Features */}
          {product.features.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Key Features
              </h3>
              <div className="bg-surface rounded-xl p-4 border border-border">
                <ul className="space-y-2">
                  {product.features.map((feature, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-action/10 text-action text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Pricing */}
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Pricing
            </h3>
            <div className="bg-surface rounded-xl p-4 border border-border">
              {product.pricing?.free_tier ? (
                <span className="inline-flex items-center gap-2 text-success text-sm font-medium">
                  <span className="w-5 h-5 rounded-md bg-success/15 flex items-center justify-center">
                    <span className="w-2 h-2 bg-success rounded-full" />
                  </span>
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
              <div className="bg-surface rounded-xl p-4 border border-border">
                <p className="text-sm text-text-secondary capitalize">
                  {product.target_audience}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
