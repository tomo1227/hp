"use client";

import localFont from "next/font/local";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const rockSaltFont = localFont({
    display: "swap",
    src: "../../app/fonts/RockSalt-Regular.woff",
    weight: "400",
});

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();

    const toggleLanguage = (lang: string) => {
        const newPath = pathname.replace(/^\/(ja|en)/, `/${lang}`);
        router.push(newPath);
    };

    const isJapanese = pathname.startsWith("/ja/");

    return (
        <header
            className={
                "text-center border-b px-4 mx-2 max-md:px-2 dark:border-gray-500 w-full h-16 tracking-widest dark:text-gray-100 flex justify-between items-center"
            }
        >
            <Link href="/" className="flex items-center">
                <h2
                    className={`${rockSaltFont.className} font-semibold text-center text-xl px-3 max-md:text-sm`}
                >
                    Tomoki Ota
                </h2>
            </Link>
            <div className="flex justify-center">
                <div className="flex gap-1 items-center text-sm font-medium pr-5 max-md:pr-2">
                    <Link
                        href={isJapanese ? "/ja/blogs" : "/en/blogs"}
                        className="hover:text-blue-500 cursor-pointer hover:underline"
                    >
                        Blog
                    </Link>
                </div>
                <div className="flex gap-1 items-center text-sm font-medium pr-5 max-md:pr-2">
                    <Link
                        href={isJapanese ? "/ja/contact" : "/en/contact"}
                        className="hover:text-blue-500 cursor-pointer hover:underline"
                    >
                        Contact
                    </Link>
                </div>
                <div className="flex gap-1 items-center text-sm font-medium pr-5">
                    <button
                        type="button"
                        onClick={() => toggleLanguage("ja")}
                        className={`${
                            isJapanese
                                ? "text-red-500" // isJapaneseがtrueのとき赤色
                                : "hover:text-red-500" // falseのときホバーで赤色
                        } cursor-pointer hover:underline`}
                    >
                        JP
                    </button>
                    <span className="text-gray-500 dark:text-gray-400">/</span>
                    <button
                        type="button"
                        onClick={() => toggleLanguage("en")}
                        className={`${
                            !isJapanese
                                ? "text-red-500" // isJapaneseがtrueのとき赤色
                                : "hover:text-red-500" // falseのときホバーで赤色
                        } cursor-pointer hover:underline`}
                    >
                        EN
                    </button>
                </div>
                <Link
                    href="https://www.instagram.com/tomomon1227"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <button
                        className="dark:text-white  h-10 w-10 flex justify-center rounded-xl transition-opacity hover:opacity-70 items-center"
                        type="button"
                    >
                        <svg
                            className="dark:stroke-white dark:fill-white"
                            width="35"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            data-name="Layer 1"
                        >
                            <title>instagram icon</title>
                            <path d="M17.34,5.46h0a1.2,1.2,0,1,0,1.2,1.2A1.2,1.2,0,0,0,17.34,5.46Zm4.6,2.42a7.59,7.59,0,0,0-.46-2.43,4.94,4.94,0,0,0-1.16-1.77,4.7,4.7,0,0,0-1.77-1.15,7.3,7.3,0,0,0-2.43-.47C15.06,2,14.72,2,12,2s-3.06,0-4.12.06a7.3,7.3,0,0,0-2.43.47A4.78,4.78,0,0,0,3.68,3.68,4.7,4.7,0,0,0,2.53,5.45a7.3,7.3,0,0,0-.47,2.43C2,8.94,2,9.28,2,12s0,3.06.06,4.12a7.3,7.3,0,0,0,.47,2.43,4.7,4.7,0,0,0,1.15,1.77,4.78,4.78,0,0,0,1.77,1.15,7.3,7.3,0,0,0,2.43.47C8.94,22,9.28,22,12,22s3.06,0,4.12-.06a7.3,7.3,0,0,0,2.43-.47,4.7,4.7,0,0,0,1.77-1.15,4.85,4.85,0,0,0,1.16-1.77,7.59,7.59,0,0,0,.46-2.43c0-1.06.06-1.4.06-4.12S22,8.94,21.94,7.88ZM20.14,16a5.61,5.61,0,0,1-.34,1.86,3.06,3.06,0,0,1-.75,1.15,3.19,3.19,0,0,1-1.15.75,5.61,5.61,0,0,1-1.86.34c-1,.05-1.37.06-4,.06s-3,0-4-.06A5.73,5.73,0,0,1,6.1,19.8,3.27,3.27,0,0,1,5,19.05a3,3,0,0,1-.74-1.15A5.54,5.54,0,0,1,3.86,16c0-1-.06-1.37-.06-4s0-3,.06-4A5.54,5.54,0,0,1,4.21,6.1,3,3,0,0,1,5,5,3.14,3.14,0,0,1,6.1,4.2,5.73,5.73,0,0,1,8,3.86c1,0,1.37-.06,4-.06s3,0,4,.06a5.61,5.61,0,0,1,1.86.34A3.06,3.06,0,0,1,19.05,5,3.06,3.06,0,0,1,19.8,6.1,5.61,5.61,0,0,1,20.14,8c.05,1,.06,1.37.06,4S20.19,15,20.14,16ZM12,6.87A5.13,5.13,0,1,0,17.14,12,5.12,5.12,0,0,0,12,6.87Zm0,8.46A3.33,3.33,0,1,1,15.33,12,3.33,3.33,0,0,1,12,15.33Z" />
                        </svg>
                    </button>
                </Link>
            </div>
        </header>
    );
}
