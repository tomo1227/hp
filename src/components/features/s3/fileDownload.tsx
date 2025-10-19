"use client";

import { getZipFromS3 } from "@/lib/s3";

type S3FileDownloaderProps = {
  filePath: string;
  children: React.ReactNode;
};

export const S3FileDownloader: React.FC<S3FileDownloaderProps> = ({
  filePath,
  children,
}) => {
  return (
    // TODO: Add proper a11y features
    // biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div className="dlImgBtn" onClick={() => handleGetButton(filePath)}>
      {children}
    </div>
  );
};

async function handleGetButton(filePath: string) {
  try {
    const arrayBuffer = await getZipFromS3({ filePath: filePath });

    if (!(arrayBuffer instanceof ArrayBuffer)) {
      throw new Error("Invalid file data received.");
    }

    const blob = new Blob([arrayBuffer], { type: "application/zip" });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    const fileName = filePath.split("/").pop() || "download.zip";
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
