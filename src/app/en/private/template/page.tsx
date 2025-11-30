import type { Metadata } from "next";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import { S3FileDownloader } from "@/components/features/s3/fileDownload";
import { S3ImageDownloader } from "@/components/features/s3/imageDownload";
import { rgbDataURL } from "@/lib/blurImage";

export const metadata: Metadata = {
  robots: {
    index: false,
  },
};

export default async function Page() {
  const s3_path = "portrait/shubodai";
  const base_url = `https://d9h1q21gc2t6n.cloudfront.net/${s3_path}`;
  const count = 5;

  const images = Array.from({ length: count }, (_, index) => ({
    id: `shubodai-${index + 1}`,
    originalPath: `${s3_path}/original/img${index + 1}.jpg`,
    compressedPath: `${s3_path}/compressed/img${index + 1}.jpg`,
    compressedUrl: `${base_url}/compressed/img${index + 1}.jpg`,
  }));

  return (
    <div>
      <div className="mb-2">
        <span className="font-bold">
          This page is private. Please refrain from sharing the link as it is
          not publicly accessible. <br />
          Please choose either the original or the compressed version to
          download the image. <br />
          Original: High quality, Compressed: Low quality
        </span>
      </div>
      <div className="download-contents !rounded-2xl mb-2">
        <span className="download-text">All Images Download</span>
        <div className="download-buttons">
          <S3FileDownloader filePath={`${s3_path}/original.zip`}>
            <button type="button" className="btn-original w-5/12">
              Original(約72MB)
            </button>
          </S3FileDownloader>
          <S3FileDownloader filePath={`${s3_path}/compressed.zip`}>
            <button type="button" className="btn-compressed w-5/12">
              Compressed(約4MB)
            </button>
          </S3FileDownloader>
        </div>
      </div>
      <section className="private-cards-container">
        {images.map((image) => (
          <div key={image.id}>
            <Zoom>
              <Image
                src={`${image.compressedUrl}`}
                alt={`${image.id}`}
                width={800}
                height={800}
                id={`${image.id}`}
                placeholder="blur"
                blurDataURL={rgbDataURL(192, 192, 192)}
              />
            </Zoom>
            <div className="download-contents">
              <span className="download-text">Download</span>
              <div className="download-buttons">
                <S3ImageDownloader imagePath={image.originalPath}>
                  <button type="button" className="btn-original">
                    Original
                  </button>
                </S3ImageDownloader>
                <S3ImageDownloader imagePath={image.compressedPath}>
                  <button type="button" className="btn-compressed">
                    Compressed
                  </button>
                </S3ImageDownloader>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
