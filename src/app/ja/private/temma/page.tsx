import { rgbDataURL } from "@/lib/blurImage";
import { Metadata } from "next";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";

export const metadata: Metadata = {
  robots: {
    index: false,
  },
};

export default async function Page() {
  const base_url = 'https://tomokiota-photos.s3.ap-northeast-1.amazonaws.com/portrait/temma';
  const count = 20;

  const images = Array.from({ length: count }, (_, index) => ({
      id: `temma-${index + 1}`,
      originalUrl: `${base_url}/original/img${index + 1}.jpg`,
      compressedUrl: `${base_url}/compressed/img${index + 1}.jpg`,
  }));

  return (
    <div>
      <div className="mb-2">
        <span className="font-bold">
        オリジナルか圧縮版を選択し、画像を右クリックもしくは長押しして保存してください。<br />
        オリジナル: 高画質, 圧縮版: 低画質
        </span>
      </div>
      <div className="download-contents !rounded-2xl mb-2">
        <span className="download-text">全ての画像のダウンロード</span>
        <div className="download-buttons">
          <a href={`${base_url}/original/`} download="temma_original.zip">
            <button className="btn-original w-5/12">オリジナル</button>
          </a>
          <a href={`${base_url}/compressed/`} download="temma_compressed.zip"></a>
            <button className="btn-compressed w-5/12">圧縮版</button>
        </div>
      </div>
      <section className="private-cards-container">
        {images.map((image,index) => (
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
                <a href={`${image.originalUrl}`} download={`${index + 1}.jpg`}>
                  <button className="btn-original">オリジナル</button>
                </a>
                <a href={`${image.compressedUrl}`} download={`${index + 1}.jpg`}>
                  <button className="btn-compressed">圧縮版</button>
                </a>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
