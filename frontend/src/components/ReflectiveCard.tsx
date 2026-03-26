import { type ReactNode } from "react";

interface ReflectiveCardProps {
  blurStrength?: number;
  color?: string;
  metalness?: number;
  roughness?: number;
  overlayColor?: string;
  className?: string;
  children?: ReactNode;
  videoContent?: ReactNode;
}

export function ReflectiveCard({
  blurStrength = 18,
  color = "white",
  metalness = 1,
  roughness = 0.4,
  overlayColor = "rgba(255, 255, 255, 0.05)",
  className = "",
  children,
  videoContent,
}: ReflectiveCardProps) {
  return (
    <div
      className={`reflective-card-container ${className}`}
      style={{
        "--blur-strength": `${blurStrength}px`,
        "--metalness": metalness,
        "--roughness": roughness,
        "--overlay-color": overlayColor,
        "--text-color": color,
      } as React.CSSProperties}
    >
      {/* Video / ASCII background */}
      <div className="reflective-video-wrap">
        {videoContent}
      </div>

      <div className="reflective-noise" />
      <div className="reflective-sheen" />
      <div className="reflective-border" />

      <div className="reflective-content">
        {children}
      </div>
    </div>
  );
}
