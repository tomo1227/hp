/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            "www.instagram.com",
            "tomokiota-photos.s3.ap-northeast-1.amazonaws.com",
        ],
    },
    env: {
        GMAIL_USER: process.env.GMAIL_USER,
        GMAIL_APP_PASS: process.env.GMAIL_APP_PASS,
    },
};

export default nextConfig;
