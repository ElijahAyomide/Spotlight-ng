# SpotLight admin dashboard: setup and how to use it

The dashboard lives at **your-site-address/admin** (for example `https://spotlight-ng.netlify.app/admin`).
You log in with a password, then add or delete blog posts and gallery photos, and edit the contact details,
headline and partner schools, without opening the code.

## How it works (in plain words)
- You make changes in the dashboard. They stay as a **draft** until you press **Publish changes**.
- Publishing saves everything to your GitHub repository in **one go**. Netlify then updates the live site about **one minute** later.
- Every publish is kept in GitHub's history, so a mistake can always be undone.

**Cost note:** on Netlify's free plan each site update (each publish) uses 15 of your 300 free monthly credits,
so about 20 publishes a month fit, together with your visitors. That is why the dashboard collects all your edits
and publishes them together. Make several edits, then press Publish once. Check netlify.com/pricing for current limits.

---
## One-time setup (about 15 minutes)

### Step 1: Put the new files in your repository (from VS Code)
1. Unzip `spotlight-admin-update.zip`.
2. Open your `spotlight-website` folder in VS Code (File > Open Folder).
3. In VS Code's left sidebar, **delete the old file `js/articles.js`** (right-click > Delete). It is replaced by new files.
4. Drag these from the unzipped folder into VS Code's sidebar, next to `index.html`, and choose **Replace** if asked:
   `admin`, `content`, `js`, `netlify`, `index.html`, `netlify.toml`, `robots.txt`, `ADMIN-SETUP.md`, `README.md`, `.env.example`
5. Click the Source Control icon (Ctrl+Shift+G), type the message `Add admin dashboard`, click **Commit**, then **Sync Changes**.
   Netlify now rebuilds your site (the dashboard will not work until Step 3 is finished).

> Only do Step 4 once. Later, **never copy the `content` folder or `assets/uploads` over your repository again**:
> they hold what you publish from the dashboard, and copying old copies would erase it.

### Step 2: Create a GitHub "token" (a key that lets the dashboard save to your repository only)
1. On github.com click your profile picture (top right), then **Settings**.
2. Scroll the left menu to the bottom and click **Developer settings**.
3. Click **Personal access tokens**, then **Fine-grained tokens**, then **Generate new token**.
4. Token name: `spotlight-admin`. Expiration: choose **1 year** (put a reminder in your calendar to make a new one before it ends).
5. Under **Repository access** choose **Only select repositories**, and pick **spotlight-website**.
6. Under **Permissions**, open **Repository permissions** and set **Contents** to **Read and write**. Leave everything else alone.
7. Click **Generate token**. **Copy the token now** (it starts with `github_pat_`). GitHub shows it only once.

### Step 3: Give Netlify the settings
In Netlify open your site, then **Project configuration** > **Environment variables** > **Add a variable**. Add these five, one at a time:

| Key | Value |
|---|---|
| `ADMIN_PASSWORD` | The password you will type to log in. Make it long (12+ characters) and not used anywhere else. |
| `SESSION_SECRET` | Any long random text, **at least 40 characters** (a password manager's generator is ideal). Different from your password. You never type it again. |
| `GITHUB_TOKEN` | The token from Step 2 (starts with `github_pat_`). |
| `GITHUB_REPO` | `your-github-username/spotlight-website` (the same as in your repository's web address on github.com). |
| `GITHUB_BRANCH` | `main` |

Then go to **Deploys** > **Trigger deploy** > **Clear cache and deploy site**, and wait until it shows Published.
(Changes to these settings only apply after a new deploy.)

### Step 4: Log in
Open `https://your-site.netlify.app/admin`, type your `ADMIN_PASSWORD`, and you are in.

---
## Using the dashboard

**Blog posts tab**
- **+ New post:** fill in the title, category, a short summary, choose or upload a cover photo, and write the article. 
  Tick "featured" to show it large at the top of the Blog page (only one post is featured at a time).
- Writing the article: leave a blank line for a new paragraph. Start a line with `##` for a subheading, `-` for a bullet point,
  `>` for a highlighted tip (or use the buttons above the box). **Preview** shows how it will look.
- **Edit**, **Delete** and the **↑ ↓** arrows (order on the Blog page) are on each row.

**Gallery tab**
- **+ Add photo:** upload, add a title, category (Classrooms, Projects or Tools) and a caption.
- The **first 6 photos** appear in the slider on the home page. Use the **← →** buttons to reorder. All photos appear on the Gallery page.

**Home & contact details tab**
- Edit the home headline and intro, footer text, email, phone, WhatsApp link, Assessly link and the partner school names.

**Publishing**
- A bar at the bottom says "Unpublished changes". Press **Publish changes** when you are ready, or **Discard changes** to start again.
- After "Published!", wait about a minute and refresh your live site.

**Photos:** any JPG or PNG works. The dashboard shrinks them for you (about 1400 pixels wide) so the site stays fast.
Landscape photos (wider than tall) look best. Up to about 6 to 8 new photos fit in one publish; if you add more, publish first and add the rest after.

## Good to know
- **VS Code gets out of date:** after you publish from the dashboard, your computer's copy of the website is behind GitHub.
  Before you edit code again in VS Code, open Source Control and click **Sync Changes** (or Pull) first.
- **One shared password.** Anyone with it can edit the site. To change it: change `ADMIN_PASSWORD` in Netlify and redeploy.
  If you ever need separate logins for several people, ask and it can be added.
- **Deleted photos** are removed from the pages but the picture files stay in the repository (harmless; keeps history safe).
- **Not editable here yet:** the wording on the Products, Partner and Contact pages and the FAQs. Ask and they can be added to the dashboard.

## Security
- Only you can publish: every save needs the login cookie, which lasts 8 hours and cannot be read by other websites.
- 8 wrong passwords from the same place locks that visitor out for 15 minutes.
- The GitHub token can only touch your `spotlight-website` repository and lives only in Netlify, never in the website files.
- Everything you publish is checked again on the server, and visitor-facing text is escaped, so nobody can insert code into your pages.
- The dashboard is hidden from Google (`robots.txt` and a "noindex" setting).

## If something goes wrong
| What you see | What to do |
|---|---|
| "Admin is not set up yet" at login | `ADMIN_PASSWORD` or `SESSION_SECRET` is missing, or `SESSION_SECRET` is shorter than 40 characters. Fix it in Netlify and redeploy. |
| "GitHub is not set up yet" after login | `GITHUB_TOKEN` or `GITHUB_REPO` is missing or mistyped. Fix it in Netlify and redeploy. |
| "GitHub refused the token / the save" | The token expired, was copied wrongly, or lacks **Contents: Read and write** on `spotlight-website`. Make a new one (Step 2), update `GITHUB_TOKEN` and redeploy. |
| "The site was changed somewhere else a moment ago" | Just press Publish again. |
| Published, but the live site still looks old | Wait 1 to 2 minutes, then refresh (Ctrl+Shift+R). Check Netlify > Deploys shows a new deploy. |
| A new photo looks missing on the live site | Same: wait for the Netlify deploy to finish. |
| Dashboard shows a blank white page | Make sure you opened `/admin` on the live Netlify address, not from VS Code. The dashboard only works online. |
