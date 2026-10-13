# Face shapes (morph targets / shape keys)

Spec: `fermata-blendshape-face/1`, published 2026-10-08 at https://build.lovebird.show/face-spec/v1.json. The importer's validator follows it. **Faces and emotion names never block an upload.**

## How the face is driven in the show

- **Blinks**: procedural, every 2.8 to 5.5 seconds.
- **Mouth**: driven from the character's real voice audio through the same lip-sync every MetaHuman gets, then mapped to ARKit mouth channels.
- **Emotion**: one whole-face `EMO_` pose at a time, chosen by what the character is feeling in the conversation. Talking and blinking are layered on top of it.

So: author every shape from the neutral face (mouth closed, eyes open), at full strength at weight 1.0. Never pre-scale. Keep emotion poses with the jaw nearly closed and the eyes open.

## Name matching

Case-insensitive after normalising: every non-alphanumeric character is stripped, a trailing `_L` `_R` `.L` `.R` becomes Left/Right, and one leading `arkit`, `blendshape`, `bs` or `shapekey` prefix is dropped. So `eyeBlink_L`, `EyeBlinkLeft` and `bs_eyeBlinkLeft` all match `eyeBlinkLeft`. If two shapes normalise to the same name, the first one is used.

## Required, recommended, optional

| Group | Required | Recommended / optional |
|---|---|---|
| Blink | eyeBlinkLeft, eyeBlinkRight | eyeSquintLeft/Right, eyeWideLeft/Right |
| Mouth | jawOpen, mouthFunnel, mouthPucker, mouthClose | Recommended: mouthSmileLeft/Right, mouthStretchLeft/Right, mouthRollLower, mouthRollUpper, mouthLowerDownLeft/Right, mouthUpperUpLeft/Right, mouthPressLeft/Right. Optional: any other ARKit 52 name (mouthFrown, mouthDimple, mouthShrug, mouthLeft/Right, jawForward/Left/Right, tongueOut, brow*, cheekPuff, cheekSquint, noseSneer) |
| Emotion (core 15) | EMO_Happy, EMO_Sad, EMO_Angry, EMO_Surprised, EMO_Affectionate, EMO_Anxious, EMO_Defensive, EMO_Domineering, EMO_Belligerent, EMO_Scornful, EMO_Repulsed, EMO_Silly, EMO_Validated, EMO_Whiny, EMO_Interested | |
| Emotion (optional 22) | | EMO_Ashamed, EMO_Awkward, EMO_Bored, EMO_Desperate, EMO_Drunk, EMO_Embarassed, EMO_Exhausted, EMO_Focused, EMO_Hopeless, EMO_Horny, EMO_Hungover, EMO_Insecure, EMO_Jealous, EMO_Lonely, EMO_Nostalgic, EMO_Proud, EMO_Resentful, EMO_Sick, EMO_Smug, EMO_Spiraling, EMO_Suspicious, EMO_Villainous |

The official tag is spelled `Embarassed`; `EMO_Embarrassed` is accepted as an alias.

The 15 core emotions are exactly the ones live conversation can reach today. What the conversation feels, and which shape answers:

| Conversation label | Plays |
|---|---|
| JOY | EMO_Happy |
| SADNESS | EMO_Sad |
| ANGER | EMO_Angry |
| SURPRISE | EMO_Surprised |
| AFFECTION | EMO_Affectionate |
| TENSION | EMO_Anxious |
| DEFENSIVENESS | EMO_Defensive |
| DOMINEERING, CRITICISM, STONEWALLING | EMO_Domineering |
| BELLIGERENCE | EMO_Belligerent |
| CONTEMPT | EMO_Scornful |
| DISGUST | EMO_Repulsed |
| HUMOR, TENSE_HUMOR | EMO_Silly |
| VALIDATION | EMO_Validated |
| WHINING | EMO_Whiny |
| INTEREST | EMO_Interested |

The web gallery also maps its own mood words: happy, delighted, laughing to Happy; flirty to Affectionate; nervous to Anxious; sassy to Domineering; smug to Scornful; disgusted to Repulsed.

