"use client";

import { getImgFromS3 } from "@/lib/s3";

type S3ImageDownloaderProps = {
  imagePath: string;
  children: React.ReactNode;
};

export const S3ImageDownloader: React.FC<{
  imagePath: string;
  children: React.ReactNode;
}> = ({ imagePath, children }: S3ImageDownloaderProps) => {
  return (
    // TODO: Add proper a11y features
    // biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div className="dlImgBtn" onClick={() => handleGetButton(imagePath)}>
      {children}
    </div>
  );
};

async function handleGetButton(imagePath: string) {
  try {
    const base64Data = await getImgFromS3(imagePath);
    const binaryData = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }

    const blob = new Blob([uint8Array], {
      type: "image/jpeg",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    const fileName = imagePath.split("/").pop();
    a.href = url;
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    a.download = fileName!;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error fetching or downloading file:", error);
  }
}
