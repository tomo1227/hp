import { Rock_Salt } from "next/font/google";

const rockSaltFont = Rock_Salt({
    weight: "400",
    subsets: ["latin"],
});

export default function Page() {
    return (
        <div
            className={`${rockSaltFont.className} flex flex-row justify-center items-center`}
        >
            <h1>作成中</h1>
        </div>
    );
}
