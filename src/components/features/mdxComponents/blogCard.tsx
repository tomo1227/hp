import Link from "next/link";

type Props = {
  url: string;
};

export const BlogCard = async (props: Props) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000/";
  try {
    const response = await fetch(`${baseUrl}/api/ogp/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: props.url }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch OGP data");
    }
    const ogp = await response.json();
    const host = new URL(props.url).host;
    return (
      <Link
        href={props.url}
        target="_blank"
        className={"ogp-link transition-opacity hover:opacity-65"}
        rel="noopener noreferrer"
      >
        <div
          className={
            "flex border dark:border-gray-600 rounded-lg  no-underline h-[136px] max-md:h-28 my-4"
          }
        >
          <div className="flex flex-col justify-between px-6 py-4 h-full w-full max-md:px-4">
            <span
              className={"font-bold text-ellipsis line-clamp-1 max-md:text-sm"}
            >
              {ogp.title}
            </span>
            <span
              className={
                "text-sm text-ellipsis line-clamp-2 text-gray-500 dark:text-gray-300 max-md:text-xs"
              }
            >
              {ogp.description}
            </span>
            <div className="flex gap-2 items-center">
              {ogp.favicon && (
                <img
                  className="!w-3"
                  src={ogp.favicon}
                  width={16}
                  height={16}
                  alt={`favicon of ${ogp.url}`}
                />
              )}
              <span className="text-xs">{host}</span>
            </div>
          </div>
          <div className="h-full">
            {ogp.image && (
              <img
                src={ogp.image}
                className={
                  "h-full !w-fit rounded-r-lg !max-w-[32vw] object-cover"
                }
                alt={`ogp of ${ogp.image}`}
              />
            )}
          </div>
        </div>
      </Link>
    );
  } catch (error) {
    console.error("Error:", error);
    return (
      <div>
        <p>Failed to load OGP data. Please try again.</p>
      </div>
    );
  }
};
