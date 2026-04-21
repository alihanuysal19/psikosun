import withFlowbiteReact from "flowbite-react/plugin/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: { unoptimized: true },
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  async headers() {
    return [
      // Landing statik asset'leri (görseller, CSS, JS) hash'siz ama
      // dosya ismi değişmiyor → 1 gün + stale-while-revalidate; deploy
      // sonrası kullanıcı tarayıcısı arka planda tazeler.
      {
        source: "/landing/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/favicon.svg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, immutable" },
        ],
      },
      // HTML — deploy sonrası hızla temiz içerik gelsin
      {
        source: "/((?!_next/static|_next/image|favicon|landing|images).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default withFlowbiteReact(nextConfig);
