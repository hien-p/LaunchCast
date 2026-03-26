import { useEffect, useState, useRef, useMemo, createContext, useContext } from "react";
import {
  Headphones,
  Play,
  Pause,
  ListMusic,
  SkipBack,
  SkipForward,
  Podcast,
  Sun,
  Moon,
  Download,
  FileText,
  AudioLines,
  ChevronRight,
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

/* ── Theme System ── */
const themes = {
  dark: {
    bg: "#0a0a0b",
    surface: "#0e0e11",
    surfaceHover: "#131316",
    elevated: "#161619",
    border: "#1e1e24",
    borderLight: "#2a2a30",
    text: "#e8e8ec",
    textSecondary: "#999",
    textMuted: "#888",
    textDim: "#777",
    textPast: "#aaa",
    headerBg: "rgba(10,10,11,0.95)",
    sidebarBg: "#0e0e11",
    activeLineBg: "rgba(19, 19, 26, 0.7)",
    hoverLineBg: "#0f0f14",
    introCardFrom: "#12121a",
    introCardTo: "#0e0e14",
    playerBg: "rgba(22,22,25,0.95)",
    playerBorder: "#2a2a30",
    playBtn: "#fff",
    playBtnText: "#111",
    playBtnHover: "#eee",
    controlText: "#777",
    controlHover: "#fff",
    controlBg: "#222",
    speedBg: "#1e1e22",
    speedBorder: "#2a2a30",
    speedText: "#777",
    scrubTrack: "#2a2a30",
    badgeBg: "#1a1a1e",
    karaokeBg: "#22543d",
    karaokeText: "#4ade80",
    liveColor: "#4ade80",
    shadow: "rgba(0,0,0,0.50)",
  },
  light: {
    bg: "#fafafa",
    surface: "#ffffff",
    surfaceHover: "#f5f5f5",
    elevated: "#ffffff",
    border: "#e5e5e5",
    borderLight: "#eee",
    text: "#1a1a1a",
    textSecondary: "#666",
    textMuted: "#999",
    textDim: "#bbb",
    textPast: "#555",
    headerBg: "rgba(250,250,250,0.95)",
    sidebarBg: "#ffffff",
    activeLineBg: "rgba(240, 240, 255, 0.7)",
    hoverLineBg: "#f8f8fc",
    introCardFrom: "#f5f3ff",
    introCardTo: "#fef3e2",
    playerBg: "rgba(255,255,255,0.95)",
    playerBorder: "#e0e0e0",
    playBtn: "#111",
    playBtnText: "#fff",
    playBtnHover: "#333",
    controlText: "#999",
    controlHover: "#333",
    controlBg: "#f0f0f0",
    speedBg: "#f5f5f5",
    speedBorder: "#e0e0e0",
    speedText: "#666",
    scrubTrack: "#ddd",
    badgeBg: "#f0f0f5",
    karaokeBg: "#dcfce7",
    karaokeText: "#15803d",
    liveColor: "#16a34a",
    shadow: "rgba(0,0,0,0.08)",
  },
} as const;

type Theme = { [K in keyof typeof themes.dark]: string };
const ThemeContext = createContext<{ t: Theme; isDark: boolean }>({ t: themes.dark, isDark: true });
function useTheme() { return useContext(ThemeContext); }

/* ── Helpers ── */
interface PlayerScreenProps {
  episodeId?: string;
  onBack: () => void;
}

function isInputFocused(): boolean {
  const tag = document.activeElement?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/* ── Sidebar: Product List ── */
function Sidebar({
  products,
  currentProduct,
  onProductClick,
  onClose,
}: {
  products: Product[];
  currentProduct: Product | null;
  onProductClick: (product: Product) => void;
  onClose: () => void;
}) {
  const { t } = useTheme();
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />
      <aside
        className="fixed lg:relative left-0 top-0 bottom-0 w-72 flex flex-col z-30 shadow-2xl lg:shadow-none"
        style={{ backgroundColor: t.sidebarBg, borderRight: `1px solid ${t.border}` }}
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${t.border}` }}>
          <div className="flex items-center gap-2">
            <Podcast className="w-4 h-4 text-[#7c6cf6]" />
            <h2 className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: t.textSecondary }}>
              Show Notes
            </h2>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ color: t.textMuted, backgroundColor: t.badgeBg }}>
            {products.length} products
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {products.map((product, idx) => {
            const isActive = currentProduct?.name === product.name;
            return (
              <button
                key={product.name}
                onClick={() => onProductClick(product)}
                className="w-full text-left px-5 py-3 flex items-start gap-3 transition-all duration-150 border-l-[3px]"
                style={{
                  borderColor: isActive ? "#7c6cf6" : "transparent",
                  backgroundColor: isActive ? t.activeLineBg : undefined,
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = t.surfaceHover; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = ""; }}
              >
                <span className="text-[11px] font-mono mt-0.5 shrink-0 w-5 text-center rounded"
                  style={{ color: isActive ? "#7c6cf6" : t.textMuted }}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium leading-snug" style={{ color: isActive ? t.text : t.textSecondary }}>
                    {product.name}
                  </p>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: t.textMuted }}>{product.tagline}</p>
                  {(product.aero_rating > 0 || product.nova_rating > 0) && (
                    <div className="flex items-center gap-2 mt-1.5">
                      {product.aero_rating > 0 && (
                        <span className="text-[10px] font-bold text-[#f97316] bg-[#f97316]/10 px-1.5 py-0.5 rounded">
                          AE {product.aero_rating}
                        </span>
                      )}
                      {product.nova_rating > 0 && (
                        <span className="text-[10px] font-bold text-[#8b5cf6] bg-[#8b5cf6]/10 px-1.5 py-0.5 rounded">
                          NO {product.nova_rating}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}

/* ── Bold product names in text ── */
function highlightProducts(text: string, productNames: string[]): { text: string; isBold: boolean }[] {
  if (productNames.length === 0) return [{ text, isBold: false }];

  const escaped = productNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);

  return parts.filter(Boolean).map((part) => ({
    text: part,
    isBold: productNames.some((n) => n.toLowerCase() === part.toLowerCase()),
  }));
}

/* ── Transcript Block ── */
function TranscriptBlock({
  line, isActive, wordProgress, isPast, lineRef, onClick, productNames,
}: {
  line: ScriptLine; isActive: boolean; wordProgress: number;
  isPast: boolean; lineRef?: React.Ref<HTMLDivElement>; onClick?: () => void;
  productNames: string[];
}) {
  const { t } = useTheme();
  const isAero = line.speaker === "AERO";
  const speakerColor = isAero ? "#f97316" : "#8b5cf6";
  const speakerBg = isAero ? "rgba(249,115,22,0.1)" : "rgba(139,92,246,0.1)";
  const speakerName = isAero ? "Aero" : "Nova";
  const words = line.text.split(" ");
  const activeWordIndex = isActive ? Math.floor(wordProgress * words.length) : -1;

  const productNamesLower = useMemo(
    () => new Set(productNames.map((n) => n.toLowerCase())),
    [productNames]
  );

  const isProductWord = (word: string, nextWords: string[]) => {
    const clean = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    if (productNamesLower.has(clean)) return true;
    for (let len = 1; len <= Math.min(3, nextWords.length); len++) {
      const phrase = [word, ...nextWords.slice(0, len)].join(" ").replace(/[^a-zA-Z0-9\s]/g, "").toLowerCase();
      if (productNamesLower.has(phrase)) return true;
    }
    return false;
  };

  return (
    <div
      ref={lineRef}
      className={`group cursor-pointer transition-all duration-200 py-4 px-5 -mx-5 rounded-xl relative ${isActive ? "backdrop-blur-md" : ""}`}
      style={{ backgroundColor: isActive ? t.activeLineBg : undefined }}
      onClick={onClick}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = t.hoverLineBg; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = ""; }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[12px] font-bold tracking-wide px-2 py-0.5 rounded-md"
          style={{ color: speakerColor, backgroundColor: speakerBg }}>
          {speakerName}
        </span>
        {isActive && (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: t.liveColor }} />
            <span className="text-[10px] font-medium" style={{ color: t.liveColor }}>LIVE</span>
          </span>
        )}
      </div>
      <p className="text-[15px] leading-[1.9] tracking-[0.01em]">
        {isActive
          ? words.map((word, wi) => {
              const isSpoken = wi < activeWordIndex;
              const isCurrent = wi === activeWordIndex;
              const isBold = isProductWord(word, words.slice(wi + 1));
              return (
                <span key={wi} style={{
                  ...(isCurrent
                    ? { backgroundColor: t.karaokeBg, color: t.karaokeText, borderRadius: 4, padding: "1px 3px", margin: "0 -1px" }
                    : { color: isSpoken ? t.text : t.textDim }),
                  fontWeight: isBold ? 700 : isCurrent ? 500 : undefined,
                }}>
                  {word}{" "}
                </span>
              );
            })
          : (() => {
              const parts = highlightProducts(line.text, productNames);
              const baseColor = isPast ? t.textPast : t.textDim;
              return parts.map((part, pi) => (
                <span key={pi} style={{
                  color: part.isBold ? (isPast ? t.text : t.textSecondary) : baseColor,
                  fontWeight: part.isBold ? 700 : undefined,
                }}>
                  {part.text}
                </span>
              ));
            })()
        }
      </p>
    </div>
  );
}

/* ── Product Thumbnail Card (inline between transcript blocks) ── */
function ProductThumbnail({ product, onClick }: { product: Product; onClick: () => void }) {
  const { t, isDark } = useTheme();
  const hasImage = product.image_url && product.image_url.startsWith("http");

  return (
    <button
      onClick={onClick}
      className="w-full my-6 rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] text-left"
      style={{
        border: `1px solid ${t.border}`,
        backgroundColor: t.elevated,
        boxShadow: `0 2px 12px ${t.shadow}`,
      }}
    >
      {hasImage && (
        <div className="w-full h-44 overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold truncate" style={{ color: t.text }}>
              {product.name}
            </p>
            <p className="text-[12px] mt-0.5 truncate" style={{ color: t.textMuted }}>
              {product.tagline}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {product.aero_rating > 0 && (
              <span className="text-[10px] font-bold text-[#f97316] bg-[#f97316]/10 px-1.5 py-0.5 rounded">
                {product.aero_rating}
              </span>
            )}
            {product.nova_rating > 0 && (
              <span className="text-[10px] font-bold text-[#8b5cf6] bg-[#8b5cf6]/10 px-1.5 py-0.5 rounded">
                {product.nova_rating}
              </span>
            )}
          </div>
        </div>
        {!hasImage && (
          <div className="mt-2 h-24 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${isDark ? "#1a1a2e" : "#f0eeff"}, ${isDark ? "#16213e" : "#fef3e2"})` }}>
            <Headphones className="w-8 h-8" style={{ color: t.textDim }} />
          </div>
        )}
      </div>
    </button>
  );
}

