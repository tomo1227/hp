import { Modal } from "@/components/ui/modal";
import { getFilteredPosts } from "@/lib/blogFilter";

export async function generateStaticParams() {
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "en",
    category: "photography",
    articleType: "gallery",
  });
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
  const Component = require(`@/_posts/en/${slug}.mdx`).default;
  return (
    <Modal>
      <article
        className="markdown flex flex-col justify-center items-center"
        style={{ position: "relative" }}
      >
        <Component />
      </article>
    </Modal>
  );
}
