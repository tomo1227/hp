import localFont from "next/font/local";
import Image from "next/image";
import Link from "next/link";
import { rgbDataURL } from "../../lib/blurImage";

const rockSaltFont = localFont({
  display: "swap",
  src: "../fonts/RockSalt-Regular.woff",
  weight: "400",
});

export default function Page() {
  return (
    <div className="flex items-center justify-items-center min-h-screen">
      <main className="flex flex-col justify-center items-center pb-10">
        <h2 className={`${rockSaltFont.className} pb-4 text-4xl`}>
          Tomoki Ota
        </h2>
        <div className="justify-center flex">
          <Link href="/ja/gallery" passHref>
            <Image
              src="https://d9h1q21gc2t6n.cloudfront.net/travel/083A6269.jpg"
              placeholder="blur"
              blurDataURL={rgbDataURL(192, 192, 192)}
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
