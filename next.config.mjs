/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["tomokiota-photos.s3.ap-northeast-1.amazonaws.com"],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "www.instagram.com",
                port: "",
                pathname: "/tomomon1227/**",
                search: "",
            },
            {
                protocol: "https",
                hostname: "tomokiota-photos.s3.ap-northeast-1.amazonaws.com",
                port: "",
                pathname: "*",
                search: "",
            },
        ],
    },
};

export default nextConfig;
