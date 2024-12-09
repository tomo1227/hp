import Image, { type ImageProps } from "next/image";

export const BlogImage = async (props: ImageProps) => {
  const {
    alt = props.alt || "",
    width = props.width || "400",
    height = props.height || "400",
    ...blogImageProps
  } = props;
  return (
    <figure className="full-width justify-center flex">
      <Image
        className="object-contain w-full h-auto p-3"
        alt=""
        width={width}
        height={height}
        {...blogImageProps}
      />
    </figure>
  );
};
