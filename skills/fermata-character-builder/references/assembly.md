# Reassembling in Blender (UI, MCP, or headless)

All three routes use the same Blender operations.

- **Blender MCP**: give the assistant the Blender connection and have it run Python in the scene.
- **UI**: do the steps by hand with the assistant guiding.
- **Headless**: `blender -b --python assemble.py -- --parts parts/ --out character.glb`. Good for repeatable rebuilds. Any other 3D tool works too; only the final GLB matters.

## Checklist

1. Units in meters. Decide the final height (a human is about 1.7 m; stylized characters are often shorter) and scale every part to match.
2. Import each part. Apply scale and rotation. Put each origin at the part's real pivot (neck base, shoulder ball, beak hinge, wrist).
3. Delete hidden or unseen geometry and loose vertices. They cost triangles and cause z-fighting.
4. Name parts clearly: `Body`, `Head`, `Eye_L`, `Eye_R`, `Lid_Upper_L`, `Beak_Upper`, `Beak_Lower`, `Wing_L`, `Tail`, `Hair`, `Clothes_Top`, and so on.
5. Snap parts to their attachment points. Compare front, three-quarter, side and silhouette views to the master image.
6. Fix intersections by moving or uniformly scaling a part. Avoid sculpting or stretching generated parts to make them fit; regenerate the part from a better plate instead.
7. Join meshes that share a material to cut draw calls, but keep parts that need independent shape keys or bones separate until after rigging.
8. Run the rig and face steps (`rigging.md`, `face-and-emotions.md`).
9. Export a GLB with the armature, skinning and shape keys on (see the `fermata-character-import` skill for the exact settings).

## Headless tips

- Keep the script idempotent: it should start from the raw part files every run.
- Print a report at the end: triangle count, mesh and material count, bone count, shape-key count. Keep it with your notes.
