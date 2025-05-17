import Link, { type LinkProps } from "next/link";

interface BlogLinkProps extends LinkProps {
  openNewTab?: boolean;
  children: React.ReactNode;
}

export const BlogLink: React.FC<BlogLinkProps> = ({
  openNewTab = false,
  children,
  ...props
}) => {
  return (
    <Link
      {...props}
      className="text-blue-500 dark:text-blue-400 hover:underline mx-1 transition-colors duration-300 hover:text-blue-700 dark:hover:text-blue-300"
      target={openNewTab ? "_blank" : undefined}
      rel={openNewTab ? "noopener noreferrer" : undefined}
    >
      {children}
    </Link>
  );
};
