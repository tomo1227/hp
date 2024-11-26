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
                            src="https://tomokiota-photos.s3.ap-northeast-1.amazonaws.com/travel/083A0852.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAUQ76IQFFJJCHW7LY%2F20241126%2Fap-northeast-1%2Fs3%2Faws4_request&X-Amz-Date=20241126T045136Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEH0aDmFwLW5vcnRoZWFzdC0xIkcwRQIgVVFdakox73LLHPF74Peso1%2FqCl5UTZ%2FbBSyGG%2BeIKs0CIQDxQR5QghvbK8BaKp6ah45crZ%2BE4Tvd1lUvOXz6kLcn0CqKAwgmEAMaDDMxMTM4MTQ5MjA0MiIMJfnbW1LYo4%2BblaHBKucCH56RwlAdg%2FrlRCBbBMXhmb5QrHHk%2BZrX%2BvBfUOxwFFc%2Fx%2BZx3v9MlnKrKywRtq1SszStYxCpevdyFVDhfsi1CCeYdPKOHh6d2nAw2UrZzyH4dGR29T4sE7EyUzC%2Bp9gI2pie8r5BrarcfNe51HtLMuDj4V7U9VoJQVPmAn2JpTodSqjlZEJCNgBGN0Zva6h%2BaqBRaz9n0vzryEURKn8faDZDSdG3n3bWIXn1RDHuOttZE7NyWbgMnh8xrwN5y%2BgNpgBbHrNoj12dqDXu%2Bl5QlgxbvPWeGNuW2GHjfWNGWlElBJBX2P92bX1TW6bSDedDyqlrPcvepV50NtYRI8X%2Fu9TarChFUQle%2F2Q4EhN6Tth55A%2F2jEGho7mYCEmeVhZ1wFkzAOTxVXOzb5FMoQKZ2E0iuKml1edbv0UNTPM2ewf0G2RzPTAYdXSj5C9J%2BktbBcWCkK4vZn5SnKuIp1PPBCi88BDgZMkwnoeUugY6swIDbrQbJ9Asqh6GrHOduZcPROOMjx1FHkPSycLAfpGjZa8pOPBayHo0u7k0aNDcA%2FAVvaMzNvaWGC8BqyWEOGkRvFINAxKJtJhDv4TWLJXcK4%2FKx3ZNLqSbqoVcoOyas07i3CKqCRAsA97PKVar0%2Fr8YfSzf4Xwx7jWNek4Xq%2F5fI5euuDzNU%2F500fBs4FnoJKQRz4p1pQNshY%2BwA9tkfCmAGhBAbIGMZwXuoOHTBiM5bwlpwGLRpBtUoEmPmX8pnaOwJmAj2WHH9kDjHvrc3G741aTo2EpNcbcsiqiYDM3h%2FUuciUFL%2BcnK5kP7RRBazEab8lIU2MTf7LtVqCJI6z7%2F8h31k50nT1V64YiBMxQRGNW23cL4%2Bk4hTtcPk4oI%2BzjpCeV9PsaAF227ILw41GyembI&X-Amz-Signature=9b848561d936e1f0eb90ec50cadfa3d0865c75714ebbb7bcd34564a7052e7a0b&X-Amz-SignedHeaders=host&response-content-disposition=inline"
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
