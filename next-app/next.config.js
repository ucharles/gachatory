/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "static.gachatory.com",
      "cdn.discordapp.com",
      "avatars.githubusercontent.com",
      "lh3.googleusercontent.com",
    ],
  },
  output: "standalone",

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
