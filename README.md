# SpotLight website

Plain HTML, CSS and JavaScript (no build step), with Netlify Functions for the enquiry forms and the admin dashboard.

## Run it on your computer (VS Code)
1. In VS Code: **File > Open Folder...** and choose the `spotlight-website` folder.
2. Install the **Live Server** extension (by Ritwick Dey), then right-click `index.html` and choose **Open with Live Server**.
   Use Live Server (do not double-click `index.html`): the pages load their content from `content/*.json`.
3. The enquiry forms and the admin dashboard only work on the live Netlify site, not on your computer.

## Where things are
| File / folder | What it does |
|---|---|
| `index.html` | All pages: Home, Products (Assessly), Gallery, Blog, Partner, Contact. Each page is a `<section id="pg-...">`. |
| `css/style.css` | All styling. Colours are at the top (`:root`). |
| `content/` | **Blog posts, gallery photos and contact details** (`blog.json`, `gallery.json`, `site.json`). Edited from the admin dashboard. |
| `admin/` | The admin dashboard: log in at `/admin` on the live site. See `ADMIN-SETUP.md`. |
| `js/format.js`, `js/content.js`, `js/blog.js`, `js/gallery.js` | Load the content files and build the blog, article and gallery pages. |
| `js/main.js` | Page switching, mobile menu, partner names strip, enquiry forms. |
| `netlify/functions/enquiry.js` | Emails the Partner and Contact form messages to hellospotlite@gmail.com (via Resend). |
| `netlify/functions/admin-*.js`, `netlify/lib/` | The dashboard's login, loading and publishing. |
| `netlify.toml`, `robots.txt` | Netlify settings; keeps `/admin` out of search engines. |
| `assets/` | Logos, favicon, photos. Photos uploaded from the dashboard go in `assets/uploads/`. |
| `SETUP-EMAIL-AND-GO-LIVE.md` | Step by step: Resend, GitHub, Netlify, form emails. |
| `ADMIN-SETUP.md` | Step by step: set up and use the admin dashboard. |
| `.env.example` | The list of settings (environment variables) Netlify needs. Never put real values in files. |

## Editing the website
- **Blog posts, gallery, contact details, partner schools:** use the admin dashboard (`/admin`). No code needed.
- **Other wording** (Products, Partner and Contact pages, FAQs) is in `index.html`. Search for the text to find it.
- After the dashboard publishes, your computer's copy is behind GitHub: click **Sync Changes** in VS Code before editing code.

## Still to do
- Blog "Read article" works; footer About, Privacy and Terms links have no pages yet.
