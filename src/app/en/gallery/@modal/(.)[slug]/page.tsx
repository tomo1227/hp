import { Modal } from "@/components/ui/modal";
import { getFilteredPosts, getPostBySlug } from "@/lib/galleryFilter";

export async function generateStaticParams() {
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "en",
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
  const Component = require(`@/_galleries/en/${slug}.mdx`).default;
  const { frontmatter } = await getPostBySlug(slug, "en");

  return (
    <Modal>
      <div id="gallery">
        <h1 id="gallery-title">{frontmatter.title}</h1>
        <article
          className="markdown flex flex-col justify-center items-center"
          style={{ position: "relative" }}
        >
          <Component />
        </article>
      </div>
    </Modal>
  );
}
