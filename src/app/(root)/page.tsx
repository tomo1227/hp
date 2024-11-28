import Image from "next/image";
import Link from "next/link";
import { Rock_Salt } from "next/font/google";

const rockSaltFont = Rock_Salt({
    weight: "400",
    subsets: ["latin"],
});

export default function Page() {
    return (
        <div className="flex items-center justify-items-center min-h-screen">
            <main className="flex flex-col justify-center items-center pb-10">
                <h2 className={`${rockSaltFont.className} pb-4 text-4xl`}>
                    Tomoki Ota
                </h2>
                <div className="justify-center flex">
                    <Link href="/ja/home">
                        <Image
                            src="https://tomokiota-photos.s3.ap-northeast-1.amazonaws.com/travel/083A6269-2.jpg"
                            alt="top-page-jpg"
                            width={300}
                            height={300}
                            className="w-full h-auto"
                            priority
                        />
                    </Link>
                </div>
            </main>
        </div>
    );
}
