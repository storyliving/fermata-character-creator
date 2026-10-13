# Blinks, mouth, and emotions (the face contract)

This is the public face contract used by build.lovebird.show (`fermata-blendshape-face/1`). The live copy is at https://build.lovebird.show/face-spec/v1.json. If this page and the live site disagree, the site wins.

A face is a set of **shape keys** (morph targets) on the head mesh. The base mesh with every shape at 0 is the neutral face: mouth closed, eyes open. A shape at 1.0 is full strength. Never pre-scale a shape; the runtime scales it.

## Naming

Use the canonical spelling below. The importer forgives exporter noise: it ignores case, underscores and spaces, reads a trailing `_L`/`_R`/`.L`/`.R` as Left/Right, and strips one leading `arkit`, `blendshape`, `bs` or `shapekey`. Two names that become the same after that are a duplicate: rename one.

## Blink (required)

`eyeBlinkLeft`, `eyeBlinkRight`: eyelid fully closed at 1.0. The runtime blinks every few seconds on its own.

Optional: `eyeSquintLeft`, `eyeSquintRight`, `eyeWideLeft`, `eyeWideRight`.

## Mouth (required for talking)

`jawOpen`, `mouthFunnel`, `mouthPucker`, `mouthClose`. Author each from neutral with no emotion baked in. The mouth is driven from the character's voice, so these four carry the talking.

Recommended: `mouthSmileLeft/Right`, `mouthStretchLeft/Right`, `mouthRollLower`, `mouthRollUpper`, `mouthLowerDownLeft/Right`, `mouthUpperUpLeft/Right`, `mouthPressLeft/Right`.

Optional: `mouthFrownLeft/Right`, `mouthDimpleLeft/Right`, `mouthShrugLower/Upper`, `mouthLeft/Right`, `jawForward`, `jawLeft`, `jawRight`, `tongueOut`, `browDownLeft/Right`, `browInnerUp`, `browOuterUpLeft/Right`, `cheekPuff`, `cheekSquintLeft/Right`, `noseSneerLeft/Right`.

These are the ARKit-style names. **Beaks, snouts and muzzles**: keep the same names and make them mean the equivalent motion for your anatomy. `jawOpen` opens the lower beak or jaw; `mouthPucker` and `mouthFunnel` narrow the mouth; smile and frown move the mouth corners or beak line; brow shapes move brow ridges, crests or feathers above the eyes.

## Emotions (whole-face poses)

One whole-face pose per emotion, named `EMO_<Emotion>`. Brows, eyes, cheeks and mouth corners do the acting. **Keep the jaw nearly closed and the eyelids open**: talking and blinking are layered on top of the emotion, so an emotion with an open mouth will stack with `jawOpen` and over-open, and one that presses the lips will fight `mouthClose`. Do not bake lip sync or blinks into an emotion.

The 15 core emotions the conversation reaches:

`EMO_Happy`, `EMO_Sad`, `EMO_Angry`, `EMO_Surprised`, `EMO_Affectionate`, `EMO_Anxious`, `EMO_Defensive`, `EMO_Domineering`, `EMO_Belligerent`, `EMO_Scornful`, `EMO_Repulsed`, `EMO_Silly`, `EMO_Validated`, `EMO_Whiny`, `EMO_Interested`.

Optional extras: `EMO_Ashamed`, `EMO_Awkward`, `EMO_Bored`, `EMO_Desperate`, `EMO_Drunk`, `EMO_Embarassed` (that spelling; `EMO_Embarrassed` is accepted), `EMO_Exhausted`, `EMO_Focused`, `EMO_Hopeless`, `EMO_Horny`, `EMO_Hungover`, `EMO_Insecure`, `EMO_Jealous`, `EMO_Lonely`, `EMO_Nostalgic`, `EMO_Proud`, `EMO_Resentful`, `EMO_Sick`, `EMO_Smug`, `EMO_Spiraling`, `EMO_Suspicious`, `EMO_Villainous`.

Any other `EMO_<Word>` is accepted as a custom emotion. A missing emotion falls back to the neutral face; it never borrows another emotion's shape, and a missing emotion never blocks an upload.

## Authoring recipe

1. Start with the four mouth shapes and the two blinks. Test each at 0, 0.5 and 1.0.
2. Add the 15 core emotions, mostly brows, eyes, cheeks and mouth corners. A quick check: with every emotion at 1.0, the jaw should still look closed.
3. Fix intersections at full strength (an eyelid poking through the eyeball, teeth through lips), because the runtime will hit 1.0.
4. Eyelashes or other face meshes that carry the same shapes must use byte-identical names so they move in sync.
5. Export with shape keys on. In Blender's glTF export, the names travel with the mesh; do not retype them.
6. Check the result with the `fermata-character-import` checker.

## Non-face character motion

Non-humanoid characters also need an idle clip. Wings, tails, ears and beaks can have extra clips. See the import skill's `animation.md`.
