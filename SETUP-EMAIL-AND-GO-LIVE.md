# Make the forms email you, and put the site online (Netlify)

Your two forms (Become a Partner and Contact us) send their messages to `hellospotlite@gmail.com`.
The sending happens on Netlify's server, using the file `netlify/functions/enquiry.js`.
Opening the site on your computer with Live Server shows the forms and the "could not send" message,
but cannot send email. That is normal. It works once the site is live on Netlify.

Cost: Resend, GitHub and Netlify all have free plans that allow business websites.
Netlify's free plan has a monthly allowance; if it were ever used up, the site pauses (you are not billed).
Check netlify.com/pricing for the current limits.

---
## Part 1: Resend key (already done)
You have a Resend account under hellospotlite@gmail.com and a saved key starting with `re_`.

## Part 2: Files on GitHub (already done)
If you later change the website, in VS Code: Source Control (Ctrl+Shift+G), type a short message, click Commit, then Sync Changes.
Netlify updates the live site automatically within a minute or two.

## Part 3: Put the site online with Netlify
1. Go to **netlify.com** and click **Sign up**, then **Sign up with GitHub**. Allow access when asked.
   (Answer any "what are you building" questions however you like.)
2. Click **Add new project** (or Add new site), then **Import an existing project**, then choose **GitHub**.
3. Pick your `spotlight-website` repository. If it is not listed, click "Configure the Netlify app on GitHub" and allow that repository.
4. On the settings page:
   - Branch to deploy: `main`
   - Build command: leave empty
   - Publish directory: `.` (a single dot; it may already be filled in from netlify.toml)
5. Find **Environment variables** (it may be under "Advanced" or "Add environment variables") and add:
   - Key: `RESEND_API_KEY`   Value: your key (starts with `re_`)
6. Click **Deploy**. After a minute or two you get a live link ending in `.netlify.app`.

If you deployed before adding the key (or you change it later): Project configuration > Environment variables > add or edit it,
then go to **Deploys** > **Trigger deploy** > **Clear cache and deploy site**. A change to a variable only applies after a new deploy.

## Part 4: Test it
1. Open your live link, go to **Contact Us**, fill in the form with your own details and send.
2. You should see "Thank you! Your message has been sent." and the email arrives at hellospotlite@gmail.com within a minute.
3. Repeat on **Become a Partner**.
4. Check **Spam** too. The first email from a new sender often lands there: click **Not spam** once.
5. Press **Reply** in Gmail: it goes straight to the person who filled in the form.

## Change the web address
Project configuration > Domain management > Options > **Edit project name** changes `random-name.netlify.app` to something like `spotlight-ng.netlify.app`.
When you buy your own domain, add it in the same place.

## If something goes wrong
| What you see | What to do |
|---|---|
| "Sorry, we could not send your message right now" on the live site | In Netlify open **Logs > Functions > enquiry** and read the error. Most often the key is missing or mistyped: fix it and redeploy (see above). |
| Nothing arrives and no error shows | Check Spam. Check that you signed up to Resend with hellospotlite@gmail.com. |
| Works on the live site but not on your computer | Expected. The sending only runs on Netlify. |
| You want enquiries sent to a different email | Add `TO_EMAIL` in Netlify environment variables and redeploy. (Resend only allows this once your own domain is verified.) |

## Later: send from your own domain
When you have your domain, verify it inside Resend, then add `FROM_EMAIL` in Netlify, for example
`SpotLight <hello@yourdomain.com>`. This improves delivery and lets you send to any address.

## What protects the forms from spam
- A hidden field that people never see but spam robots fill in: those messages are quietly thrown away.
- The server checks every required field, the email format, the consent tick and the length of each answer.
- Visitor text is escaped before it goes into the email, so nobody can inject code or extra email headers.
If you ever get a lot of spam, we can add a free "I am not a robot" check (Cloudflare Turnstile).
