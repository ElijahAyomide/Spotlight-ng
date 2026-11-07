# SpotLight website (frontend)

Plain HTML, CSS and JavaScript. No installs or build step needed.

## Run it in VS Code
1. Unzip this folder. In VS Code: **File > Open Folder...** and choose `spotlight-website`.
2. Open the Extensions panel (Ctrl+Shift+X, or Cmd+Shift+X on Mac), search **Live Server** (by Ritwick Dey) and install it.
3. Right-click `index.html` and choose **Open with Live Server**. The site opens in your browser and refreshes every time you save a file.

No extension? Double-click `index.html` and it opens in your browser too.

## Where things are
| File / folder | What it does |
|---|---|
| `index.html` | All pages: Home, Products (Assessly), Gallery, Blog, Partner, Contact. Each page is a `<section id="pg-...">`. |
| `css/style.css` | All styling. Colours are at the top (`:root`). |
| `js/articles.js` | The blog articles (sample content). Add or edit articles here. |
| `js/gallery.js` | The gallery photos (home slider and Gallery page). Add or change photos here. |
| `api/enquiry.js` | The server function that emails form messages to hellospotlite@gmail.com (runs on Vercel). |
| `SETUP-EMAIL-AND-GO-LIVE.md` | Step-by-step: Resend, GitHub, Vercel. |
| `js/main.js` | Page switching, mobile menu, scrolling school names, contact form preview. |
| `assets/` | Logos, favicon and photos. Replace photos by saving new ones with the same file names. |

## Easy edits
- **School names in the blue strip:** `js/main.js`, the `names` list.
- **Assessly link:** in `index.html`, search `assessly-ng.vercel.app` to change where the "View Assessly" button goes.
- **Contact details (email, phone, WhatsApp):** `index.html`, search `hellospotlite` and `2348145686089`.
- **Photos:** replace files in `assets/images/`.

## Not finished yet
- The forms email you only after the site is deployed on Vercel. See `SETUP-EMAIL-AND-GO-LIVE.md`.
- Blog "Read article" buttons have no article pages yet. Replace the placeholder contact details on the Contact page.
- Footer About, Privacy and Terms links have no pages yet.

## Next steps
Follow `SETUP-EMAIL-AND-GO-LIVE.md` to connect the forms and go live.

## Changing the gallery pictures
Save your own photos in `assets/gallery/` (JPG, about 800px wide, 16:10 shape works best), then edit the list at the top of `js/gallery.js`. The home slider shows the first 6 entries and the Gallery page shows all of them.
