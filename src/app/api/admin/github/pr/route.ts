import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminApi";
import { getGitHubConfig, githubRequest } from "@/lib/githubAdmin";

export const runtime = "nodejs";

type FileUpdate = {
  path: string;
  content: string;
  sha?: string;
};

type CreatePrRequest = {
  title?: string;
  body?: string;
  branchName?: string;
  baseBranch?: string;
  commitMessage?: string;
  files: FileUpdate[];
};

const createBranch = async (baseBranch: string, branchName: string) => {
  const { owner, repo } = getGitHubConfig();

  const baseRef = await githubRequest(
    `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(baseBranch)}`,
  );

  if (!baseRef.ok) {
    throw new Error(await baseRef.text());
  }

  const baseData = (await baseRef.json()) as { object: { sha: string } };

  const createRef = await githubRequest(`/repos/${owner}/${repo}/git/refs`, {
    method: "POST",
    body: JSON.stringify({
      ref: `refs/heads/${branchName}`,
      sha: baseData.object.sha,
    }),
  });

  if (!createRef.ok) {
    const errorText = await createRef.text();
    if (!errorText.includes("Reference already exists")) {
      throw new Error(errorText);
    }
  }
};

const updateFile = async (
  branchName: string,
  commitMessage: string,
  file: FileUpdate,
) => {
  const { owner, repo } = getGitHubConfig();
  const encodedPath = file.path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const body = {
    message: commitMessage,
    content: Buffer.from(file.content, "utf8").toString("base64"),
    branch: branchName,
    sha: file.sha,
  } as Record<string, string | undefined>;

  if (!file.sha) {
    delete body.sha;
  }

  const response = await githubRequest(
    `/repos/${owner}/${repo}/contents/${encodedPath}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }
};

export async function POST(request: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as CreatePrRequest;
  const { baseBranch: payloadBaseBranch, files } = payload;

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "files are required" }, { status: 400 });
  }

  const { owner, repo, baseBranch } = getGitHubConfig();
  const targetBase = payloadBaseBranch ?? baseBranch;
  const branchName = payload.branchName ?? `admin/${Date.now().toString(36)}`;
  const commitMessage = payload.commitMessage ?? "Admin content update";

  try {
    await createBranch(targetBase, branchName);

    for (const file of files) {
      await updateFile(branchName, commitMessage, file);
    }

    const prResponse = await githubRequest(`/repos/${owner}/${repo}/pulls`, {
      method: "POST",
      body: JSON.stringify({
        title: payload.title ?? "Admin content update",
        body: payload.body ?? "",
        head: branchName,
        base: targetBase,
      }),
    });

    if (!prResponse.ok) {
      throw new Error(await prResponse.text());
    }

    const prData = (await prResponse.json()) as { html_url: string };

    return NextResponse.json({
      ok: true,
      branchName,
      prUrl: prData.html_url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create PR",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
