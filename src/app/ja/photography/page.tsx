import Image from "next/image";
import Link from "next/link";
import { rgbDataURL } from "../../../lib/blurImage";

export default function Page() {
  const photos = Array.from({ length: 9 }, (_, i) => i + 1);
  const imageSize = 200;

  return (
    <section className="cards-container" style={{ position: "relative" }}>
      {photos.map((id) => (
        <Link
          className="card square"
          key={id}
          href={`/ja/photography/photos/${id}`}
        >
          <Image
            src={`https://tomokiota-photos.s3.ap-northeast-1.amazonaws.com/travel/gallery/img${id}.jpg`}
            alt={`grid-img${id}`}
            width={imageSize}
            height={imageSize}
            className="aspect-square object-cover object-[center_30%] w-full h-full"
            placeholder="blur"
            blurDataURL={rgbDataURL(192, 192, 192)}
          />
        </Link>
      ))}
    </section>
  );
}
