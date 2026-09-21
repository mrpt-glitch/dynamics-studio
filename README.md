# Dynamics Studio

Private unit builder for sales and production: 3D entry unit, shop ticket, access gate.

## Why this repo exists

Uploading a single HTML file to Netlify **replaces the entire site**. That is how the access code kept disappearing. This repository is the complete project. Connect Netlify to **this** repo and never drop one file again.

## What belongs here

- `index.html` — unit builder
- `access.html` — sign-in
- `catalog.json` — SKUs (3D templates, not 500 models)
- `dslogo.png` and other logos
- `netlify.toml` + `netlify/edge-functions/` — gate on every path, `SameSite=Lax`

Do **not** put `CUSTOMER_ACCESS_CODE` or `SESSION_SECRET` in these files. Those stay in Netlify → Site settings → Environment variables.

## After you clone

1. Add `index.html` and logos if they are not in the latest commit (large files may be uploaded in the GitHub UI).
2. Netlify → Site → Project configuration → Build & deploy → **Link repository** → this repo.
3. Confirm env: `CUSTOMER_ACCESS_CODE` and optional `SESSION_SECRET`.
4. Publish. Incognito: `/index.html` must redirect to sign-in.

## Do not

- Drag only `index.html` onto Deploys
- Let an agent rewrite the edge function path from `/*` to `/`
- Change the session cookie to `SameSite=Strict` (shared links will bounce)
