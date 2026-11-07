# Make the forms email you, and put the site online

Your two forms (Become a Partner and Contact us) send their messages to `hellospotlite@gmail.com`.
This only works once the site is online on Vercel, because the sending happens on Vercel's server
(the file `api/enquiry.js`). Opening the site on your computer with Live Server shows the forms
and the "could not send" message, but cannot send email. That is normal.

Total time: about 20 minutes.

**Cost note (please read):** Resend and GitHub have free plans that work for a business site.
Vercel's free "Hobby" plan, however, is only for personal, non-commercial use. Vercel's own rules count a site that
promotes a business or its services as commercial, which needs their paid Pro plan (around $20 per month; check
vercel.com/pricing for the current price). Parts 1 and 2 are the same on any host. If you would rather not pay yet,
the website can be moved to another host whose free plan allows business sites (for example Netlify or Cloudflare Pages).
Check their current terms first; the forms' email function then needs a small change, which can be done for you.

---
## Part 1: Get your email-sending key (Resend)
1. Go to **resend.com** and sign up using **hellospotlite@gmail.com**.
   (Important: it must be this email. Until you verify your own domain, Resend only delivers to the email you signed up with.)
2. Confirm your email when Resend asks.
3. In the Resend dashboard, open **API Keys** and click **Create API Key**.
   Name it `spotlight-website` and choose **Sending access**.
4. **Copy the key now** (it starts with `re_`). Resend only shows it once.
   Paste it in a safe place for the next 10 minutes. Never put it inside the website files.

## Part 2: Put the website on GitHub
1. Go to **github.com** and sign up or log in.
2. Click **+** (top right) then **New repository**. Name it `spotlight-website`. Leave everything else as it is and click **Create repository**.
3. On the new empty repository page, click the link **uploading an existing file**.
4. Open the unzipped `spotlight-website` folder on your computer. Select everything INSIDE it
   (`index.html`, the `api`, `css`, `js` and `assets` folders, and the other files) and drag it all into the GitHub page.
   `index.html` must end up at the top level of the repository, not inside another folder.
5. Wait for the upload to finish, then click **Commit changes**.

## Part 3: Publish on Vercel
1. Go to **vercel.com** and sign up with **Continue with GitHub**.
2. Click **Add New** then **Project**, and **Import** your `spotlight-website` repository.
3. Before you click Deploy, open the **Environment Variables** section and add:
   - Name: `RESEND_API_KEY`  Value: the key you copied in Part 1 (starts with `re_`)
4. Click **Deploy**. After about a minute Vercel gives you a live link like `spotlight-website.vercel.app`.

(If you already deployed without the key: Project > Settings > Environment Variables, add `RESEND_API_KEY`,
then go to Deployments and **Redeploy** the latest one.)

## Part 4: Test it
1. Open your live link, go to **Contact Us**, fill in the form with your own details and send.
2. You should see "Thank you! Your message has been sent." and the email arrives at hellospotlite@gmail.com within a minute.
3. Do the same on **Become a Partner**.
4. First emails from a new sender can land in **Spam**. Open it and click **Not spam** once so future ones arrive in your inbox.
5. In Gmail, press **Reply** on an enquiry: it goes straight to the person who filled the form.

## If something goes wrong
| What you see | What to do |
|---|---|
| "Sorry, we could not send your message right now" on the live site | In Vercel open **Logs** (or Deployments > Functions) and look for the error. Most often the key is missing or mistyped: re-add `RESEND_API_KEY` and Redeploy. |
| Nothing arrives and no error shows | Check Spam. Check that you signed up to Resend with hellospotlite@gmail.com. |
| Works on the live site but not on your computer | Expected. The sending only runs on Vercel. |
| You want enquiries sent to a different email | Vercel > Settings > Environment Variables: add `TO_EMAIL` with the new address, then Redeploy. (Resend only allows this once your domain is verified.) |

## Later: send from your own domain
When you buy your domain, verify it inside Resend, then add `FROM_EMAIL` in Vercel, for example
`SpotLight <hello@yourdomain.com>`. This improves delivery and lets you send to any address.

## What protects the forms from spam
- A hidden field that people never see but spam robots fill in: those messages are quietly thrown away.
- The server checks every required field, the email format, the consent tick and the length of each answer.
- Visitor text is escaped before it goes into the email, so nobody can inject code or extra email headers.
If you ever get a lot of spam, we can add a "I am not a robot" check (Cloudflare Turnstile is free).
