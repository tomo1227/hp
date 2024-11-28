import { Modal } from "./modal";
import Image from "next/image";

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
                    src={`/img/photography/img${photoId}.jpg`}
                    alt={`modal-img${photoId}`}
                    width={500}
                    height={500}
                    className="w-full h-auto"
                    priority
                    placeholder="blur"
                    blurDataURL="iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAEUlEQVR42mP8W8+AARiHsiAApFUO4yajeNAAAAAASUVORK5CYII="
                />
            </div>
        </Modal>
    );
}
