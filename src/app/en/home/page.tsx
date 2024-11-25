import Link from "next/link";
import Image from "next/image";

const imageSize: number = 350;

export default function Page() {
    return (
        <div className="flex flex-row justify-center items-center gap-20 mt-20 max-md:flex-col">
            <div>
                <div className="full-width justify-center flex">
                    <Link href="/en/travel">
                        <Image
                            src="/img/travel.jpg"
                            alt="travel-jpg"
                            width={imageSize}
                            height={imageSize}
                        />
                    </Link>
                </div>
                <h2 className="full-width justify-center flex text-2xl font-bold pt-5">
                    Travel
                </h2>
            </div>
            <div>
                <div className="full-width justify-center flex">
                    <Link href="/en/travel">
                        <Image
                            src="/img/photography.jpg"
                            alt="photography-jpg"
                            width={imageSize}
                            height={imageSize}
                        />
                    </Link>
                </div>
                <h2 className="full-width justify-center flex text-2xl font-bold pt-5">
                    Photography
                </h2>
            </div>
        </div>
    );
}
