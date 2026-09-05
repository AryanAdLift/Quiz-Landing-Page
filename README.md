# Spot the Lie · Win the Prize — AdLift

An interactive event landing page (the **AI Search Challenge**). Six stats about AI &
search are on the board — exactly one is false. Visitors pick the lie, drop their
details, and enter the draw for **AirPods** + a **WHOOP band**.

Implemented from the `4a` direction of *Quiz Landing Wireframes* (the standee-inspired
page): orange hero with the concentric-ring motif, ADL↑FT branding, a floating prize
showcase that cross-fades the two product clips, the pick-the-lie grid, and an inline
reveal → entry form → confirmation flow.

## Structure

```
index.html      # the whole page (self-contained HTML + CSS + JS)
assets/         # airpods.jpg, whoop.jpg — prize art & video poster/fallbacks
uploads/        # (optional) the two product .mp4 clips — see uploads/README.md
```

The page is a **static site** — no build step, no dependencies.

## Run locally

Any static file server works, e.g.:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly via `file://` also works, but a server is recommended so
the relative `assets/` and `uploads/` paths resolve normally.

## The prize videos

The hero plays two product clips from `uploads/` in sequence — the AirPods clip rotates
through, then a cinematic cross-fade hands off to the WHOOP band, looping:

- `uploads/Wireless_earbuds_product_animation_202609041612.mp4`
- `uploads/Fitness_band_product_animation_202609041634.mp4`

Both are committed (~3 MB total). If a clip is ever missing, the page gracefully falls
back to the product photos in `assets/` — so the hero always renders. To swap a clip,
keep the same filename (or update its `<source>` in `index.html`).

## Wiring up real entries

The entry form is client-side only in this prototype. To capture entries, POST the
`entry` object to your endpoint in `index.html` (search for `POST` in the submit
handler) — a form service (Formspree), an API route, or a sheet webhook.

## Deploy (Vercel)

Static site, zero config:

1. Push this repo to GitHub.
2. In Vercel → **Add New… → Project** → import `Quiz-Landing-Page`.
3. Framework preset: **Other**. Leave build & output settings empty. **Deploy**.

Every push to `main` then redeploys automatically.
