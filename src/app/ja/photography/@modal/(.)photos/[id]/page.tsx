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
                    alt="travel-jpg"
                    width={500}
                    height={500}
                />
            </div>
        </Modal>
    );
}
