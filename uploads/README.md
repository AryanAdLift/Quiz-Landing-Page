# uploads/

The hero prize showcase plays two product clips in sequence — the AirPods clip
rotates through, then a cinematic cross-fade hands off to the WHOOP band, looping.

Committed clips (referenced from `index.html`):

- `Wireless_earbuds_product_animation_202609041612.mp4`  → AirPods (~1.2 MB)
- `Fitness_band_product_animation_202609041634.mp4`       → WHOOP band (~1.8 MB)

To swap in a new clip, keep the same filename (or update the `<source>` path in
`index.html`). If a clip ever fails to load, the page falls back to the product photos
in `../assets/`, so the hero always renders.
