import { Modal } from "@/components/ui/modal";
import { getFilteredPosts, getPostBySlug } from "@/lib/galleryFilter";
import { Parser, jaModel } from "budoux";

export async function generateStaticParams() {
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "ja",
  });
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

const parser = new Parser(jaModel);

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const Component = require(`@/_galleries/ja/${slug}.mdx`).default;
  const { frontmatter } = await getPostBySlug(slug, "ja");
  const splittedTitle = parser.parse(frontmatter.title);
  return (
    <Modal>
      <div id="gallery">
        <h1 id="gallery-title">
          {splittedTitle.map((word) => (
            <span key={word}>{word}</span>
          ))}
        </h1>
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
