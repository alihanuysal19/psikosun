import withFlowbiteReact from "flowbite-react/plugin/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|favicon|images).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=0, must-revalidate",
          },
          {
            key: "Clear-Site-Data",
            value: '"cache"',
          },
        ],
      },
    ];
  },
};

export default withFlowbiteReact(nextConfig);
