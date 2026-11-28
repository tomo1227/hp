"use client";

import { getImgFromS3 } from "@/lib/s3";

type S3ImageDownloaderProps = {
  imagePath: string;
  children: (options: { onClick: () => void }) => React.ReactNode;
};

export const S3ImageDownloader: React.FC<S3ImageDownloaderProps> = ({
  imagePath,
  children,
}) => {
  return <>{children({ onClick: () => handleGetButton(imagePath) })}</>;
};

async function handleGetButton(imagePath: string) {
  try {
    const base64Data = await getImgFromS3(imagePath);
    const binaryData = atob(base64Data);
    const uint8Array = Uint8Array.from(binaryData, (c) => c.charCodeAt(0));

    const blob = new Blob([uint8Array], {
      type: "image/jpeg",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    const fileName = imagePath.split("/").pop() || "download.jpg";
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error fetching or downloading file:", error);
  }
}
