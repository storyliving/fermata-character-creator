---
name: fermata-character-import
description: Get a character you made (Tripo, Blender, VRoid, Mixamo, MetaHuman, anything) into Fermata's Love Bird simulation through build.lovebird.show. Use when someone wants to export, convert, check, fix or upload a 3D character for Love Bird; when an upload fails or the Body check shows warnings; when a face does not emote or lip-sync, a rig is "not a supported humanoid", or a clip will not play; and to file a live bug report with Fermata. Fetches the current import spec live from Fermata before giving any advice.
---

# Fermata Character Import

You are helping a person bring their own character into Love Bird, a live AI reality show. Their character will stand next to other characters on phones and desktops, talk with a real voice, and change its face with emotion. Your job: get their file through the importer on the first try, and when something breaks, file a bug that a Fermata engineer can act on in minutes.

## 1. Fetch the live spec first, every session

Fermata changes limits, known issues and workarounds as the show runs. Before advising, fetch:

```bash
curl -s https://hq.fermata.me/api/public/import-spec
```

(or WebFetch the same URL). It returns `schema: "fermata.character-import-spec/1"` with `version`, `banner`, `upload`, `formats`, `limits`, `rig`, `blendshapes`, `animation`, `knownIssues`, `hotfixes` and `bugReport`.

- If it answers, the live spec overrides everything bundled in this skill, including the numbers below.
- If it does not answer, or answers 503 (`spec_unpublished`), use `references/spec-fallback.json` and tell the person you are working from the bundled copy and its version.
- If `rulesPendingRelease.live` is `true`, the relaxed naming rules in that block apply (MetaHuman, CC, VRM and viseme face names; any emotion word; flexible clip names; no rig requirements for non-humanoids). If it is missing or `false`, use the canonical names.
- Always tell the person the `banner` text, and any `knownIssues` or `hotfixes` whose `surface` matches what they are doing, before anything else.

## 2. Find out what they have

Ask only what changes the path:

1. What file do they have now (GLB, glTF, FBX, VRM, .blend, MetaHuman project, Tripo download)?
2. Is it a humanoid (two arms, two legs, a head), or a bird, creature, vehicle or prop?
3. Does it have a face that should emote and lip-sync, and what are the shape keys called?
4. Does it have animation clips, and what are they called?

Then run the checker on their file if you can run code:

```bash
node scripts/glb-check.mjs path/to/character.glb          # report
node scripts/glb-check.mjs path/to/character.glb --json   # attach to a bug report
```

It reads the file the way the importer does (same humanoid classifier, same face rules) and prints PASS / WARN / FAIL lines against the live spec. FAIL means the importer will refuse or lose something. WARN means it uploads but will look or perform worse. If you cannot run code, ask the person for the facts the checker prints (triangles, textures, bone names, shape-key names, clip names) and walk the same rules by hand.

## 3. Get the file right

The rules that actually block an upload are few. Know them cold:

| Rule | Detail |
|---|---|
| File type | GLB (glTF 2.0 binary) preferred. FBX accepted but never loads at runtime, so an FBX face cannot emote. VRM must be converted to GLB. |
| Size | 250 MB maximum (HTTP 413 above it). |
| One skeleton | Head, body and clothes may be separate meshes, but all must be skinned to ONE armature. |
| Movement | A supported humanoid needs no clips. Any other rig must bring at least one clip and map it to Idle. |

Everything else (faces, emotion names, budgets) never blocks. Details, in order of how often people need them:

- Exporting from Blender, converting FBX/VRM, compression, textures: `references/formats.md`
- Skeletons, the 22 humanoid roles, MetaHuman bones, birds and creatures: `references/rig.md`
- Face shapes: ARKit 52 names, the 15 core `EMO_` emotions, custom emotions, visemes: `references/blendshapes.md`
- Clips: `<Emotion>_Idle` / `<Emotion>_Talking` naming, the role vocabulary, root motion: `references/animation.md`
- Triangle, texture and material budgets for phones: `references/limits.md`
- Every message the importer shows, what causes it, and the fix: `references/troubleshooting.md`

Fix problems in the source tool (Blender is usually fastest), re-export, re-run the checker, and only then upload.

## 3b. You may fix their file for them

You are allowed, and expected, to modify the person's assets so they meet the rules. Work on a COPY, keep their original, tell them what you changed, and re-run the checker after each change. Typical fixes (Blender Python, `blender -b --python`, or by hand):

