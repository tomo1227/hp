import Image, { type ImageProps } from "next/image";

export const BlogImage = async (props: ImageProps) => {
  return (
    <figure className="full-width justify-center flex">
      <Image
        className="object-contain max-h-[500px] max-w-full h-auto w-auto"
        sizes="100vw"
        style={{ width: "100%", height: "auto" }}
        {...(props as ImageProps)}
      />
    </figure>
  );
};
