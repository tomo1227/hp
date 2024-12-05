import Image, { type ImageProps } from "next/image";

export const BlogImage = async (props: ImageProps) => {
  const {
    alt = props.alt || "",
    width = props.width || "500",
    height = props.height || "500",
    ...blogImageProps
  } = props;
  return (
    <figure className="full-width justify-center flex">
      <Image
        className="object-contain"
        style={{ width: "100%", height: "auto" }}
        alt=""
        width={width}
        height={height}
        {...blogImageProps}
      />
    </figure>
  );
};
