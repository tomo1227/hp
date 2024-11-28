import Link from "next/link";
import Image from "next/image";
import { Zen_Antique_Soft } from "next/font/google";

const zenAntiqueSoft = Zen_Antique_Soft({
    weight: "400",
    subsets: ["latin"],
});

const imageSize: number = 350;
export default function Page() {
    return (
        <div className="flex md:flex-row justify-center items-center md:gap-20 mt-20 max-md:flex-col">
            <div className="max-md:h-screen">
                <div className="flex justify-center">
                    <Link href="/ja/travel">
                        <Image
                            src="https://tomokiota-photos.s3.ap-northeast-1.amazonaws.com/travel/083A6040.jpg"
                            alt="travel-jpg"
                            width={imageSize}
                            height={imageSize}
                            className="w-full h-auto"
                            priority
                            placeholder="blur"
                            blurDataURL="iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAEUlEQVR42mP8W8+AARiHsiAApFUO4yajeNAAAAAASUVORK5CYII="
                        />
                    </Link>
                </div>
                <h2
                    className={`${zenAntiqueSoft.className} justify-center flex text-2xl font-bold pt-5`}
                >
                    トラベル
                </h2>
            </div>
            <div className="max-md:h-screen">
                <div className="flex justify-center">
                    <Link href="/ja/photography">
                        <Image
                            src="https://tomokiota-photos.s3.ap-northeast-1.amazonaws.com/travel/083A0852.jpg"
                            alt="photography-jpg"
                            width={imageSize}
                            height={imageSize}
                            className="w-full h-auto"
                            priority
                            placeholder="blur"
                            blurDataURL="iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAEUlEQVR42mP8W8+AARiHsiAApFUO4yajeNAAAAAASUVORK5CYII="
                        />
                    </Link>
                </div>
                <h2
                    className={`${zenAntiqueSoft.className} justify-center flex text-2xl font-bold pt-5`}
                >
                    写真
                </h2>
            </div>
        </div>
    );
}
