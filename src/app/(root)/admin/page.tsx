"use client";

import { evaluate } from "@mdx-js/mdx";
import * as exifr from "exifr";
import Image from "next/image";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";

type Locale = "ja" | "en";

type ContentType = "gallery" | "post" | "itinerary";

type ListItem = {
  name: string;
  path: string;
  type: "file" | "dir";
};

type Frontmatter = {
  title: string;
  country?: string;
  category?: string;
  date: string;
  description: string;
  tags: string[];
  ogpImage?: string;
  galleryImage?: string;
};

type FilePayload = {
  content: string;
  sha?: string;
};

const CLOUD_FRONT_BASE =
  process.env.NEXT_PUBLIC_CLOUDFRONT_BASE_URL ??
  "https://d9h1q21gc2t6n.cloudfront.net";

const DEFAULT_FRONTMATTER: Frontmatter = {
  title: "",
  country: "",
  category: "photography",
  date: new Date().toISOString(),
  description: "",
  tags: [],
  ogpImage: "",
  galleryImage: "",
};

const copy = {
  title: "管理ダッシュボード",
  loginTitle: "管理パスコードを入力",
  loginButton: "ログイン",
  contentTab: "コンテンツ",
  uploadTab: "S3アップロード",
  githubTab: "プルリク",
  locale: "投稿言語",
  contentType: "コンテンツ種別",
  gallery: "ギャラリー",
  post: "投稿",
  itinerary: "旅程",
  year: "年フォルダ",
  file: "ファイル",
  newFile: "新規",
  slug: "スラッグ",
  load: "読み込み",
  save: "PR作成",
  preview: "プレビュー",
  titleLabel: "タイトル",
  countryLabel: "国",
  categoryLabel: "カテゴリ",
  dateLabel: "日付",
  descLabel: "説明",
  tagsLabel: "タグ (カンマ区切り)",
  ogpLabel: "OGP画像URL",
  galleryLabel: "ギャラリー画像URL",
  bodyLabel: "本文 (MDX)",
  jsonLabel: "JSON",
  uploadLabel: "S3にアップロード",
  uploadHint: "複数画像を撮影日順にアップロードしてMDXに挿入",
  uploadButton: "アップロード",
  uploadUrlsLabel: "アップロード済みURL",
  copyUrlsButton: "URLをコピー",
  copyUrlsSuccess: "コピーしました。",
  insertButton: "挿入",
  branchLabel: "ブランチ(任意)",
  baseLabel: "ベースブランチ",
  prTitleLabel: "PRタイトル",
  prBodyLabel: "PR本文",
  logout: "ログアウト",
};

const fetchJson = async <T,>(input: RequestInfo, init?: RequestInit) => {
  const response = await fetch(input, init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }
  return (await response.json()) as T;
};

const splitFrontmatter = (content: string) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { meta: DEFAULT_FRONTMATTER, body: content };

  const metaBlock = match[1];
  const body = content.slice(match[0].length);
  const metaLines = metaBlock.split("\n");
  const meta: Frontmatter = { ...DEFAULT_FRONTMATTER, tags: [] };
  let inTags = false;

  for (const line of metaLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("tags:")) {
      inTags = true;
      continue;
    }
    if (inTags) {
      if (trimmed.startsWith("- ")) {
        meta.tags.push(trimmed.slice(2).trim());
        continue;
      }
      inTags = false;
    }

    const [rawKey, ...rest] = trimmed.split(":");
    const key = rawKey.trim();
    const value = rest.join(":").trim().replace(/^"|"$/g, "");
    if (key === "title") meta.title = value;
    if (key === "country") meta.country = value;
    if (key === "category") meta.category = value;
    if (key === "date") meta.date = value;
    if (key === "description") meta.description = value;
    if (key === "ogpImage") meta.ogpImage = value;
    if (key === "galleryImage") meta.galleryImage = value;
  }

  return { meta, body };
};

