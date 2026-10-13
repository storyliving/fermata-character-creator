# Animation clips

This page describes how the importer and the show pick animation clips. The live spec's `animation` block overrides it.

## Do they need clips at all?

- **Supported humanoid** (see `rig.md`): no. It inherits every Love Bird body animation. Clips in the file stay available as extra moves.
- **Anything else**: yes, at least one, mapped to Idle on the Movement page.

## Name clips so the stage finds them without mapping

In conversation the stage looks for a clip for the current emotion, in this order:

| State | Looks for |
|---|---|
| Listening / waiting | `<Emotion>_Idle` (for example `Happy_Idle`), then the base idle |
| Speaking | `<Emotion>_Talking`, then `<Emotion>_Talk`, then the base talk clip, then the emotion's idle, then the base idle |
| Thinking | the think clip, then `<Emotion>_Idle`, then the base idle |

Emotion is capitalised (`Happy`) or lower-case (`happy`); both are tried. The base pair is `Neutral_Idle` and `Neutral_Talking`. The emotions the web stage asks for: neutral, happy, delighted, laughing, sad, angry, surprised, flirty, nervous, sassy, smug, disgusted. A minimal expressive set:

```
Neutral_Idle   Neutral_Talking
Happy_Idle     Happy_Talking
Sad_Idle       Sad_Talking
Angry_Idle     Angry_Talking
Surprised_Idle
Flirty_Idle    Flirty_Talking
Nervous_Idle
```

Every clip you leave out falls back to the next one in the chain, so the character never freezes.

## The role vocabulary (Movement page)

On the Movement page ("Do you want to direct how they move?" > **Customize movement**) you assign clips to roles. A role with no clip resolves through a fallback chain and ends in procedural motion driven from the rig's detected parts, so the engine never meets a role it cannot play.

| Group | Roles (bold = every character is expected to cover it, by clip or procedurally) |
|---|---|
| Idle | **idle**, idle_alt |
| Moving | **walk**, run, turn |
| Emotions | **emote_happy**, **emote_sad**, **emote_angry**, **emote_surprised**, emote_afraid, emote_love |
| Talking | **talk**, listen |
| Behaviours | **sit**, **wave**, **drink**, nod, shake_head, shrug, point, look_around, celebrate, dance, stretch, ruffle |
| Crew and props | operate_camera, camera_carry, mix_drink, carry_tray |

Custom roles are allowed as `custom.<slug>` (lower-case letters, digits, underscore, up to 40 characters).

Priority if you are animating from scratch: idle, talk, walk, emote_happy, emote_sad, emote_angry, emote_surprised, wave. That covers almost every scene.

## Rules the importer warns about

- **Idle must not carry root motion.** "idle clip has root motion: the character will drift while standing." Remove translation keys on the root/hips from idles (in Blender, delete the X/Y location F-curves of the root bone for that action). `glb-check.mjs` measures the net travel.
- **Walk must loop.** "walk clip is marked non-looping: walking will stutter at the loop point." Match first and last poses; the stage crossfades seamed loops but a clean loop looks better.
- Clips must actually move: a clip whose tracks are constant, a zero-length clip, or a `T_Pose` / `Reference_Idle` clip is not used as the idle.
- One animation clip per Blender action. Name actions before export; unnamed clips arrive as "Untitled movement".

## Separate animation files

You can also add clips on the Movement page from separate GLB or FBX files (for example Mixamo downloads) instead of baking them into the body file. Use the same skeleton the body uses.

## Coming with the universal-expressions release

Accepted once the universal-expressions release is live. Check `rulesPendingRelease.live` in the live spec: if it is not `true`, use the canonical names above.

- `<Emotion>_Idle` / `<Emotion>_Talking` stays recommended.
- Also accepted: `Idle_<Emotion>`, `<Emotion>_Talk`, camelCase `happyIdle`, Blender `Armature|Happy_Idle`, `emotion:<name>` and `emotion=<name>:talk`, glTF animation extras `{"emotion":"smug","kind":"talk"}`, and a bare emotion word (`Smug`).
- Any word before `_Idle` / `_Talking` registers a new emotion. Behaviour words (walk, wave, sit, run) are never emotions.
