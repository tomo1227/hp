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
        <div className="flex flex-row justify-center items-center gap-20 mt-20 max-md:flex-col">
            <div>
                <div className="full-width justify-center flex">
                    <Link href="/ja/travel">
                        <Image
                            src="/img/travel.jpg"
                            alt="travel-jpg"
                            width={imageSize}
                            height={imageSize}
                        />
                    </Link>
                </div>
                <h2
                    className={`${zenAntiqueSoft.className} full-width justify-center flex text-2xl font-bold pt-5`}
                >
                    トラベル
                </h2>
            </div>
            <div>
                <div className="full-width justify-center flex">
                    <Link href="/ja/travel">
                        <Image
                            src="/img/photography.jpg"
                            alt="photography-jpg"
                            width={imageSize}
                            height={imageSize}
                        />
                    </Link>
                </div>
                <h2
                    className={`${zenAntiqueSoft.className} full-width justify-center flex text-2xl font-bold pt-5`}
                >
                    写真
                </h2>
            </div>
        </div>
    );
}
