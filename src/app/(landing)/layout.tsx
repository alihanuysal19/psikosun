import { ReactNode } from "react";

// Bu layout sadece landing page (/) için prism-flux.css yükler.
// Diğer sayfalara (kesfet, auth, panel vb.) kesinlikle uygulanmaz.
export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/landing/prism-flux.css" />
      {children}
    </>
  );
}
