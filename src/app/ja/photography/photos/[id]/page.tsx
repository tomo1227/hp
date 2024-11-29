import Image from "next/image";
import { rgbDataURL } from "../../../../../lib/blurImage";
export const dynamicParams = false;

export function generateStaticParams() {
    const slugs = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    return slugs.map((slug) => ({ id: slug }));
}

export default async function PhotoPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const id = (await params).id;
    return (
        <div className="flex flex-col justify-center items-center">
            <Image
                src={`https://tomokiota-photos.s3.ap-northeast-1.amazonaws.com/travel/gallery/img1${id}.jpg`}
                alt={`photo${id}`}
                width={500}
                height={500}
                className="w-full h-auto"
                priority
                placeholder="blur"
                blurDataURL={rgbDataURL(100, 0, 100)}
            />
        </div>
    );
}
