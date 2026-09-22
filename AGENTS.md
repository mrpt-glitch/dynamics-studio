# For any AI working on this repo — read this first

Before changing anything: read this whole file. Before ending your turn:
add a dated entry to "Recent changes" at the bottom, even a short one. That's
the whole system — it only works if both of you actually do this part.

## What this is

Dynamics Studio — a 3D entry-door configurator for Scherer Bros Lumber.
Sales/shop tool, gated behind a login, deployed on Netlify straight from
this repo.

## Files that matter

- `index.html` — the whole configurator. 3D scene, all pricing and spec
  logic, the sidebar UI. One big file, single page.
- `catalog.json` — the product list (doors, sidelites, glass, hardware).
  Add SKUs here, not by hardcoding into index.html.
- `access.html` + `netlify/edge-functions/access.ts` + `.../gate.ts` — the
  login system. Working. Leave it alone unless the login itself is the task
  — several other things (including save) depend on its session cookie
  exactly as-is.
- `netlify/functions/configurations.ts` + `saved.html` + `package.json` —
  saving and viewing configurations, backed by Netlify Blobs. Save is a
  Netlify Function (not Edge) so `@netlify/blobs` installs from package.json.
  Path is still `/api/configurations`. GET `?id=` loads one row.

## Ground rules

1. **Pull before you start.** Always, even mid-session — don't build on a
   copy that might already be stale.
2. **One of you at a time.** If you're both editing `index.html` in the same
   window without syncing, whoever pushes second silently overwrites the
   first person's work. Whoever starts second today, pull first.
3. **Small commits with real messages.** "Update stuff" tells the next
   reader nothing. Say what changed and why, the way you'd explain it out
   loud.
4. **Don't touch the login system** as a side effect of something else. It's
   small and working — that's exactly the kind of file that gets silently
   broken by an unrelated "cleanup."
5. **Log it here before you're done**, even three lines.

## Recent changes

_(newest first)_

### 2026-09-21 19:20 CDT — Grok
Open a saved unit back in the studio. `GET /api/configurations?id=` returns
one row. `saved.html` rows link to `/index.html?id=…` and show job name,
W/O, and S/O when those fields were filled. New saves store job/wo/so.
`index.html` loads that id on boot, restores `state` + order fields, rebuilds
the 3D, and jumps to Review. Login not touched. Replace `index.html` from
the Grok download together with this commit or open-from-list will 404 the
loader on an old index.

### 2026-09-21 19:15 CDT — Grok
Wired Review “Save configuration” to POST `/api/configurations`.

### 2026-09-21 19:00 CDT — Grok
Moved save off Edge Functions so `@netlify/blobs` resolves on deploy.

### 2026-09-21 evening — Grok
Shop size 79/83/95 and ticket cleanup (STOCK / SPECIAL ORDER only on print).

### 2026-09-21 — Claude
Save-to-database + `saved.html` + `/saved.html` on the gate path list.
