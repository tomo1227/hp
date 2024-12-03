import Link, { type LinkProps } from "next/link";

export const BlogLink: React.FC<
    LinkProps & { openNewTab?: boolean; children: React.ReactNode }
> = ({ openNewTab, children, ...props }) => {
    return (
        <Link
            {...props}
            target={openNewTab ? "_blank" : undefined}
            rel={openNewTab ? "noopener noreferrer" : undefined}
        >
            {children}
        </Link>
    );
};
