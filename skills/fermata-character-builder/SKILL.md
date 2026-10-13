---
name: fermata-character-builder
description: Build an original, expressive, game-ready 3D character from a reference image using Tripo and Blender (or any 3D tool, or headless scripts) by taking it apart into separate parts, generating each part, and reassembling, rigging and animating it with blinks, face shapes and emotions. Works for humans and non-humans (birds with beaks, dogs, cats, aliens, creatures). Use when someone wants to turn a character idea or image into a GLB with parts that move, set a safe triangle budget, add blink / mouth / emotion shapes, add a rig, hands and fingers, or use MetaHuman and MetaTailor tooling to make a stylized low-poly character. When the character is ready, hand off to the fermata-character-import skill to get it onto the boat at build.lovebird.show.
---

# Fermata Character Builder

Build a performer, not a statue. The idea is simple: **take the picture apart, generate each part on its own, put it back together, then make it blink, talk and feel things.**

You (the assistant) do the thinking, the scripting and the checking. The person brings the idea and approves the look.

## 0. Start with a one-minute brief

Ask only what changes the build:

- What is it? (human, bird, dog, cat, alien, robot, creature) and what must be unmistakable at thumbnail size?
- What must move: eyes, lids, mouth or beak, head, hands, wings, tail, ears, props?
- Where will it be seen: a phone browser, a desktop browser, or both? Phones decide the budget.
- Do they already have an image, a Tripo model, a Blender file, or a MetaHuman? Start from what they have.

## 1. Take the reference apart (decomposition)

Read `references/decomposition.md`. In short: make one neutral, front-facing master image, then one clean **part plate** per piece that needs its own motion or its own material: head shell, each eye (with pupil), upper and lower lids, jaw or upper and lower beak, torso, each limb or wing, hands (with fingers), hair, tail, clothes, props. One object per plate, plain background, no cast shadows, same lighting on every plate.

## 2. Generate each part in Tripo

Read `references/tripo-pipeline.md`. One part at a time. Check the mesh before texturing. Pick a triangle budget first (section 4). Reject fused eyes, sealed mouths, doubled surfaces and hidden geometry.

## 3. Reassemble in Blender (or any 3D tool, or headless)

Read `references/assembly.md`. Import every part at one scale, set pivots at real joints, apply transforms, name parts, put them back together, and compare to the master image from the front, three-quarter, side and silhouette. It works through the Blender MCP, through the Blender UI, or fully headless with `blender -b --python`.

## 4. Choose the budget before you generate

| Target | Triangles, whole character | Textures |
|---|---|---|
| Phone, one of a crowd | 4,000 to 8,000 | 1024 px |
| Browser hero | 8,000 to 18,000 | up to 2048 px on face or body |
| Anything heavier | warn the person it will cost frame rate on phones | 2048 px max |

Give the face about a third of the triangles if expressions matter. Count every visible part together.

## 5. Rig it, then give it a face

Read `references/rigging.md` (one armature, joint placement, hands with finger bones, clean weights) and `references/face-and-emotions.md` (the blink, mouth and emotion shapes the boat expects, and how to author them). A character with eyes, blink, mouth open/close and a handful of readable emotions is a performer.

## 6. Custom MetaHumans

If the person wants a stylized or custom MetaHuman, read `references/metahuman-and-metatailor.md`.

## 7. Export and check

Export one GLB with the armature, all shape keys and a short idle. Then switch to the **fermata-character-import** skill. It checks the file against the same rules the site uses, walks the upload, and fixes what the site rejects.

## 8. Teach us what you learned

If the person found a trick that worked (a better way to split a dog's ears, a bird beak rig, an alien with three eyes), offer to turn it into a short recipe in `learnings/` using `learnings/TEMPLATE.md`. See `CONTRIBUTING.md`. Contributions must never contain passwords, tokens or private files.

## Ground rules

- Never describe a static render as a working character. Done means it moves, blinks, talks and passes the import check.
- Never invent numbers, button names or bone names. If unsure, run the checker or look at the live site.
- Do not paste or ask for anyone's passwords, API keys or login tokens.
- Original characters only, or characters the person has permission to use.