/* ── Export Panel ── */
/* ── Audiogram Generator (Canvas + MediaRecorder) ── */
const AUDIOGRAM_THEMES = {
  indigo: { bg: "#1e1b4b", accent: "#818cf8", text: "#e8e8ec", sub: "#94a3b8" },
  sunset: { bg: "#1c1917", accent: "#f97316", text: "#fef3c7", sub: "#a8a29e" },
  emerald: { bg: "#022c22", accent: "#34d399", text: "#ecfdf5", sub: "#6ee7b7" },
  rose: { bg: "#1c1017", accent: "#f43f5e", text: "#ffe4e6", sub: "#fda4af" },
  slate: { bg: "#0f172a", accent: "#e2e8f0", text: "#f8fafc", sub: "#94a3b8" },
} as const;

const AUDIOGRAM_SIZES = {
  landscape: { w: 1280, h: 720, label: "Landscape" },
  square: { w: 1080, h: 1080, label: "Square" },
  portrait: { w: 1080, h: 1920, label: "Portrait" },
} as const;

type AudiogramTheme = keyof typeof AUDIOGRAM_THEMES;
type AudiogramSize = keyof typeof AUDIOGRAM_SIZES;

async function generateAudiogram(
  episode: Episode,
  opts: {
    size: AudiogramSize;
    theme: AudiogramTheme;
    showSpeaker: boolean;
    showTitle: boolean;
    maxDuration: number;
  },
  onProgress: (pct: number) => void
): Promise<Blob> {
  const { w, h } = AUDIOGRAM_SIZES[opts.size];
  const colors = AUDIOGRAM_THEMES[opts.theme];
  const lines = (episode.script || []).filter((l) => l.text.trim());
  const totalChars = lines.reduce((s, l) => s + l.text.length, 0);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const audioEl = new Audio(getAudioUrl(episode.date));
  audioEl.crossOrigin = "anonymous";
  await new Promise<void>((res, rej) => {
    audioEl.oncanplaythrough = () => res();
    audioEl.onerror = () => rej(new Error("Audio load failed"));
    audioEl.load();
  });

  const duration = Math.min(audioEl.duration, opts.maxDuration);
  const fps = 30;
  const totalFrames = Math.ceil(duration * fps);

  const stream = canvas.captureStream(fps);
  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaElementSource(audioEl);
  const dest = audioCtx.createMediaStreamDestination();
  source.connect(dest);
  source.connect(audioCtx.destination);

  for (const track of dest.stream.getAudioTracks()) {
    stream.addTrack(track);
  }

  const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9,opus" });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const done = new Promise<Blob>((res) => {
    recorder.onstop = () => res(new Blob(chunks, { type: "video/webm" }));
  });

  recorder.start();
  audioEl.currentTime = 0;
  await audioEl.play();

  const titleSize = Math.round(h * 0.035);
  const speakerSize = Math.round(h * 0.025);
  const textSize = Math.round(h * 0.04);
  const padding = Math.round(w * 0.06);

  for (let frame = 0; frame < totalFrames; frame++) {
    const time = frame / fps;
    if (time > duration) break;

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    let y = padding;

    if (opts.showTitle) {
      ctx.font = `bold ${titleSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = colors.text;
      ctx.fillText(episode.title, padding, y + titleSize);
      y += titleSize + Math.round(h * 0.02);

      ctx.font = `${speakerSize}px system-ui, sans-serif`;
      ctx.fillStyle = colors.sub;
      ctx.fillText("LaunchCast Daily", padding, y + speakerSize);
      y += speakerSize + Math.round(h * 0.04);
    } else {
      y += Math.round(h * 0.05);
    }

    // waveform bar
    const barY = y;
    const barH = Math.round(h * 0.06);
    const barCount = 60;
    const barW = Math.round((w - padding * 2) / barCount * 0.7);
    const barGap = (w - padding * 2) / barCount;
    const progress = time / duration;
    for (let b = 0; b < barCount; b++) {
      const amp = 0.3 + 0.7 * Math.abs(Math.sin(b * 0.5 + time * 4));
      const bH = barH * amp;
      const bx = padding + b * barGap;
      ctx.fillStyle = (b / barCount) < progress ? colors.accent : colors.sub + "40";
      ctx.fillRect(bx, barY + (barH - bH) / 2, barW, bH);
    }
    y += barH + Math.round(h * 0.04);

    // active transcript line
    let cumTime = 0;
    let activeLine = lines[0];
    let wordProg = 0;
    for (const line of lines) {
      const lineDur = (line.text.length / totalChars) * audioEl.duration;
      if (time < cumTime + lineDur) {
        activeLine = line;
        wordProg = (time - cumTime) / lineDur;
        break;
      }
      cumTime += lineDur;
    }

    if (opts.showSpeaker && activeLine) {
      const isAero = activeLine.speaker === "AERO";
      ctx.font = `bold ${speakerSize}px system-ui, sans-serif`;
      ctx.fillStyle = isAero ? "#f97316" : "#8b5cf6";
      ctx.fillText(isAero ? "Aero" : "Nova", padding, y + speakerSize);
      y += speakerSize + Math.round(h * 0.015);
    }

    if (activeLine) {
      const words = activeLine.text.split(" ");
      const activeIdx = Math.floor(wordProg * words.length);
      const maxWidth = w - padding * 2;
      ctx.font = `${textSize}px system-ui, -apple-system, sans-serif`;

      let lineX = padding;
      let lineY = y + textSize;

      for (let wi = 0; wi < words.length; wi++) {
        const word = words[wi] + " ";
        const ww = ctx.measureText(word).width;
        if (lineX + ww > padding + maxWidth) {
          lineX = padding;
          lineY += textSize * 1.6;
        }
        if (wi === activeIdx) {
          ctx.fillStyle = colors.accent;
          ctx.fillRect(lineX - 2, lineY - textSize + 4, ww, textSize + 4);
          ctx.fillStyle = colors.bg;
        } else if (wi < activeIdx) {
          ctx.fillStyle = colors.text;
        } else {
          ctx.fillStyle = colors.sub + "80";
        }
        ctx.fillText(word, lineX, lineY);
        lineX += ww;
      }
    }

    // time display
    ctx.font = `${speakerSize}px monospace`;
    ctx.fillStyle = colors.sub;
    const mm = String(Math.floor(time / 60)).padStart(2, "0");
    const ss = String(Math.floor(time % 60)).padStart(2, "0");
    ctx.fillText(`${mm}:${ss}`, padding, h - padding);

    onProgress(Math.round((frame / totalFrames) * 100));
    await new Promise((r) => requestAnimationFrame(r));
  }

  audioEl.pause();
  recorder.stop();
  audioCtx.close();
  return done;
}

/* ── Audiogram Settings Panel ── */
function AudiogramPanel({ episode, onBack }: { episode: Episode; onBack: () => void }) {
  const { t } = useTheme();
  const [size, setSize] = useState<AudiogramSize>("landscape");
  const [theme, setTheme] = useState<AudiogramTheme>("indigo");
  const [showSpeaker, setShowSpeaker] = useState(true);
  const [showTitle, setShowTitle] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const duration = episode.duration_seconds || 0;
  const maxClipDuration = Math.min(duration, 60);

  const handleCreate = async () => {
    setGenerating(true);
    setProgress(0);
    try {
      const blob = await generateAudiogram(episode, {
        size, theme, showSpeaker, showTitle,
        maxDuration: maxClipDuration,
      }, setProgress);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `launchcast-${episode.date}-audiogram.webm`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Audiogram generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button onClick={onToggle}
      className="w-11 h-6 rounded-full p-0.5 transition-colors"
      style={{ backgroundColor: on ? "#7c6cf6" : t.borderLight }}>
      <div className="w-5 h-5 rounded-full bg-white shadow transition-transform"
        style={{ transform: on ? "translateX(20px)" : "translateX(0)" }} />
    </button>
  );

  return (
    <div>
      <button onClick={onBack} className="text-[12px] mb-4 flex items-center gap-1 transition-colors"
        style={{ color: t.textMuted }}>
        &larr; Back to Export
      </button>
      <h2 className="text-lg font-bold mb-1" style={{ color: t.text }}>Audiogram</h2>
      <p className="text-[13px] mb-6" style={{ color: t.textMuted }}>
        Download an animated transcript video. Perfect for sharing on social media.
      </p>

      <div className="space-y-4">
        {/* Size */}
        <div className="p-4 rounded-2xl border" style={{ backgroundColor: t.elevated, borderColor: t.border }}>
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-semibold" style={{ color: t.text }}>Size</p>
            <select value={size} onChange={(e) => setSize(e.target.value as AudiogramSize)}
              className="text-[13px] font-medium px-3 py-1.5 rounded-lg border appearance-none cursor-pointer"
              style={{ backgroundColor: t.surfaceHover, borderColor: t.border, color: t.text }}>
              {Object.entries(AUDIOGRAM_SIZES).map(([k, v]) => (
                <option key={k} value={k}>{v.label} ({v.w}x{v.h})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Theme */}
        <div className="p-4 rounded-2xl border" style={{ backgroundColor: t.elevated, borderColor: t.border }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-semibold" style={{ color: t.text }}>Theme</p>
            <select value={theme} onChange={(e) => setTheme(e.target.value as AudiogramTheme)}
              className="text-[13px] font-medium px-3 py-1.5 rounded-lg border appearance-none cursor-pointer capitalize"
              style={{ backgroundColor: t.surfaceHover, borderColor: t.border, color: t.text }}>
              {Object.keys(AUDIOGRAM_THEMES).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          {/* Theme preview */}
          <div className="flex gap-2">
            {Object.entries(AUDIOGRAM_THEMES).map(([k, v]) => (
              <button key={k} onClick={() => setTheme(k as AudiogramTheme)}
                className="w-8 h-8 rounded-lg border-2 transition-all"
                style={{
                  backgroundColor: v.bg,
                  borderColor: theme === k ? v.accent : "transparent",
                  boxShadow: theme === k ? `0 0 0 2px ${v.accent}40` : "none",
                }}>
                <div className="w-full h-full rounded-md flex items-center justify-center">
                  <div className="w-3 h-1 rounded-full" style={{ backgroundColor: v.accent }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="p-4 rounded-2xl border space-y-4" style={{ backgroundColor: t.elevated, borderColor: t.border }}>
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-semibold" style={{ color: t.text }}>Show speaker name</p>
            <Toggle on={showSpeaker} onToggle={() => setShowSpeaker(!showSpeaker)} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-semibold" style={{ color: t.text }}>Show project title</p>
            <Toggle on={showTitle} onToggle={() => setShowTitle(!showTitle)} />
          </div>
        </div>

        {/* Info */}
        <div className="p-4 rounded-2xl border flex gap-8" style={{ backgroundColor: t.elevated, borderColor: t.border }}>
          <div>
            <p className="text-[12px]" style={{ color: t.textMuted }}>Video length</p>
            <p className="text-[14px] font-semibold" style={{ color: t.text }}>
              {maxClipDuration >= 60
                ? `${Math.floor(maxClipDuration / 60)} min ${maxClipDuration % 60}s`
                : `${maxClipDuration} seconds`}
            </p>
          </div>
          <div>
            <p className="text-[12px]" style={{ color: t.textMuted }}>Estimated processing</p>
            <p className="text-[14px] font-semibold" style={{ color: t.text }}>
              {maxClipDuration < 30 ? "less than a minute" : "1-2 minutes"}
            </p>
          </div>
        </div>

        {/* Create button */}
        <button onClick={handleCreate} disabled={generating}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-[14px] text-white transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ backgroundColor: "#7c6cf6" }}>
          {generating ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating... {progress}%
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Create audiogram
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Export Panel ── */
function ExportPanel({ episode }: { episode: Episode }) {
  const { t } = useTheme();
  const [showAudiogramPanel, setShowAudiogramPanel] = useState(false);

  if (showAudiogramPanel) {
    return <AudiogramPanel episode={episode} onBack={() => setShowAudiogramPanel(false)} />;
  }

  const downloadAudio = () => {
    const url = getAudioUrl(episode.date);
    const a = document.createElement("a");
    a.href = url;
    a.download = `launchcast-${episode.date}.mp3`;
    a.click();
  };

  const downloadTranscript = () => {
    const text = (episode.script || [])
      .filter((l) => l.text.trim())
      .map((l) => `[${l.speaker}]\n${l.text}`)
      .join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `launchcast-${episode.date}-transcript.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadShowNotes = () => {
    const lines = [`# ${episode.title}`, `Date: ${episode.date}`, ""];
    for (const p of episode.products) {
      lines.push(`## ${p.name}`);
      lines.push(p.tagline);
      if (p.website_url) lines.push(`Website: ${p.website_url}`);
      if (p.ph_url) lines.push(`Product Hunt: ${p.ph_url}`);
      if (p.aero_rating) lines.push(`Aero: ${p.aero_rating}/10`);
      if (p.nova_rating) lines.push(`Nova: ${p.nova_rating}/10`);
      lines.push("");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `launchcast-${episode.date}-shownotes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const items: { icon: React.ReactNode; iconBg: string; title: string; desc: string; action: () => void; badge?: string; arrow?: boolean }[] = [
    {
      icon: <AudioLines className="w-5 h-5" />,
      iconBg: "#eab308",
      title: "Audio",
      desc: "Download episode as MP3",
      action: downloadAudio,
      badge: "MP3",
    },
    {
      icon: <Play className="w-5 h-5" />,
      iconBg: "#4ade80",
      title: "Audiogram",
      desc: "Animated transcript video",
      action: () => setShowAudiogramPanel(true),
      arrow: true,
    },
    {
      icon: <FileText className="w-5 h-5" />,
      iconBg: "#22d3ee",
      title: "Transcript",
      desc: "Full conversation as text",
      action: downloadTranscript,
      badge: "TXT",
    },
    {
      icon: <Podcast className="w-5 h-5" />,
      iconBg: "#a78bfa",
      title: "Show Notes",
      desc: "Products, ratings, and links",
      action: downloadShowNotes,
      badge: "MD",
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold mb-6" style={{ color: t.text }}>Export</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <button
            key={item.title}
            onClick={item.action}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
            style={{ backgroundColor: t.elevated, borderColor: t.border }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.borderLight; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: item.iconBg + "20", color: item.iconBg }}>
              {item.icon}
            </div>
            <div className="flex-1 text-left">
              <p className="text-[14px] font-semibold" style={{ color: t.text }}>{item.title}</p>
              <p className="text-[12px]" style={{ color: t.textMuted }}>{item.desc}</p>
            </div>
            {item.badge && (
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded"
                style={{ color: t.textSecondary, backgroundColor: t.surfaceHover }}>
                {item.badge}
              </span>
            )}
            {item.arrow
              ? <ChevronRight className="w-4 h-4 shrink-0" style={{ color: t.textMuted }} />
              : <Download className="w-4 h-4 shrink-0" style={{ color: t.textMuted }} />
            }
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main Episode View ── */
function EpisodeView({
  episode, onProductClick, currentProduct,
}: {
  episode: Episode; onProductClick: (product: Product) => void; currentProduct: Product | null;
}) {
  const { t } = useTheme();
  const player = useAudioPlayer();
  const currentTime = useAudioPlayerTime();
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<"listen" | "transcript" | "share">("listen");

  const filteredLines = useMemo(
    () => (episode.script || []).filter((l) => l.text.trim()),
    [episode.script]
  );

  const productNames = useMemo(
    () => episode.products.map((p) => p.name).filter((n) => n.length > 2),
    [episode.products]
  );

  useEffect(() => {
    player.setActiveItem({ id: episode.id, src: getAudioUrl(episode.date) });
  }, [episode.id]);

  const getLineStartTime = (lineIndex: number) => {
    const totalDuration = player.duration || episode.duration_seconds || 1;
    const totalChars = filteredLines.reduce((sum, l) => sum + l.text.length, 0);
    let cumTime = 0;
    for (let i = 0; i < lineIndex; i++) {
      cumTime += (filteredLines[i].text.length / totalChars) * totalDuration;
    }
    return cumTime;
  };

  const seekToLine = (lineIndex: number) => {
    const time = getLineStartTime(lineIndex);
    setActiveLineIndex(lineIndex);
    const audio = player.ref.current;
    if (!audio) return;
    if (!audio.paused) { audio.currentTime = time; return; }
    audio.currentTime = time;
    const onSeeked = () => { audio.removeEventListener("seeked", onSeeked); audio.play().catch(() => {}); };
    audio.addEventListener("seeked", onSeeked);
  };

  const wordProgress = useRef(0);

  useEffect(() => {
    if (!episode.script || episode.script.length === 0) return;
    const totalDuration = player.duration || episode.duration_seconds || 1;
    const lines = episode.script.filter((l) => l.text.trim());
    const totalChars = lines.reduce((sum, l) => sum + l.text.length, 0);
    let cumTime = 0;
    let foundIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineDuration = (lines[i].text.length / totalChars) * totalDuration;
      if (currentTime < cumTime + lineDuration) {
        foundIndex = i;
        wordProgress.current = Math.min(1, Math.max(0, (currentTime - cumTime) / lineDuration));
        break;
      }
      cumTime += lineDuration;
      foundIndex = i;
    }
    if (foundIndex !== activeLineIndex) setActiveLineIndex(foundIndex);
  }, [currentTime, episode, player.duration, activeLineIndex]);

  useEffect(() => {
    if (activeLineRef.current && player.isPlaying) {
      activeLineRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeLineIndex, player.isPlaying]);

  return (
    <div className="flex h-full relative">
      {showSidebar && (
        <Sidebar products={episode.products} currentProduct={currentProduct}
          onProductClick={onProductClick} onClose={() => setShowSidebar(false)} />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 shrink-0 backdrop-blur-xl"
          style={{ backgroundColor: t.headerBg, borderBottom: `1px solid ${t.border}` }}>
          {/* Row 1: Title + sidebar toggle */}
          <div className="px-6 py-3">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowSidebar(!showSidebar)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{
                    backgroundColor: showSidebar ? "#7c6cf6" : t.elevated,
                    border: showSidebar ? "none" : `1px solid ${t.borderLight}`,
                    boxShadow: showSidebar ? "0 4px 12px rgba(124,108,246,0.25)" : "none",
                  }}>
                  <ListMusic className="w-4 h-4" style={{ color: showSidebar ? "#fff" : t.textSecondary }} />
                </button>
                <div>
                  <h1 className="font-semibold text-[15px] leading-tight" style={{ color: t.text }}>
                    {episode.title}
                  </h1>
                  <p className="text-[11px] mt-0.5" style={{ color: t.textMuted }}>
                    {new Date(episode.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    {" \u00b7 "}{episode.products.length} products
                    {" \u00b7 "}{Math.ceil((episode.duration_seconds || 0) / 60)} min
                  </p>
                </div>
              </div>
              <div />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-2xl mx-auto px-8 py-10">
            {/* Tab bar — in content area */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center rounded-full p-0.5" style={{ backgroundColor: t.surfaceHover }}>
                {([["listen", "Listen"], ["transcript", "Transcript"], ["share", "Export"]] as const).map(([key, label]) => (
                  <button key={key}
                    onClick={() => setActiveTab(key)}
                    className="flex items-center px-4 py-1.5 rounded-full text-[12px] font-medium transition-all"
                    style={{
                      backgroundColor: activeTab === key ? t.elevated : "transparent",
                      color: activeTab === key ? t.text : t.textMuted,
                      boxShadow: activeTab === key ? `0 1px 3px ${t.shadow}` : "none",
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {/* === Listen Tab === */}
            {(activeTab === "listen" || activeTab === "transcript") && (
              <>
                {/* Intro card */}
                <div className="mb-10 p-5 rounded-2xl border"
                  style={{
                    background: `linear-gradient(135deg, ${t.introCardFrom}, ${t.introCardTo})`,
                    borderColor: t.border,
                  }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c6cf6] to-[#f97316] flex items-center justify-center shadow-lg">
                        <Headphones className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold" style={{ color: t.text }}>LaunchCast Daily</p>
                        <p className="text-[11px]" style={{ color: t.textMuted }}>Product Hunt Podcast by AI</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 text-[11px]" style={{ color: t.textMuted }}>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#f97316]/20 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />
                        </span>
                        Aero (Skeptic)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
                        </span>
                        Nova (Optimist)
                      </span>
                    </div>
                  </div>
                </div>

                {filteredLines.map((line, i) => {
                  const isFirstMention = line.product_ref &&
                    !filteredLines.slice(0, i).some((l) => l.product_ref === line.product_ref);
                  const product = isFirstMention
                    ? episode.products.find((p) => p.name.toLowerCase() === line.product_ref?.toLowerCase())
                    : null;
                  return (
                    <div key={i}>
                      {product && (
                        <ProductThumbnail product={product} onClick={() => onProductClick(product)} />
                      )}
                      <TranscriptBlock line={line} isActive={i === activeLineIndex}
                        wordProgress={i === activeLineIndex ? wordProgress.current : 0}
                        isPast={i < activeLineIndex}
                        lineRef={i === activeLineIndex ? activeLineRef : undefined}
                        onClick={() => seekToLine(i)}
                        productNames={productNames} />
                    </div>
                  );
                })}
              </>
            )}

            {/* === Export Tab === */}
            {activeTab === "share" && (
              <ExportPanel episode={episode} />
            )}

            <div className="h-40" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Floating Player Bar ── */
function BottomPlayerBar({ onToggleTheme, isDark }: { onToggleTheme: () => void; isDark: boolean }) {
  const { t } = useTheme();
  const player = useAudioPlayer();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isInputFocused()) { e.preventDefault(); player.isPlaying ? player.pause() : player.play(); }
      if (e.code === "ArrowLeft" && !isInputFocused()) { e.preventDefault(); const a = player.ref.current; if (a) a.currentTime = Math.max(0, a.currentTime - 10); }
      if (e.code === "ArrowRight" && !isInputFocused()) { e.preventDefault(); const a = player.ref.current; if (a) a.currentTime = Math.min(a.duration, a.currentTime + 10); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [player.isPlaying]);

  const skip = (sec: number) => {
    const a = player.ref.current;
    if (a) a.currentTime = Math.max(0, Math.min(a.duration, a.currentTime + sec));
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-[min(660px,92vw)]">
      <div className="backdrop-blur-xl rounded-2xl px-5 py-3"
        style={{
          backgroundColor: t.playerBg,
          border: `1px solid ${t.playerBorder}`,
          boxShadow: `0 8px 32px ${t.shadow}`,
        }}>
        <div className="mb-2">
          <AudioPlayerProgress
            className="h-5 [&_[data-slot=slider-track]]:h-[3px] [&_[data-slot=slider-thumb]]:opacity-0 hover:[&_[data-slot=slider-thumb]]:opacity-100 [&_[data-slot=slider-thumb]>div]:size-3"
            style={{
              "--player-track": t.scrubTrack,
              "--player-indicator": "linear-gradient(to right, #7c6cf6, #a78bfa)",
              "--player-thumb": isDark ? "#fff" : "#111",
            } as React.CSSProperties} />
        </div>
        <div className="flex items-center gap-3">
          <AudioPlayerTime className="font-mono text-[11px] tabular-nums shrink-0 w-10 text-right" style={{ color: t.textSecondary }} />
          <div className="flex-1 flex items-center justify-center gap-3">
            <button onClick={() => skip(-15)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ color: t.controlText }}>
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={() => player.isPlaying ? player.pause() : player.play()}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95"
              style={{ backgroundColor: t.playBtn, boxShadow: `0 4px 12px ${t.shadow}` }}>
              {player.isPlaying
                ? <Pause className="w-5 h-5" style={{ color: t.playBtnText }} />
                : <Play className="w-5 h-5 ml-0.5" style={{ color: t.playBtnText }} />
              }
            </button>
            <button onClick={() => skip(15)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ color: t.controlText }}>
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <AudioPlayerDuration className="font-mono text-[11px] tabular-nums w-10" style={{ color: t.textMuted }} />
            <button onClick={() => {
                const speeds = [1, 1.25, 1.5, 2, 0.5, 0.75];
                const idx = speeds.indexOf(player.playbackRate);
                player.setPlaybackRate(speeds[(idx + 1) % speeds.length]);
              }}
              className="text-[11px] font-mono transition-all px-2 py-1 rounded-lg"
              style={{ color: t.speedText, backgroundColor: t.speedBg, border: `1px solid ${t.speedBorder}` }}>
              {player.playbackRate}x
            </button>
            {/* Theme toggle */}
            <button onClick={onToggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ color: t.controlText, backgroundColor: t.speedBg, border: `1px solid ${t.speedBorder}` }}>
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Root ── */
export function PlayerScreen({ episodeId, onBack }: PlayerScreenProps) {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [, setPastEpisodes] = useState<EpisodeSummary[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  const t = isDark ? themes.dark : themes.light;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (episodeId) { const ep = await fetchEpisode(episodeId); setEpisode(ep); }
        const all = await fetchEpisodes();
        setPastEpisodes(all);
        if (!episodeId && all.length > 0) { const ep = await fetchEpisode(all[0].id); setEpisode(ep); }
      } catch { setError("No episodes found yet. Generate one first!"); }
      finally { setLoading(false); }
    }
    load();
  }, [episodeId]);

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center" style={{ backgroundColor: t.bg }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c6cf6] to-[#f97316] flex items-center justify-center animate-pulse">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div className="text-sm" style={{ color: t.textMuted }}>Loading episode...</div>
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center gap-4" style={{ backgroundColor: t.bg }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: t.elevated, border: `1px solid ${t.borderLight}` }}>
          <Headphones className="w-7 h-7" style={{ color: t.textMuted }} />
        </div>
        <p className="text-sm" style={{ color: t.textSecondary }}>
          {error || "No episodes yet. Generate your first episode!"}
        </p>
        <button onClick={onBack}
          className="text-sm font-medium px-4 py-2 rounded-lg transition-all text-[#7c6cf6] border border-[#7c6cf6]/30 hover:border-[#7c6cf6]/60">
          Back to Setup
        </button>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ t, isDark }}>
      <AudioPlayerProvider>
        <div className="min-h-svh flex flex-col transition-colors duration-300 relative" style={{ backgroundColor: t.bg }}>
          {/* Background grid gif */}
          <div
            className="fixed inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: "url(/assets/ascii-dark.gif)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: isDark ? 0.12 : 0.08,
            }}
          />
          <div className="flex-1 flex flex-col h-[calc(100svh-80px)] relative z-[1]">
            <EpisodeView episode={episode}
              onProductClick={(product) => { setCurrentProduct(product); setSelectedProduct(product); }}
              currentProduct={currentProduct} />
          </div>
          <BottomPlayerBar onToggleTheme={() => setIsDark(!isDark)} isDark={isDark} />
        </div>

        {selectedProduct && (
          <ProductDeepDive product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        )}
      </AudioPlayerProvider>
    </ThemeContext.Provider>
  );
}
