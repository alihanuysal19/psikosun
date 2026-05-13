"use client";
import { Icon } from "@iconify/react";

export const SOCIAL_LINKS = [
  {
    key: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/people/Psikosun-%C3%96%C4%9Frenci-Ko%C3%A7lu%C4%9Fu-PDR/61588719912235/",
    icon: "tabler:brand-facebook",
    color: "#1877F2",
  },
  {
    key: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/psikosun",
    icon: "tabler:brand-instagram",
    color: "#E1306C",
  },
  {
    key: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@psikosun",
    icon: "tabler:brand-tiktok",
    color: "#000000",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/psikosun/",
    icon: "tabler:brand-linkedin",
    color: "#0A66C2",
  },
] as const;

interface Props {
  size?: number;
  variant?: "compact" | "labeled";
  className?: string;
  iconClassName?: string;
}

export default function SocialLinks({
  size = 18,
  variant = "compact",
  className = "",
  iconClassName = "",
}: Props) {
  if (variant === "labeled") {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}>
        {SOCIAL_LINKS.map((s) => (
          <a
            key={s.key}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="flex items-center gap-2 p-3 rounded-xl border border-border dark:border-darkborder hover:border-primary hover:bg-primary/5 transition-colors group"
          >
            <span
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0 transition-transform group-hover:scale-110"
              style={{ background: s.color }}
            >
              <Icon icon={s.icon} width={18} />
            </span>
            <span className="text-sm font-medium text-dark dark:text-white">{s.label}</span>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {SOCIAL_LINKS.map((s) => (
        <a
          key={s.key}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          title={s.label}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-white border border-border dark:border-darkborder hover:border-transparent transition-all ${iconClassName}`}
          style={
            {
              ["--social-bg" as any]: s.color,
            } as React.CSSProperties
          }
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = s.color;
            (e.currentTarget as HTMLElement).style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "";
            (e.currentTarget as HTMLElement).style.color = "";
          }}
        >
          <Icon icon={s.icon} width={size} />
        </a>
      ))}
    </div>
  );
}
