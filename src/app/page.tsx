import Image from "next/image";
import Link from "next/link";

export default function Page() {
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <div className="full-width justify-center flex">
                    <Link href="/ja/home">
                        <Image
                            src="/img/top-page.jpg"
                            alt="top-page-jpg"
                            width={250}
                            height={250}
                        />
                    </Link>
                </div>
            </main>
        </div>
    );
}
