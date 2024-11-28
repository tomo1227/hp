import Image from "next/image";
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
                src={`/img/photography/img${id}.jpg`}
                alt="travel-jpg"
                width={500}
                height={500}
                className="w-full h-auto"
                priority
            />
        </div>
    );
}
