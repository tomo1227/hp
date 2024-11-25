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
                <h2 className={`${rockSaltFont.className} pb-3 text-xl`}>
                    Tomoki Ota
                </h2>
                <div className="justify-center flex">
                    <Link href="/ja/home">
                        <Image
                            src="/img/top-page.jpg"
                            alt="top-page-jpg"
                            width={300}
                            height={300}
                        />
                    </Link>
                </div>
            </main>
        </div>
    );
}
