/* Reads and writes the website's files in your GitHub repository.
   Settings (Netlify environment variables): GITHUB_TOKEN, GITHUB_REPO ("username/spotlight-website"), GITHUB_BRANCH (default "main"). */
function cfg() {
  const token = process.env.GITHUB_TOKEN, repo = process.env.GITHUB_REPO, branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) { const e = new Error("GitHub is not set up"); e.config = true; throw e; }
  return { token, repo, branch };
}
async function gh(path, opt) {
  const { token } = cfg();
  const r = await fetch("https://api.github.com" + path, {
    ...opt,
    headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "spotlight-admin", "Content-Type": "application/json", ...((opt && opt.headers) || {}) },
  });
  if (!r.ok) { const e = new Error("GitHub " + r.status); e.status = r.status; e.detail = (await r.text()).slice(0, 300); throw e; }
  return r;
}
async function readFile(path) {
  const { repo, branch } = cfg();
  const r = await gh(`/repos/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`, { headers: { Accept: "application/vnd.github.raw+json" } });
  return r.text();
}
/* Saves several files in ONE commit, so the site is only rebuilt (and only costs one deploy) once. files: [{path, content: Buffer}] */
async function commitFiles(files, message) {
  const { repo, branch } = cfg();
  const ref = await (await gh(`/repos/${repo}/git/ref/heads/${branch}`)).json();
  const parent = ref.object.sha;
  const parentCommit = await (await gh(`/repos/${repo}/git/commits/${parent}`)).json();
  const entries = [];
  for (const f of files) {
    const blob = await (await gh(`/repos/${repo}/git/blobs`, { method: "POST", body: JSON.stringify({ content: f.content.toString("base64"), encoding: "base64" }) })).json();
    entries.push({ path: f.path, mode: "100644", type: "blob", sha: blob.sha });
  }
  const tree = await (await gh(`/repos/${repo}/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: parentCommit.tree.sha, tree: entries }) })).json();
  const commit = await (await gh(`/repos/${repo}/git/commits`, { method: "POST", body: JSON.stringify({ message, tree: tree.sha, parents: [parent] }) })).json();
  await gh(`/repos/${repo}/git/refs/heads/${branch}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }) });
  return commit.sha;
}
module.exports = { readFile, commitFiles };
