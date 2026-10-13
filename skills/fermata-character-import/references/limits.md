# Limits and budgets

The live spec's `limits` block is current; this page explains it.

## Enforced (the upload stops)

| Limit | Value | What you see |
|---|---|---|
| File size | 250 MB | HTTP 413: "This file is larger than 250 MB. Make a smaller GLB or FBX, then choose it here. The character record is safe." |
| File type | `.glb` or `.fbx` | The file picker will not offer anything else. |
| Skeletons | one per file | "This file has N separate skeletons. Love Bird drives one..." |
| Movement | a non-humanoid must map one clip to Idle | "This rig is not a supported humanoid. In Movement, map one of its clips to Idle before continuing." |
| Name | 48 characters, fixed after creation | |

## Budgets (uploads anyway; affects everyone watching)

Love Bird Live renders several characters at once, often on phones over mobile data. These are the numbers Fermata builds its own cast to:

| Target | Triangles (whole character, all parts) | Textures |
|---|---|---|
| Phone, one of a crowd | 4,000 to 8,000 | 1024 px |
| Browser hero | 8,000 to 18,000 | up to 2048 px for the face or body |

`glb-check.mjs` warns above 60,000 rendered triangles, any texture over 2048 px, and more than 8 materials. Give the face about a third of the triangle budget if expressions matter.

## Getting a heavy file under budget (Blender)

- **Triangles**: Decimate modifier (Collapse) on clothes and body; keep the face and hands denser. Apply before export. Check shape keys survive (Decimate destroys shape keys on the mesh it touches: decimate a copy without keys, or decimate before authoring keys).
- **Textures**: Image Editor > Image > Resize to 2048 or 1024; or bake several materials onto one atlas. 4K textures from generators are the usual cause of 100+ MB files.
- **Materials**: join meshes that share a material; bake small materials into one atlas. Each material is a draw call per character per frame.
- **Size**: if the file is still over 250 MB after the above, enable Draco compression in the exporter.

Example measured on a real file: a MetaHuman-skeleton character at 70.9 MB with 85,276 triangles, 19 materials and three 4096 px textures. It uploads, but the checker flags it for phones: resize the three textures to 2048 and merge materials before the show.
