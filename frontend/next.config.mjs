/** @type {import('next').NextConfig} */
// customizing the settings for v1 website development
const nextConfig = {
  output: 'export', 
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
