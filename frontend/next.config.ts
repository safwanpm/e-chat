
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'], // 👈 add this
  },
};

module.exports = nextConfig;