## Face levels on the Body check page

| Level | Means |
|---|---|
| FULL | Every required blink, mouth and core-emotion shape is present. |
| PARTIAL | Uploads with notes. A missing emotion shows a neutral face; the game never borrows another emotion's shape. |
| CUSTOM | Any `EMO_` name not on the official list (EMO_Love, EMO_Fear, EMO_Neutral, EMO_Mischief) is kept as a custom emotion the character can play. |
| NONE | No shapes. The body uploads; the face will not emote or lip-sync. |

**Custom emotion names are real and kept**, but the live conversation only asks for the 15 core labels above. A character whose file has only EMO_Fear, EMO_Love and EMO_Disgust will rarely show them in a scene, because the conversation asks for Anxious, Affectionate and Repulsed. If you have those poses, name them (or duplicate them as) EMO_Anxious, EMO_Affectionate and EMO_Repulsed. This was the cause of a real show-week bug report: the expression preview showed only the official names, so custom rows had nothing to play (fixed so every EMO_ shape gets its own row; the naming advice stands).

## Viseme-built faces

If the face has viseme shapes (`aa`, `oh`, `PP`, `FF`, `TH` ...) instead of ARKit names, upload anyway. On the Body check page open **Advanced · for riggers > Custom Visemes** and point each ARKit channel at the shape that should answer it. Several channels can share one shape; the strongest wins. It saves as `visemeAlias` (channel to shape) and `mouthRemap` (shape to channels).

## Blender quick recipe

- Shape keys live on the head mesh (or the single body mesh). Basis = neutral.
- Rename keys to the canonical names above. Prefixes like `bs_` are forgiven, spaces are not a problem, but spell the words right.
- Export with **Shape Keys** on. Names travel in `mesh.extras.targetNames`. If the checker reports "unnamed target", the exporter dropped the names: re-export from Blender rather than a converter.
- Test each key at 0, 0.5 and 1.0. Fix the eyelid poking through the eyeball at 1.0 before you upload; the game will hit 1.0.

## MetaHuman faces

MetaHuman faces are driven by control curves (CTRL_expressions) inside MetaHuman tooling. For this importer you need morph targets in the GLB. Export the face with its morph targets included; ARKit-named targets are what the lip-sync table produces.

## Coming with the universal-expressions release

Accepted once the universal-expressions release is live. Check `rulesPendingRelease.live` in the live spec: if it is not `true`, use the canonical names above.

- ARKit 52 stays canonical. Also mapped: MetaHuman `CTRL_expressions_*` (browRaiseInL, mouthCornerPullL/R, mouthCornerDepressL/R, eyeWidenL, noseWrinkleL, jawOpen, mouthLipsPurse*, mouthFunnel*); Character Creator (Mouth_Smile_L, Brow_Raise_Inner_L, Eye_Squint_L); VRM/VRoid (Fcl_ALL_Joy/Angry/Sorrow/Fun/Surprised as emotions, Fcl_MTH_A/O, A/I/U/E/O, aa/oh/ou/ee/ih); Oculus / Ready Player Me `viseme_*`.
- Matching ignores case, underscores, side suffixes (_L, .L, L, Left) and the prefixes arkit, blendShape1., bs, Wolf3D_Head., A01_, Genesis8 facs_bs_.
- Unrecognised morphs are kept as custom channels and never cause an error.
- Emotions: any `EMO_<Name>`, `Emotion_<Name>`, `Expr_<Name>` or `emotion:<name>` is an emotion. Words resolve by family: Fear covers nervous, anxious, scared; Love covers flirty, affectionate; Disgust covers repulsed. So EMO_Fear, EMO_Love and EMO_Disgust will answer the conversation directly.
- Fallback per emotion: its own shape, then a same-family shape, then a recipe built from ARKit channels, then the nearest preset, then neutral.
- Guidance after release: name whole-face poses `EMO_<AnyWord>`; with ARKit or MetaHuman channels you need no EMO_ shapes at all.
- Gallery owners can then edit any emotion live with the **Expressions** button in the talk view.
