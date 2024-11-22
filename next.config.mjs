/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['fppublicstorage.s3.amazonaws.com'], // 添加允许的域名
    },
  };

export default nextConfig;
