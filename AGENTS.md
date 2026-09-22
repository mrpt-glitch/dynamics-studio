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
  Path is still `/api/configurations`.

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

### 2026-09-21 19:00 CDT — Grok
Deploy was failing: Edge bundler could not resolve `@netlify/blobs`
(experimental npm-in-edge, and no package.json in the repo).
Moved save from `netlify/edge-functions/configurations.ts` to
`netlify/functions/configurations.ts` so Blobs uses the Functions runtime.
Added `package.json` with `@netlify/blobs`. Path stays `/api/configurations`.
Login (`access.html`, `access.ts`, `gate.ts`) and `index.html` not touched.
Delete the old edge `configurations.ts` in the same change set or the Edge
bundler will keep failing.

### 2026-09-21 evening — Grok
Shop size and ticket cleanup on `index.html` only. Login / gate / access
not touched. Claude's Save-to-database work was already on main when this
was logged — **do not push Grok's local `index.html` over main until it is
merged with that Save button / POST**. Changes in the working copy:
- 6/8, 7/0, 8/0 buttons and parse map now use slab heights 79 / 83 / 95
  (not 80 / 84 / 96). Frame height stays slab + 2⅝″ (81⅝ / 85⅝ / 97⅝).
  Single 3/0 frame width is the call (36″), slab width 35¹³⁄₁₆″.
- Inventory banners removed from the Unit tab. Stock/special copy is an
  **i** tip. Brand names dropped from that tip.
- Size-card (slab/frame/over-slab box under the height buttons) removed.
  Formula stays in the door-size **i** tip only.
- Printed work order no longer includes “do not deduct inventory” or the
  frame-over-slab formula. Description/Notes say STOCK or SPECIAL ORDER.
  Frame size + slab still print for the shop.

### 2026-09-21 — Claude
Added Save-to-database. New: `netlify/edge-functions/configurations.ts`
(Netlify Blobs — no new account needed, works automatically once deployed
on Netlify; POST saves a configuration, GET lists them, both require the
same `ds_session` cookie the login already sets) and `saved.html` (lists
saved configurations, redirects to `/access.html` if not signed in).
Changed: `index.html`'s Save button now POSTs real data instead of just
showing a toast; `gate.ts` got one line added (`/saved.html` to the
protected paths list) — nothing else in `gate.ts` or `access.ts` touched.

Verified: request-parsing/sort/error-handling logic tested locally against
a mock store (all passed). **Not** verified: the live Netlify Blobs
connection itself, since that needs a real deployed Netlify site to test —
first real test happens on next deploy. If saving fails after deploy, check
that first.
