"use client";

import { useEffect, useState } from "react";

type BlogShareButtonsProps = {
  url: string;
  title: string;
  locale: "ja" | "en";
};

const buildLinks = (url: string, title: string) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(title);

  return [
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "Threads",
      href: `https://www.threads.net/intent/post?text=${encodedText}%20${encodedUrl}`,
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/tomomon1227",
    },
  ];
};

const BlogShareButtons = ({ url, title, locale }: BlogShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const shareLinks = buildLinks(url, title || "tomokiota.com");
  const copyLabel = locale === "ja" ? "リンクをコピー" : "Copy link";

  useEffect(() => {
    if (!copied) {
      return undefined;
    }
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    if (!navigator?.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
  };

  return (
    <div className="blog-share-links">
      {shareLinks.map((share) => (
        <a
          key={share.label}
          className="blog-share-link"
          href={share.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {share.label}
        </a>
      ))}
      <button
        type="button"
        className="blog-share-link"
        onClick={handleCopy}
        aria-live="polite"
      >
        {copied ? "Copied!" : copyLabel}
      </button>
    </div>
  );
};

export default BlogShareButtons;
