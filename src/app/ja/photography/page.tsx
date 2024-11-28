import Image from "next/image";
import Link from "next/link";

export default function Page() {
    const photos = Array.from({ length: 6 }, (_, i) => i + 1);
    const imageSize = 200;

    return (
        <section className="cards-container">
            {photos.map((id) => (
                <Link
                    className="card"
                    key={id}
                    href={`/ja/photography/photos/${id}`}
                    passHref
                >
                    <Image
                        src={`/img/photography/img${id}.jpg`}
                        alt="travel-jpg"
                        width={imageSize}
                        height={imageSize}
                        className="aspect-square object-cover object-[center_30%] w-full h-auto"
                    />
                </Link>
            ))}
        </section>
    );
}