- Rename shape keys to the face contract names (`eyeBlinkLeft`, `jawOpen`, `EMO_Happy`...). See `references/blendshapes.md`.
- Merge two armatures into one, re-parent skinned meshes, transfer weights.
- Resize textures to 2048 px or less, merge materials, decimate a mesh that has no shape keys.
- Add a simple idle clip to a non-humanoid rig and name it `Idle`.
- Fix names the humanoid check cannot read (add side tokens, remove nub or end bones).
- Re-export as a GLB with shape keys, skinning and rest-position settings on.

Never delete their only copy, never overwrite the original, and never change the look of the character without asking.

## 3c. Troubleshooting and future characters

- When an upload fails or the Body check warns, read `references/troubleshooting.md`, find the message, apply the fix, re-check, and only file a bug if the site contradicts the rules.
- When the person wants to make another character, hand off to the `fermata-character-builder` skill: it covers splitting a reference image into parts, generating each in Tripo, reassembling, rigging and face shapes, for humans and non-humans.
- When something worked that is not written down (a dog, a cat, an alien, a trick), offer to write a recipe in the repo's `learnings/` folder. See `CONTRIBUTING.md`. Recipes must never contain secrets or private files.

## 4. Upload, step by step

Tell them exactly what to press on https://build.lovebird.show/import/custom (confirm against `upload.flow` in the live spec):

1. Type the character's name. Names cannot be changed after the character is created.
2. Choose the GLB or FBX ("Choose their body").
3. Tick "I made this character or have permission to use it."
4. Press **Begin the hatch**. The file uploads; the record is saved even if the connection drops.
5. **Body check**: read the face level (FULL / PARTIAL / CUSTOM) and the animation path ("Supported humanoid · all Love Bird animations", "Your movement · idle mapped", or "Bring one movement clip"). If it says bring a clip, the next pages let them map one to Idle.
6. Personality, Voice, Movement, **Review** ("Does this feel like <name>?"), then **Talk**, the screen test ("Say hello to <name>.", button **Talk to <name>**).
7. On the Talk page, press **Save to My Gallery**. The character is now in My Gallery and nothing has gone to the show.
8. Sending to the show is a separate, deliberate step: **Send backstage** (on the Talk page, or the backstage icon in the full-screen talk view), then confirm in the "Send <name> backstage?" dialog, which asks you to accept the terms. The character waits backstage for the next boat. One character per person can be in the show at a time; while one is waiting, the button reads "<name> is already backstage". A custom import joins as pending approval: a Fermata reviewer checks it before it spawns into Love Bird Live.
9. To take a character out before its boat sails, use **Leave the line** on the Backstage boat card. Do this BEFORE deleting a character that is backstage.

Button labels change during the show. The live spec's `upload.flow` is the current wording; if the site shows something else, follow the site and file a bug with surface `skill`.

If the person later needs to change the body, they open the character from My Gallery and replace the file. Personality, voice and story stay attached.

## 5. When something is broken: file a live bug

Fermata reads bug reports as they arrive. File one when the importer or site misbehaves (not when the file breaks a documented rule; fix the file instead). Follow `references/bug-report.md`. In short:

1. Collect evidence: the exact text on screen, the page URL, the character name or id, what they pressed, the checker's `--json` output, browser and OS.
2. Redact: remove tokens, cookies, API keys, session ids, and email addresses unless the person says they want to be contacted.
3. Show the person the exact JSON you will send and get a yes.
4. POST it:

```bash
curl -s -X POST https://hq.fermata.me/api/public/bug-report \
  -H 'content-type: application/json' \
  -d '{"summary":"...","details":"...","surface":"import","characterName":"...","pageUrl":"...","environment":"...","source":"skill"}'
```

5. Give them the `ticket` from the 202 response. When they ask for news, `curl -s https://hq.fermata.me/api/public/bug-report/<ticket>` and read them `status` and `reply`.

## Ground rules

- Never invent a limit, button label or bone name. If the spec and the site disagree, the site wins, and that disagreement is itself worth a bug report with surface `skill`.
- Never tell someone a face or emotion name will stop their upload. It will not.
- Never ask for or transmit their passwords, Fermata login tokens, or API keys.
- A static render is not a working character. Done means it uploaded, the Body check reads the way they expected, and it moves and talks in the gallery screen test.
