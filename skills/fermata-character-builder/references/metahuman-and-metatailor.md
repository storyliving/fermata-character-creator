# Custom MetaHumans, MetaTailor, and low-poly game-ready export

For stylized or realistic human characters you can start from a MetaHuman instead of generating a body in Tripo. The goal is the same as everywhere else in this skill: a **low-poly, game-ready GLB** with a MetaHuman-named skeleton and face shape keys, uploaded at https://build.lovebird.show/import/custom.

Official links (check these yourself, products change):

- MetaHuman: https://www.metahuman.com and https://dev.epicgames.com/documentation/en-us/metahuman
- Make a MetaHuman from your own head mesh: https://dev.epicgames.com/documentation/en-us/metahuman/from-mesh and https://dev.epicgames.com/documentation/en-us/metahuman/from-template-mesh
- Topology-preserving wrap for fitting a head sculpt to MetaHuman topology: https://faceform.com/wrap/
- **MetaTailor**, a Windows tool by Hologress for fitting clothing to humanoid avatars, including MetaHumans: https://www.metatailor.com . Check the site for current pricing, licenses and export options before promising anything; the free and Pro tiers have different features.
- Blender: https://www.blender.org

## A route that works on paper

1. **Character.** Make the character in MetaHuman (from a preset, or from your own sculpted head via the From Mesh / From Template Mesh routes above, or a wrap).
2. **Clothing.** Dress the body with MetaTailor, or make clothes in any DCC and fit them to the body. Keep clothing meshes low-poly.
3. **Low-poly.** Aim for the phone or browser budget in `SKILL.md`. Reduce triangles on body, clothes and hair; keep the face denser than the body. Merge materials and resize textures to 2048 px or less. Hair cards are cheaper than strands.
4. **Blender.** Bring the body, face and clothes into Blender (FBX is the usual hand-off from these tools). Parent every skinned mesh to ONE armature that keeps the MetaHuman bone names. Check the importer's 26 required body bones with the import skill's checker.
5. **Face shapes.** The importer needs morph targets in the GLB. Export the face with its shape keys; ARKit-style names (see `face-and-emotions.md`) are the safest. If the face shapes come out under other names, rename them to the contract names.
6. **Export** one GLB (see the import skill, `formats.md`), run the checker, and upload.

## What is verified and what is not

Verified here: the official sites above exist; the importer accepts a MetaHuman-skeleton GLB with shape keys as ONE file (see the `fermata-character-import` skill and the live spec); the budgets and the face shape names.

Not verified end to end by this repository: the exact export menus of each third-party tool and version. Treat steps 2 to 4 as the route to try, then check the result with the checker, and tell us what worked (see `CONTRIBUTING.md`). Mark anything you did not test as an *untested idea* in your recipe.

## Common problems

- **Too heavy**: a MetaHuman exported as is can be tens of thousands of triangles with many 4096 px textures. Reduce before upload.
- **Two armatures**: face and body exported separately, each with its own skeleton. Merge into one armature, or make sure both carry the same bone names (same-named bone sets count as one skeleton).
- **No face motion**: the face came out as an FBX or without shape keys. Re-export as GLB with shape keys on.
- **Hair or clothing tears at the shoulders**: re-weight as described in `rigging.md`.
