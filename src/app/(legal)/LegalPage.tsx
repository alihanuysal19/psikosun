"use client";
import { ReactNode } from "react";

interface Section {
  title: string;
  content: ReactNode;
}

interface Props {
  title: string;
  updatedAt?: string;
  intro?: string;
  sections: Section[];
}

export default function LegalPage({ title, updatedAt, intro, sections }: Props) {
  return (
    <div className="space-y-8">
      {/* Başlık kartı */}
      <div
        className="rounded-2xl p-6 sm:p-8"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.07) 0%, rgba(0,188,212,0.07) 100%)",
          border: "1px solid rgba(124,58,237,0.15)",
        }}
      >
        <h1
          className="text-2xl sm:text-3xl font-black tracking-tight mb-2"
          style={{
            fontFamily: "var(--font-grotesk),'Space Grotesk',system-ui,sans-serif",
            background: "linear-gradient(90deg,#7c3aed,#00bcd4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {title}
        </h1>
        {updatedAt && (
          <p className="text-xs text-gray-400 dark:text-gray-500">{updatedAt}</p>
        )}
        {intro && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {intro}
          </p>
        )}
      </div>

      {/* Bölümler */}
      {sections.map((s, i) => (
        <div
          key={i}
          className="bg-white dark:bg-darkgray rounded-2xl p-5 sm:p-6 shadow-sm border border-border dark:border-darkborder"
        >
          <h2
            className="text-base font-bold text-dark dark:text-white mb-3 flex items-center gap-2"
            style={{ fontFamily: "var(--font-grotesk),'Space Grotesk',system-ui,sans-serif" }}
          >
            <span
              className="w-1.5 h-5 rounded-full flex-shrink-0"
              style={{ background: "linear-gradient(180deg,#7c3aed,#00bcd4)" }}
            />
            {s.title}
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed space-y-2">
            {s.content}
          </div>
        </div>
      ))}
    </div>
  );
}
