import { Octokit } from "@octokit/rest";
import type { Schedule } from "./types";

export type PublishResult = {
  commitSha: string;
  commitUrl: string;
  contentUrl: string;
};

function env(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var ${key}`);
  return v;
}

export async function publishScheduleToGitHub(
  schedule: Schedule
): Promise<PublishResult> {
  const token = env("GITHUB_TOKEN");
  const repo = env("GITHUB_REPO");           // "owner/name"
  const branch = process.env.GITHUB_BRANCH || "main";
  const filePath = process.env.GITHUB_DATA_PATH || "webapp/data/schedule.json";

  const [owner, name] = repo.split("/");
  if (!owner || !name) {
    throw new Error(`GITHUB_REPO must be "owner/name", got "${repo}"`);
  }

  const octokit = new Octokit({ auth: token });

  let sha: string | undefined;
  try {
    const existing = await octokit.repos.getContent({
      owner,
      repo: name,
      path: filePath,
      ref: branch,
    });
    if (!Array.isArray(existing.data) && "sha" in existing.data) {
      sha = existing.data.sha;
    }
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status !== 404) throw err;
  }

  const content = JSON.stringify(schedule, null, 2) + "\n";
  const commitMessage = `chore(schedule): publish ${schedule.generatedAt ?? "schedule"}`;

  const res = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo: name,
    path: filePath,
    branch,
    message: commitMessage,
    content: Buffer.from(content, "utf-8").toString("base64"),
    sha,
  });

  const commitSha = res.data.commit.sha ?? "";
  return {
    commitSha,
    commitUrl: res.data.commit.html_url ?? `https://github.com/${repo}/commit/${commitSha}`,
    contentUrl: res.data.content?.html_url ?? `https://github.com/${repo}/blob/${branch}/${filePath}`,
  };
}
