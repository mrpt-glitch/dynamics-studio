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
  login system. Working. Leave it alone unless the login itself is the task.
- `netlify/functions/configurations.ts` + `saved.html` + `package.json` —
  save / list / open / delete configurations in Netlify Blobs.
  Path `/api/configurations`. GET list, GET `?id=`, POST save, DELETE `?id=`.

## Ground rules

1. **Pull before you start.**
2. **One of you at a time** on `index.html`.
3. **Small commits with real messages.**
4. **Don't touch the login system** unless that is the task.
5. **Log it here before you're done.**

## Recent changes

_(newest first)_

### 2026-09-21 19:25 CDT — Grok
Delete saved rows. `DELETE /api/configurations?id=` removes the blob.
`saved.html` has a Delete button on each row (confirm, then refresh list).
Login and `index.html` not touched.

### 2026-09-21 19:20 CDT — Grok
Open a saved unit in the studio via `/index.html?id=`.

### 2026-09-21 19:15 CDT — Grok
Wired Save configuration to POST `/api/configurations`.

### 2026-09-21 19:00 CDT — Grok
Moved save off Edge Functions so `@netlify/blobs` resolves on deploy.

### 2026-09-21 evening — Grok
Shop size 79/83/95 and ticket cleanup.

### 2026-09-21 — Claude
Save-to-database + `saved.html` + `/saved.html` on the gate path list.
