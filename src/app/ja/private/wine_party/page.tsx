import { S3FileDownloader } from "@/components/features/s3/fileDownload";
import { S3ImageDownloader } from "@/components/features/s3/imageDownload";
import { rgbDataURL } from "@/lib/blurImage";
import type { Metadata } from "next";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";

export const metadata: Metadata = {
  robots: {
    index: false,
  },
};

export default async function Page() {
  const s3_path = "portrait/wine";
  const base_url = `https://d9h1q21gc2t6n.cloudfront.net/${s3_path}`;
  const count = 38;

  const images = Array.from({ length: count }, (_, index) => ({
    id: `wine-party-${index + 1}`,
    originalPath: `${s3_path}/original/img${index + 1}.jpg`,
    compressedPath: `${s3_path}/compressed/img${index + 1}.jpg`,
    compressedUrl: `${base_url}/compressed/img${index + 1}.jpg`,
  }));

  return (
    <div>
      <div className="mb-2">
        <span className="font-bold">
          このページは非公開です。
          <br />
          <span className="text-red-500">リンクの共有はご遠慮ください。</span>
          <br />
          オリジナル版または圧縮版を選んで、画像をダウンロードしてください。
          <br />
          iPhoneなどの写真アプリに保存する場合は、画像をクリックして長押しすると保存できます。
          <br />
          ・オリジナル版: 高画質（印刷や大画面での表示・拡大に適しています）
          <br />
          ・圧縮版: 低画質（携帯で見る場合はこちらで十分）
        </span>
      </div>
      <div className="download-contents !rounded-2xl mb-2">
        <span className="download-text">
          全ての画像のダウンロード(ZIP, PC推奨)
        </span>
        <div className="download-buttons">
          <S3FileDownloader filePath={`${s3_path}/original.zip`}>
            <button type="button" className="btn-original w-5/12">
              オリジナル(約550MB)
            </button>
          </S3FileDownloader>
          <S3FileDownloader filePath={`${s3_path}/compressed.zip`}>
            <button type="button" className="btn-compressed w-5/12">
              圧縮版(約61MB)
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
              <span className="download-text">ダウンロード</span>
              <div className="download-buttons">
                <S3ImageDownloader imagePath={image.originalPath}>
                  <button type="button" className="btn-original">
                    オリジナル
                  </button>
                </S3ImageDownloader>
                <S3ImageDownloader imagePath={image.compressedPath}>
                  <button type="button" className="btn-compressed">
                    圧縮版
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
