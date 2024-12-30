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
      target={openNewTab ? "_blank" : undefined}
      rel={openNewTab ? "noopener noreferrer" : undefined}
    >
      {children}
    </Link>
  );
};
