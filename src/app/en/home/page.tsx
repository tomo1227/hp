import Link from "next/link";
import Image from "next/image";
import { Rock_Salt } from "next/font/google";

const rockSaltFont = Rock_Salt({
    weight: "400",
    subsets: ["latin"],
});

const imageSize: number = 350;

export default function Page() {
    return (
        <div className="flex md:flex-row justify-center items-center md:gap-20 pt-20 max-md:flex-col">
            <div className="max-md:h-screen">
                <div className="flex justify-center">
                    <Link href="/en/travel">
                        <Image
                            src="https://tomokiota-photos.s3.ap-northeast-1.amazonaws.com/travel/083A6040.jpg"
                            alt="travel-jpg"
                            width={imageSize}
                            height={imageSize}
                        />
                    </Link>
                </div>
                <h2
                    className={`${rockSaltFont.className} full-width justify-center flex text-lg font-bold pt-5`}
                >
                    Travel
                </h2>
            </div>
            <div className="max-md:h-screen">
                <div className="flex justify-center">
                    <Link href="/en/photography">
                        <Image
                            src="https://tomokiota-photos.s3.ap-northeast-1.amazonaws.com/travel/083A0852.jpg"
                            alt="photography-jpg"
                            width={imageSize}
                            height={imageSize}
                        />
                    </Link>
                </div>
                <h2
                    className={`${rockSaltFont.className} full-width justify-center flex text-lg font-bold pt-5`}
                >
                    Photography
                </h2>
            </div>
        </div>
    );
}
