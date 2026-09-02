"use client";

import { isValidElement, type ReactNode, useEffect, useState } from "react";
import { codeToHtml } from "shiki";

function collectCode(children: ReactNode): {
  className?: string;
  code: string;
} {
  let className: string | undefined;
  let code = "";

  const walk = (node: ReactNode) => {
    if (typeof node === "string") {
      code += node;
    } else if (typeof node === "number") {
      code += String(node);
    } else if (Array.isArray(node)) {
      node.forEach(walk);
    } else if (
      isValidElement<{ className?: string; children?: ReactNode }>(node)
    ) {
      if (node.type === "code") {
        className = node.props.className || className;
      }
      walk(node.props.children);
    }
  };

  walk(children);
  return { className, code: code.trimEnd() };
}

function extractLanguage(className?: string): string {
  if (!className) return "text";
  const match = /language-(\w+)/.exec(className);
  return match ? match[1] : "text";
}

type PreProps = {
  children: ReactNode;
};

export function Pre({ children }: PreProps) {
  const { className, code } = collectCode(children);
  const lang = extractLanguage(className);
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    void codeToHtml(code, {
      lang,
      theme: "one-dark-pro",
    }).then((result) => {
      if (mounted) setHtml(result);
    });
    return () => {
      mounted = false;
    };
  }, [code, lang]);

  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki sanitized HTML output
    <div className="code-block" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
