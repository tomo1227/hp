import Image from "next/image";
import { rgbDataURL } from "../../../../../../lib/blurImage";
import { Modal } from "./modal";

export default async function PhotoModal({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const photoId = (await params).id;
    return (
        <Modal>
            <div className="flex flex-col justify-center items-center">
                <Image
                    src={`https://tomokiota-photos.s3.ap-northeast-1.amazonaws.com/travel/gallery/img${photoId}.jpg`}
                    alt={`modal-img${photoId}`}
                    width={500}
                    height={500}
                    className="w-full h-auto"
                    priority
                    placeholder="blur"
                    blurDataURL={rgbDataURL(192, 192, 192)}
                />
            </div>
        </Modal>
    );
}
