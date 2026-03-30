type GitHubConfig = {
  owner: string;
  repo: string;
  token: string;
  baseBranch: string;
};

export const getGitHubConfig = (): GitHubConfig => {
  const owner = process.env.GITHUB_OWNER ?? "tomo1227";
  const repo = process.env.GITHUB_REPO ?? "hp";
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN ?? "";
  const baseBranch = process.env.GITHUB_BASE_BRANCH ?? "main";

  if (!token) {
    throw new Error("NEXT_PUBLIC_GITHUB_TOKEN is required");
  }

  return { owner, repo, token, baseBranch };
};

export const githubRequest = async (
  path: string,
  options: RequestInit = {},
) => {
  const { token } = getGitHubConfig();
  return fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  });
};