const parseTagsInput = (value: string) => {
  return value
    .split(/[\n,、，]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const quote = (value: string) => {
  return JSON.stringify(value ?? "");
};

const buildFrontmatter = (meta: Frontmatter, type: ContentType) => {
  const lines = ["---", `title: ${quote(meta.title)}`];

  if (type === "gallery") {
    lines.push(`country: ${quote(meta.country ?? "")}`);
    lines.push(`category: ${quote(meta.category ?? "photography")}`);
  }

  lines.push(`date: ${quote(meta.date)}`);
  lines.push(`description: ${quote(meta.description)}`);

  const tags = meta.tags.filter(Boolean);
  if (tags.length > 0) {
    lines.push("tags:");
    for (const tag of tags) {
      lines.push(`  - ${tag}`);
    }
  } else {
    lines.push("tags: []");
  }

  if (type === "gallery") {
    if (meta.ogpImage) lines.push(`ogpImage: ${quote(meta.ogpImage)}`);
    if (meta.galleryImage)
      lines.push(`galleryImage: ${quote(meta.galleryImage)}`);
  }

  lines.push("---", "");
  return lines.join("\n");
};

const buildPath = (
  type: ContentType,
  locale: Locale,
  year: string,
  slug: string,
) => {
  if (type === "gallery") {
    return `src/_galleries/${locale}/${year}/${slug}.mdx`;
  }
  if (type === "post") {
    return `src/_posts/${locale}/${year}/${slug}.mdx`;
  }
  return "src/_itineraries/plan.json";
};

export default function AdminPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [contentLocale, setContentLocale] = useState<Locale>("ja");
  const [type, setType] = useState<ContentType>("gallery");
  const [yearFolders, setYearFolders] = useState<ListItem[]>([]);
  const [yearFolder, setYearFolder] = useState("(2026)");
  const [files, setFiles] = useState<ListItem[]>([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [frontmatter, setFrontmatter] =
    useState<Frontmatter>(DEFAULT_FRONTMATTER);
  const [tagsDraft, setTagsDraft] = useState(
    DEFAULT_FRONTMATTER.tags.join(", "),
  );
  const [body, setBody] = useState("");
  const [jsonBody, setJsonBody] = useState("");
  const [fileSha, setFileSha] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState("");
  const [activeTab, setActiveTab] = useState<"content" | "upload" | "github">(
    "content",
  );
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadKey, setUploadKey] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadUrls, setUploadUrls] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [prTitle, setPrTitle] = useState("");
  const [prBody, setPrBody] = useState("");
  const [branchName, setBranchName] = useState("");
  const [baseBranch, setBaseBranch] = useState("main");
  const [prUrl, setPrUrl] = useState("");
  const tagsInputRef = useRef<HTMLInputElement>(null);

  const t = copy;

  useEffect(() => {
    const init = async () => {
      try {
        const data = await fetchJson<{ ok: boolean }>("/api/admin/session");
        setIsAuthed(data.ok);
      } catch {
        setIsAuthed(false);
      } finally {
        setAuthChecked(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!isAuthed) return;
    if (type === "itinerary") return;
    const loadYears = async () => {
      try {
        const data = await fetchJson<{ items: ListItem[] }>(
          `/api/admin/github/list?path=${encodeURIComponent(
            `src/_${type === "gallery" ? "galleries" : "posts"}/${contentLocale}`,
          )}`,
        );
        const dirs = data.items.filter((item) => item.type === "dir");
        setYearFolders(dirs);
        if (dirs.length > 0) {
          setYearFolder((prev) => {
            if (prev && dirs.some((dir) => dir.name === prev)) {
              return prev;
            }
            return dirs[0].name;
          });
        }
      } catch (error) {
        setStatus(String(error));
      }
    };
    loadYears();
  }, [isAuthed, contentLocale, type]);

  useEffect(() => {
    if (!isAuthed) return;
    if (type === "itinerary") return;
    if (!yearFolder) return;
    const loadFiles = async () => {
      try {
        const data = await fetchJson<{ items: ListItem[] }>(
          `/api/admin/github/list?path=${encodeURIComponent(
            `src/_${type === "gallery" ? "galleries" : "posts"}/${contentLocale}/${yearFolder}`,
          )}`,
        );
        const mdxFiles = data.items.filter((item) => item.type === "file");
        setFiles(mdxFiles);
        setSelectedFile("");
        setFileSha(undefined);
      } catch (error) {
        setStatus(String(error));
      }
    };
    loadFiles();
  }, [isAuthed, contentLocale, type, yearFolder]);

  useEffect(() => {
    if (type === "itinerary" && isAuthed) {
      const loadJson = async () => {
        try {
          const data = await fetchJson<FilePayload>(
            "/api/admin/github/file?path=src/_itineraries/plan.json",
          );
          setJsonBody(data.content);
          setFileSha(data.sha);
        } catch (error) {
          setStatus(String(error));
        }
      };
      loadJson();
    }
  }, [type, isAuthed]);

  const mdxPreviewComponents = useMemo(
    () => ({
      BlogImage: (props: { src?: string; alt?: string }) => (
        <figure className="admin-preview-image">
          {props.src ? (
            <Image
              src={props.src}
              alt={props.alt ?? ""}
              width={1200}
              height={800}
              unoptimized
            />
          ) : (
            <div className="admin-preview-empty">Missing image src</div>
          )}
        </figure>
      ),
      BlogLink: (props: {
        href?: string;
        openNewTab?: boolean;
        children?: ReactNode;
      }) => (
        <a
          href={props.href ?? "#"}
          target={props.openNewTab ? "_blank" : undefined}
          rel={props.openNewTab ? "noreferrer" : undefined}
        >
          {props.children}
        </a>
      ),
      BlogCard: (props: { url?: string }) => (
        <div className="admin-preview-card">
          <div className="admin-preview-card-title">BlogCard</div>
          <div className="admin-preview-card-url">{props.url ?? ""}</div>
        </div>
      ),
      Accordion: (props: { title?: string; children?: ReactNode }) => (
        <details className="admin-preview-accordion">
          <summary>{props.title ?? "Accordion"}</summary>
          <div>{props.children}</div>
        </details>
      ),
      Note: (props: { title?: string; children?: ReactNode }) => (
        <div className="admin-preview-note">
          {props.title && <strong>{props.title}</strong>}
          <div>{props.children}</div>
        </div>
      ),
    }),
    [],
  );

  const [previewComponent, setPreviewComponent] =
    useState<ComponentType | null>(null);
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    if (type === "itinerary") return;
    let cancelled = false;
    const renderPreview = async () => {
      if (!body.trim()) {
        setPreviewComponent(null);
        setPreviewError("");
        return;
      }
      try {
        const result = await evaluate(body, {
          ...runtime,
          useMDXComponents: () => mdxPreviewComponents,
          remarkPlugins: [remarkGfm],
        });
        if (!cancelled) {
          setPreviewComponent(() => result.default);
          setPreviewError("");
        }
      } catch (error) {
        if (!cancelled) {
          setPreviewComponent(null);
          setPreviewError(String(error));
        }
      }
    };
    renderPreview();
    return () => {
      cancelled = true;
    };
  }, [body, mdxPreviewComponents, type]);

  const insertSnippet = (snippet: string) => {
    setBody((prev) => `${prev}\n${snippet}\n`);
  };

  const mdxSnippets = [
    {
      label: "BlogImage",
      value: '<BlogImage src="https://example.com/image.jpg" />',
    },
    {
      label: "H2",
      value: "## Heading",
    },
    {
      label: "H3",
      value: "### Heading",
    },
    {
      label: "H4",
      value: "#### Heading",
    },
    {
      label: "Bold",
      value: "**bold**",
    },
    {
      label: "Italic",
      value: "*italic*",
    },
    {
      label: "Link",
      value: "[text](https://example.com)",
    },
    {
      label: "List",
      value: "- Item 1\n- Item 2\n- Item 3",
    },
    {
      label: "Numbered",
      value: "1. First\n2. Second\n3. Third",
    },
    {
      label: "Table",
      value: "| Head | Head |\n| --- | --- |\n| Cell | Cell |",
    },
    {
      label: "Inline math",
      value: "$E=mc^2$",
    },
    {
      label: "Accordion",
      value: '<Accordion title="Title">\n  Content here\n</Accordion>',
    },
    {
      label: "BlogCard",
      value: '<BlogCard url="https://example.com" />',
    },
    {
      label: "BlogLink",
      value:
        '<BlogLink href="https://example.com" openNewTab={true}>Link text</BlogLink>',
    },
    {
      label: "Note",
      value: '<Note title="Note">\n  Message here\n</Note>',
    },
    {
      label: "Inline code",
      value: "`code`",
    },
    {
      label: "Code block",
      value: "```ts\nconsole.log('hello');\n```",
    },
  ];

  const handleLogin = async () => {
    setStatus("");
    try {
      await fetchJson("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      setIsAuthed(true);
      setPassword("");
    } catch (error) {
      setStatus(String(error));
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAuthed(false);
  };

  const handleLoadFile = async () => {
    if (!selectedFile) return;
    setStatus("");
    try {
      const data = await fetchJson<FilePayload>(
        `/api/admin/github/file?path=${encodeURIComponent(selectedFile)}`,
      );
      const parsed = splitFrontmatter(data.content);
      setFrontmatter(parsed.meta);
      setTagsDraft(parsed.meta.tags.join(", "));
      setBody(parsed.body);
      setFileSha(data.sha);
      setNewSlug("");
    } catch (error) {
      setStatus(String(error));
    }
  };

  const updateTagsFromInput = (value: string) => {
    setTagsDraft(value);
    setFrontmatter((prev) => ({
      ...prev,
      tags: parseTagsInput(value),
    }));
  };

  const handleCreatePr = async () => {
    setStatus("");
    setPrUrl("");
    try {
      if (type !== "itinerary" && !selectedFile && !newSlug) {
        setStatus("新規作成時はスラッグが必要です。");
        return;
      }

      const path = selectedFile
        ? selectedFile
        : buildPath(type, contentLocale, yearFolder, newSlug);
      const content =
        type === "itinerary"
          ? jsonBody
          : `${buildFrontmatter(frontmatter, type)}${body}`;
      const files = [
        {
          path: type === "itinerary" ? "src/_itineraries/plan.json" : path,
          content,
          sha: selectedFile ? fileSha : undefined,
        },
      ];
      const data = await fetchJson<{ prUrl: string }>("/api/admin/github/pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: prTitle || `Admin update: ${newSlug || "content"}`,
          body: prBody,
          branchName: branchName || undefined,
          baseBranch,
          files,
        }),
      });
      setPrUrl(data.prUrl);
      setStatus("PRを作成しました。");
    } catch (error) {
      setStatus(String(error));
    }
  };

  const ensureTrailingSlash = (value: string) =>
    value.endsWith("/") ? value : `${value}/`;

  const getShotTimestamp = async (file: File) => {
    try {
      const exif = await exifr.parse(file, {
        pick: ["DateTimeOriginal", "CreateDate", "ModifyDate", "DateTime"],
      });
      const dateValue =
        exif?.DateTimeOriginal ||
        exif?.CreateDate ||
        exif?.ModifyDate ||
        exif?.DateTime;
      if (dateValue instanceof Date) {
        return dateValue.getTime();
      }
    } catch {
      // Fall back to lastModified when EXIF parsing fails.
    }
    return file.lastModified;
  };

  const getFileExtension = (file: File) => {
    const lower = file.name.toLowerCase();
    if (lower.endsWith(".png")) return "png";
    if (lower.endsWith(".heic")) return "heic";
    if (lower.endsWith(".heif")) return "heif";
    if (lower.endsWith(".jpeg")) return "jpg";
    if (lower.endsWith(".jpg")) return "jpg";
    return "jpg";
  };

  const getContentType = (file: File, extension: string) => {
    if (file.type) return file.type;
    if (extension === "png") return "image/png";
    if (extension === "heic") return "image/heic";
    if (extension === "heif") return "image/heif";
    return "image/jpeg";
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0 || !uploadKey) return;
    setUploadStatus("");
    setCopyStatus("");
    try {
      const basePath = ensureTrailingSlash(uploadKey);
      const withTimes = await Promise.all(
        uploadFiles.map(async (file) => ({
          file,
          time: await getShotTimestamp(file),
        })),
      );
      const sorted = withTimes.sort(
        (a, b) => a.time - b.time || a.file.name.localeCompare(b.file.name),
      );

      const urls: string[] = [];
      const snippets: string[] = [];

      for (let index = 0; index < sorted.length; index += 1) {
        const { file } = sorted[index];
        const extension = getFileExtension(file);
        const contentType = getContentType(file, extension);
        const key = `${basePath}img${index + 1}.${extension}`;
        setUploadStatus(
          `Uploading ${index + 1}/${sorted.length}: ${file.name}`,
        );

        const presign = await fetchJson<{ uploadUrl: string }>(
          "/api/admin/s3/presign",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              key,
              contentType,
            }),
          },
        );

        const uploadResponse = await fetch(presign.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": contentType },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error("Upload failed");
        }

        const url = `${CLOUD_FRONT_BASE}/${key}`;
        urls.push(url);
        snippets.push(`<BlogImage src="${url}" />`);
      }

      const joinedUrls = urls.join("\n");
      setBody((prev) => `${prev}\n${snippets.join("\n")}\n`);
      setUploadUrls(joinedUrls);
      setUploadStatus(joinedUrls);
    } catch (error) {
      setUploadStatus(String(error));
    }
  };

  const handleCopyUploadUrls = async () => {
    if (!uploadUrls) return;
    setCopyStatus("");
    try {
      await navigator.clipboard.writeText(uploadUrls);
      setCopyStatus(t.copyUrlsSuccess);
    } catch (error) {
      setCopyStatus(String(error));
    }
  };

  if (!authChecked) {
    return <div className="admin-shell" />;
  }

  if (!isAuthed) {
    return (
      <div className="admin-shell">
        <div className="admin-card admin-login">
          <div className="admin-card-header">
            <h1>{t.loginTitle}</h1>
          </div>
          <div className="admin-form">
            <input
              type="password"
              placeholder="Passcode"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button type="button" onClick={handleLogin}>
              {t.loginButton}
            </button>
            {status && <p className="admin-status">{status}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <h1>{t.title}</h1>
          <p>GitHub PR + S3 uploader</p>
        </div>
        <div className="admin-header-actions">
          <button type="button" onClick={handleLogout}>
            {t.logout}
          </button>
        </div>
      </header>

      <div className="admin-tabs">
        <button
          type="button"
          className={activeTab === "content" ? "active" : ""}
          onClick={() => setActiveTab("content")}
        >
          {t.contentTab}
        </button>
        <button
          type="button"
          className={activeTab === "upload" ? "active" : ""}
          onClick={() => setActiveTab("upload")}
        >
          {t.uploadTab}
        </button>
        <button
          type="button"
          className={activeTab === "github" ? "active" : ""}
          onClick={() => setActiveTab("github")}
        >
          {t.githubTab}
        </button>
      </div>

      <section className="admin-grid">
        {activeTab === "content" && (
          <>
            <div className="admin-card">
              <div className="admin-card-header">
                <h2>{t.contentTab}</h2>
              </div>
              <div className="admin-form">
                <label>
                  <span>{t.contentType}</span>
                  <select
                    value={type}
                    onChange={(event) =>
                      setType(event.target.value as ContentType)
                    }
                  >
                    <option value="gallery">{t.gallery}</option>
                    <option value="post">{t.post}</option>
                    <option value="itinerary">{t.itinerary}</option>
                  </select>
                </label>

                {type !== "itinerary" && (
                  <>
                    <label>
                      <span>{t.locale}</span>
                      <select
                        value={contentLocale}
                        onChange={(event) =>
                          setContentLocale(event.target.value as Locale)
                        }
                      >
                        <option value="ja">ja</option>
                        <option value="en">en</option>
                      </select>
                    </label>
                    <label>
                      <span>{t.year}</span>
                      <select
                        value={yearFolder}
                        onChange={(event) => {
                          setYearFolder(event.target.value);
                          setSelectedFile("");
                          setFileSha(undefined);
                        }}
                      >
                        {!yearFolder && (
                          <option value="">選択してください</option>
                        )}
                        {yearFolders.map((item) => (
                          <option key={item.path} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>{t.file}</span>
                      <select
                        value={selectedFile}
                        onChange={(event) => {
                          setSelectedFile(event.target.value);
                          setNewSlug("");
                          setFileSha(undefined);
                        }}
                      >
                        <option value="">{t.newFile}</option>
                        {files.map((item) => (
                          <option key={item.path} value={item.path}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>{t.slug}</span>
                      <input
                        type="text"
                        value={newSlug}
                        onChange={(event) => setNewSlug(event.target.value)}
                        placeholder="new-slug"
                      />
                    </label>

                    <button type="button" onClick={handleLoadFile}>
                      {t.load}
                    </button>
                  </>
                )}

                {type === "itinerary" && (
                  <label>
                    <span>{t.jsonLabel}</span>
                    <textarea
                      rows={12}
                      value={jsonBody}
                      onChange={(event) => setJsonBody(event.target.value)}
                    />
                  </label>
                )}

                {status && <p className="admin-status">{status}</p>}
              </div>
            </div>

            {type !== "itinerary" && (
              <div className="admin-card">
                <div className="admin-card-header">
                  <h2>{t.preview}</h2>
                </div>
                <div className="admin-form">
                  <label>
                    <span>{t.titleLabel}</span>
                    <input
                      type="text"
                      value={frontmatter.title}
                      onChange={(event) =>
                        setFrontmatter((prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }
                    />
                  </label>

                  {type === "gallery" && (
                    <label>
                      <span>{t.countryLabel}</span>
                      <input
                        type="text"
                        value={frontmatter.country ?? ""}
                        onChange={(event) =>
                          setFrontmatter((prev) => ({
                            ...prev,
                            country: event.target.value,
                          }))
                        }
                      />
                    </label>
                  )}

                  {type === "gallery" && (
                    <label>
                      <span>{t.categoryLabel}</span>
                      <select
                        value={frontmatter.category ?? "photography"}
                        onChange={(event) =>
                          setFrontmatter((prev) => ({
                            ...prev,
                            category: event.target.value,
                          }))
                        }
                      >
                        <option value="photography">photography</option>
                        <option value="travel">travel</option>
                      </select>
                    </label>
                  )}

                  <label>
                    <span>{t.dateLabel}</span>
                    <input
                      type="text"
                      value={frontmatter.date}
                      onChange={(event) =>
                        setFrontmatter((prev) => ({
                          ...prev,
                          date: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    <span>{t.descLabel}</span>
                    <input
                      type="text"
                      value={frontmatter.description}
                      onChange={(event) =>
                        setFrontmatter((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    <span>{t.tagsLabel}</span>
                    <div className="admin-tag-row">
                      <input
                        ref={tagsInputRef}
                        type="text"
                        value={tagsDraft}
                        onChange={(event) =>
                          updateTagsFromInput(event.target.value)
                        }
                        placeholder="tag1, tag2"
                      />
                    </div>
                  </label>

                  {type === "gallery" && (
                    <label>
                      <span>{t.ogpLabel}</span>
                      <input
                        type="text"
                        value={frontmatter.ogpImage ?? ""}
                        onChange={(event) =>
                          setFrontmatter((prev) => ({
                            ...prev,
                            ogpImage: event.target.value,
                          }))
                        }
                      />
                    </label>
                  )}

                  {type === "gallery" && (
                    <label>
                      <span>{t.galleryLabel}</span>
                      <input
                        type="text"
                        value={frontmatter.galleryImage ?? ""}
                        onChange={(event) =>
                          setFrontmatter((prev) => ({
                            ...prev,
                            galleryImage: event.target.value,
                          }))
                        }
                      />
                    </label>
                  )}

                  <label>
                    <span>{t.bodyLabel}</span>
                    <div className="admin-toolbar">
                      {mdxSnippets.map((snippet) => (
                        <button
                          key={snippet.label}
                          type="button"
                          onClick={() => insertSnippet(snippet.value)}
                        >
                          {snippet.label}
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={16}
                      value={body}
                      onChange={(event) => setBody(event.target.value)}
                    />
                  </label>

                  <div className="admin-preview">
                    {previewError && (
                      <p className="admin-preview-error">{previewError}</p>
                    )}
                    {!previewError && previewComponent && (
                      <div className="admin-preview-content">
                        {(() => {
                          const Preview = previewComponent;
                          return <Preview />;
                        })()}
                      </div>
                    )}
                    {!previewError && !previewComponent && (
                      <p className="admin-preview-empty">Preview is empty.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "upload" && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h2>{t.uploadLabel}</h2>
            </div>
            <div className="admin-form">
              <p className="admin-hint">{t.uploadHint}</p>
              <label>
                <span>S3 Key</span>
                <input
                  type="text"
                  value={uploadKey}
                  onChange={(event) => setUploadKey(event.target.value)}
                  placeholder="2026/japan/"
                />
              </label>
              <label>
                <span>File</span>
                <input
                  type="file"
                  multiple
                  onChange={(event) =>
                    setUploadFiles(Array.from(event.target.files ?? []))
                  }
                />
              </label>
              <button type="button" onClick={handleUpload}>
                {t.uploadButton}
              </button>
              {uploadUrls && (
                <label>
                  <span>{t.uploadUrlsLabel}</span>
                  <textarea rows={6} value={uploadUrls} readOnly />
                </label>
              )}
              {uploadUrls && (
                <button type="button" onClick={handleCopyUploadUrls}>
                  {t.copyUrlsButton}
                </button>
              )}
              {copyStatus && <p className="admin-status">{copyStatus}</p>}
              {uploadStatus && <p className="admin-status">{uploadStatus}</p>}
            </div>
          </div>
        )}

        {activeTab === "github" && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h2>{t.githubTab}</h2>
            </div>
            <div className="admin-form">
              <label>
                <span>{t.prTitleLabel}</span>
                <input
                  type="text"
                  value={prTitle}
                  onChange={(event) => setPrTitle(event.target.value)}
                />
              </label>
              <label>
                <span>{t.prBodyLabel}</span>
                <textarea
                  rows={6}
                  value={prBody}
                  onChange={(event) => setPrBody(event.target.value)}
                />
              </label>
              <label>
                <span>{t.branchLabel}</span>
                <input
                  type="text"
                  value={branchName}
                  onChange={(event) => setBranchName(event.target.value)}
                  placeholder="admin/feature"
                />
              </label>
              <label>
                <span>{t.baseLabel}</span>
                <input
                  type="text"
                  value={baseBranch}
                  onChange={(event) => setBaseBranch(event.target.value)}
                />
              </label>
              <button type="button" onClick={handleCreatePr}>
                {t.save}
              </button>
              {prUrl && (
                <a
                  className="admin-link"
                  href={prUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {prUrl}
                </a>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
