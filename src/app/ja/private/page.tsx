import Image from "next/image";
import Link from "next/link";
import { rgbDataURL } from "@/lib/blurImage";
import { getFilteredPosts } from "@/lib/galleryFilter";

export default async function Page() {
  const foo = process.env.NEXT_PUBLIC_FOO;
  const hoge = process.env.NEXT_PUBLIC_HOGE;
  const fuga = process.env.FUGA;

  return (
    <section className="cards-container">
      <h2>{foo}</h2>
      <h2>{hoge}</h2>
      <h2>{fuga}</h2>
    </section>
  );
}
