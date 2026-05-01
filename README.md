# Noetic Proposals

Static-hosted proposals deployed to **proposals.noetic.io**.

Each proposal lives in its own folder with a private slug (`/agwa-e948/`, `/visit-org-3fc1/`, etc.). Each folder is a fully self-contained static site — one `index.html`, one `assets/` directory for logos and images. Push to GitHub, Vercel deploys, link goes live.

---

## Repo layout

```
noetic-proposals/
├── README.md                  ← this file
├── vercel.json                ← Vercel routing config
├── agwa-e948/
│   ├── index.html
│   └── assets/
│       ├── agwa-logo.png
│       └── noetic-logo.png
├── visit-org-3fc1/            ← (future)
│   ├── index.html
│   └── assets/
└── ...
```

---

## One-time setup (90 minutes)

You only do this once. After it's done, every future proposal is just a git push.

### Step 1 — GitHub repo (10 min)

1. Go to **github.com/new**
2. Repository name: `noetic-proposals`
3. Visibility: **Private** (recommended — no need to expose proposal source)
4. Initialize with: leave everything unchecked (we'll push our own files)
5. Click **Create repository**

GitHub will show you the empty-repo instructions. Keep that tab open.

On your machine:

```bash
# In whatever folder you keep code (e.g., ~/Code/)
mkdir noetic-proposals
cd noetic-proposals

# Drop the agwa-e948 folder here, plus this README.md
# Folder structure should match the "Repo layout" above

git init
git add .
git commit -m "Initial: agwa proposal"
git branch -M main
git remote add origin git@github.com:<your-org>/noetic-proposals.git
git push -u origin main
```

If you don't use SSH, use the HTTPS URL GitHub gives you instead.

### Step 2 — Vercel project (10 min)

1. Go to **vercel.com/new**
2. If you haven't connected GitHub yet: click **Continue with GitHub**, authorize Vercel to read your repos
3. Find `noetic-proposals` in the list, click **Import**
4. Configure project:
   - **Project Name**: `noetic-proposals` (or whatever)
   - **Framework Preset**: `Other` (it's static HTML, no framework)
   - **Root Directory**: leave as `./`
   - **Build & Output Settings**: leave defaults (no build command, no output directory)
5. Click **Deploy**

Vercel will deploy in ~30 seconds. You'll get a URL like `noetic-proposals-xxxx.vercel.app`. Test it by visiting `noetic-proposals-xxxx.vercel.app/agwa-e948/` — you should see the proposal.

### Step 3 — Custom domain (5 min in Vercel + 5 min waiting for DNS)

In Vercel:

1. Go to your project → **Settings** → **Domains**
2. Type `proposals.noetic.io` in the input → **Add**
3. Vercel will tell you to add a CNAME record. It'll show:
   ```
   Type:  CNAME
   Name:  proposals
   Value: cname.vercel-dns.com
   ```

In your DNS provider (wherever `noetic.io` is managed — Cloudflare, Namecheap, Google Domains, GoDaddy, etc.):

1. Find the DNS / Records management page for `noetic.io`
2. Add a new record:
   - **Type**: `CNAME`
   - **Name**: `proposals` (just the subdomain, not the full thing)
   - **Value** / **Target**: `cname.vercel-dns.com`
   - **TTL**: `Auto` or `300`
   - **Proxy** (Cloudflare only): turn this **OFF** (gray cloud, "DNS only") — Vercel handles its own SSL and proxying through Cloudflare can cause SSL handshake errors
3. Save

Wait 1–10 minutes. Vercel auto-detects when DNS resolves and provisions an SSL cert. Refresh the Vercel Domains page; when you see a green checkmark, you're live.

Test: visit `https://proposals.noetic.io/agwa-e948/`. It should load the proposal with HTTPS.

### Step 4 — Plausible analytics (5 min)

1. Sign up at **plausible.io** ($9/mo Growth plan covers up to 10K pageviews — way more than you'll need)
2. Add a site → enter `proposals.noetic.io` as the domain
3. Plausible gives you a script tag. **You don't need to copy/paste it** — it's already in `index.html`. Just confirm the `data-domain` attribute matches:
   ```html
   <script defer data-domain="proposals.noetic.io" src="https://plausible.io/js/script.js"></script>
   ```
4. Visit your live proposal once. Within 60 seconds, the Plausible dashboard will show 1 visitor. You're tracking.

### Step 5 — Verify everything works

Open `https://proposals.noetic.io/agwa-e948/` and check:

- [ ] HTTPS lock in browser bar
- [ ] All 15 sections render correctly
- [ ] Logos load (no broken-image icons)
- [ ] Plausible dashboard shows your visit within 60s
- [ ] Forwarding the link to a colleague works (they should also see it)

If all five check out, you're done with setup. Send the link to Gilly.

---

## Adding a new proposal

After setup, every new proposal is ~5 minutes of mechanical work.

### 1. Generate a slug

```bash
# In your terminal — gives you 4 random hex chars
python3 -c "import secrets; print(secrets.token_hex(2))"
# Example output: 7c2a
```

Slug pattern: `<client-name>-<4-hex-chars>`, e.g., `visit-org-7c2a`, `quantalx-9b1d`.

### 2. Copy the agwa folder as a template

```bash
cp -r agwa-e948 visit-org-7c2a
```

Now you have a duplicate to edit. The new folder has its own `index.html` and `assets/`.

### 3. Edit the content

Open `visit-org-7c2a/index.html` in **Cursor** or **VS Code**. The file is heavily commented — every slide section is wrapped in `<!-- SLIDE N: TITLE -->` markers, so `Cmd+F` finds anything fast.

Things to update for every new proposal:

- Page `<title>`
- Cover slide: title text, subhead, "Prepared for ___", date in cover-meta
- Story / Setup slides: rewrite for the new client's situation
- "What We Heard" cards: rewrite from the client's intake
- Tier prices and scope (only if pricing differs from Agwa baseline)
- Coverage audit notes (often stays similar)
- Risks (always client-specific)
- Brand strip: replace `agwa-logo.png` references with the new client's logo (drop their logo into `assets/`)

### 4. Push

```bash
git add visit-org-7c2a/
git commit -m "Add: visit.org proposal"
git push
```

Vercel auto-deploys in ~30 seconds. Live at `https://proposals.noetic.io/visit-org-7c2a/`.

### 5. Track the slug

Note the slug somewhere private — Notion, Slack pinned message, a personal `slugs.md` outside the repo. **Don't commit a slug-to-client mapping into this repo** — it would defeat the purpose of dirty slugs (anyone with read access could enumerate your live proposals).

---

## Editing an existing proposal

Same workflow. Edit the file, push to GitHub, Vercel rebuilds.

```bash
# Edit in Cursor / VS Code
git add agwa-e948/index.html
git commit -m "Update: agwa pricing"
git push
```

Live in ~30 seconds. Old version is in git history if you need to revert.

---

## Quality-of-life notes

### What `vercel.json` does

The `vercel.json` in repo root tells Vercel two things:

1. Hitting `proposals.noetic.io` with no slug redirects to `noetic.io` (we don't want a public landing page advertising "we have proposals here")
2. Hitting a non-existent slug returns a clean 404 instead of leaking that the directory doesn't exist

Contents:

```json
{
  "redirects": [
    { "source": "/", "destination": "https://noetic.io", "permanent": false }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex, nofollow" }
      ]
    }
  ]
}
```

The `X-Robots-Tag` tells Google not to index any of these URLs — important so a crawl never surfaces a client proposal in search results.

### Privacy hardening (when you're ready)

Right now privacy = unguessable URL only. If you want stronger protection later:

- **Vercel password protection** ($20/mo per project): add a password gate at the Vercel level. Configure per-deployment in project settings.
- **Cloudflare Access** (free for ≤50 users): require email verification before viewing. Setup is more involved but free.
- **Simple JS gate**: a one-line password prompt that compares against a hash in the HTML. Trivial to bypass technically but raises the bar against forwarding screenshots.

For most proposals, dirty slugs are enough. Revisit only if a prospect asks "is this private?"

### Tracking which slide Gilly cared about

Plausible dashboard shows pageviews and time-on-page out of the box. If you want section-level tracking (e.g., "she scrolled to the pricing slide and stayed 45 seconds"), you can wire custom events:

```javascript
// In index.html, before </body>
const sections = document.querySelectorAll('section.slide');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
      const id = entry.target.querySelector('.section-pill')?.textContent || 'unknown';
      window.plausible?.('Slide viewed', { props: { slide: id } });
    }
  });
}, { threshold: 0.5 });
sections.forEach(s => observer.observe(s));
```

This fires a Plausible custom event each time a slide enters >50% of the viewport. After a week you'll see in the Plausible dashboard exactly which slides each prospect lingered on.

---

## Troubleshooting

**"DNS not resolving after 30 minutes"** — Check your DNS provider. If you're on Cloudflare, make sure the proxy (orange cloud) is **OFF** for the `proposals` CNAME. Cloudflare's proxy interferes with Vercel's SSL provisioning.

**"Logos look broken / 404 in DevTools"** — Path issue. Inside `index.html`, logo references should be `assets/agwa-logo.png` (relative path), not `/assets/...` (absolute). The relative form works correctly when the proposal lives at `/agwa-e948/`.

**"Plausible isn't tracking"** — Open DevTools → Network tab → reload the page. Look for a request to `plausible.io/api/event`. If missing, check the `data-domain` attribute matches what you registered in Plausible. If you're on Brave or have an ad blocker, disable for the test (Plausible is privacy-respecting but adblockers don't always know that).

**"I pushed and Vercel didn't deploy"** — Check the Vercel dashboard → your project → Deployments. There should be a new deployment. If not, the GitHub integration may have disconnected; reconnect under project Settings → Git.

**"Old version still showing after push"** — Browser cache. Hard reload (Cmd+Shift+R on Mac). Vercel deploys are immediate; staleness is always client-side.

---

## Stack summary

- **Hosting**: Vercel (free tier)
- **DNS**: Wherever `noetic.io` lives (CNAME for `proposals` subdomain)
- **Analytics**: Plausible ($9/mo)
- **Editing**: Cursor or VS Code, locally
- **Source control**: GitHub (private repo)
- **Total monthly cost**: $9 (Plausible only)

---

*Maintained by Tamir. Last updated April 2026.*


.
