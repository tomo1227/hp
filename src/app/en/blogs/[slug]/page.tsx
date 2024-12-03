import Link from "next/link";
import { formattedDate } from "../../../../lib/date";
import { getFilteredPosts, getPostBySlug } from "../../../../lib/blogFilter";

export async function generateStaticParams() {
    const posts = await getFilteredPosts("desc", "en");
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const slug = (await params).slug;
    const post = await getPostBySlug(slug, "en");
    return (
        <article
            className="markdown flex flex-col justify-center items-center"
            style={{ position: "relative" }}
        >
            <h1>{post.data.title}</h1>
            <Link href={`/en/blogs/${slug}`}>
                {formattedDate(post.data.date)}
            </Link>
        </article>
    );
}
