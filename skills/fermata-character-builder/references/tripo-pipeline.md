# Generating parts in Tripo

Tripo (https://www.tripo3d.ai/, studio at https://studio.tripo3d.ai/) turns an image into a textured 3D model. Use it one part at a time.

## Settings that matter

- Image to model, from a part plate (see `decomposition.md`). Use a low-polygon or "smart low poly" / game-ready option when offered, and set the polygon budget to the part's share of your total (section 4 of `SKILL.md`).
- Prefer quad-oriented remeshing for anything that bends or deforms: face, neck, shoulders, elbows, wrists, hips, knees.
- Generate textures only after you like the shape.

## Inspect before you texture

Reject and regenerate when you see: fused eyes or lids, a sealed mouth cavity, doubled or inside-out surfaces, hidden internal geometry that inflates the triangle count, hands that are one solid mitten when you need fingers, asymmetry that was not in the design, scale that does not match the other parts.

## Textures

Treat generated PBR maps as a good first pass. Check color, roughness, normal strength and transparent edges under neutral light, and match colors across parts. Bake to a compact atlas where it saves draw calls. Textures over 2048 px are rarely worth it.

## Keep a ledger

For every part keep: the plate image, the Tripo settings, the output file, the triangle count, and whether it was accepted. One line each is enough. It makes retries one-variable-at-a-time instead of guesswork.

## Retry rules

Change one thing per retry (plate, polygon target, remesh option). If three tries fail, fix the plate or split the part further.
