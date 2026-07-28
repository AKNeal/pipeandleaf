# Pipe & Leaf — pipeandleaf.nealmedia.app

Website for Pipe & Leaf, Fairbanks AK, with a live inventory menu.

- `index.html` — the site (brand-styled, 21+ age gate, live menu UI)
- `api/menu.js` — Vercel serverless function that proxies the public Weedmaps
  discovery API for both locations (Airport Way: `pipe-and-leaf`, Old Steese:
  `pipe-leaf-old-steese`), slims the payload, and edge-caches it for 10 minutes.
  No API keys needed. If Weedmaps is unreachable the site falls back to links.

No build step — Vercel auto-detects the `api/` directory.

## Deploy (Vercel + GitHub)

1. Create a new GitHub repo (e.g. `AKNeal/pipeandleaf`) and push this folder's contents (`index.html` at the repo root).
2. In Vercel → **Add New Project** → import the repo. Framework preset: **Other**. No build command, output directory: root. Deploy.
3. In the new project → **Settings → Domains** → add `pipeandleaf.nealmedia.app`. Since `nealmedia.app` is already on your Vercel account, Vercel wires up the subdomain DNS automatically. If nealmedia.app's DNS is elsewhere, add the CNAME record Vercel shows you.

Done — site will be live at https://pipeandleaf.nealmedia.app within a minute of the domain verifying.

## Notes

- Age gate (21+) shows once per browser session.
- Menu links point to the live Weedmaps / Where's Weed menus, which update in real time.
- Footer includes Alaska retail marijuana advertising warning language (3 AAC 306.360).
- Airport Way hours are listed as "from 10 AM — call to confirm"; update `index.html` when confirmed.
