# Skeletons and rigs

The classifier below is the one the importer runs; `scripts/vendor/` holds a copy so `glb-check.mjs` gives the same verdict the site will.

There are exactly two animation paths. The Body check page tells you which one a file takes.

## Path 1: supported humanoid, no clips needed

A body that passes inherits every Love Bird body animation (idles, walks, talking gestures, emotional reactions) retargeted onto its own proportions. Stylised arms, legs and torsos are fine.

**The rule:** the classifier maps bone names to 22 roles, every one of the 14 required roles must be mapped, and the weighted confidence must be at least 0.80.

| | Roles |
|---|---|
| Required (weight 1.0) | pelvis, head, upperarm_l, lowerarm_l, hand_l, upperarm_r, lowerarm_r, hand_r, thigh_l, calf_l, foot_l, thigh_r, calf_r, foot_r |
| Optional (weight 0.3) | spine_lo, spine_mid, spine_hi, neck, clavicle_l, clavicle_r, toe_l, toe_r |

**How names are read:** only the text after the last `:` or `|`; split on camelCase, digits and any non-letter; lower-case. Then the first matching rule wins:

| Role | Any of these tokens |
|---|---|
| clavicle | clavicle, shoulder, collar, collarbone, clav |
| lowerarm | forearm, lowerarm, elbow, or fore+arm, lower+arm |
| upperarm | upperarm, uparm, or upper+arm, up+arm; plain `arm` (0.9) |
| hand | hand, wrist |
| thigh | thigh, upleg, upperleg, or upper+leg, up+leg |
| calf | calf, shin, lowerleg, knee, or lower+leg; plain `leg` (0.9) |
| foot | foot, ankle |
| toe | toe, toes, toebase, ball |
| pelvis | pelvis, hips, hip |
| spine | spine, abdomen, torso, waist; tokens starting chest/upperchest |
| neck, head | neck, head |

- Sides: a token exactly `l` / `left` or `r` / `right`. A sided bone with no side token is ignored. So `L_Thigh`, `thigh_l`, `LeftUpLeg`, `mixamorig:LeftUpLeg` all work; `ThighLeft01` works; `Thigh.001` does not.
- Bones containing any of these tokens are skipped: twist, roll, corrective, ik, pole, target, end, nub, tip, jaw, eye, lid, brow, teeth, tongue, hair, fingers (thumb, index, middle, ring, pinky), cloth, skirt, tail, wing, ear, lip, cheek, nose, helper, proxy.
- Thighs, head and upper arms must sit under the pelvis in the hierarchy.

Recognised conventions (a label only; it never decides acceptance): MetaHuman / mannequin-style, Mixamo, VRM / VRoid, CC / iClone, Rigify (DEF- bones), 3ds Max Biped, Unity Humanoid, Mixamo-like (Ready Player Me, Meshy, Tripo), generic.

**Proportions that retarget cleanly:** leg length 0.9x to 1.3x the reference; usable down to 0.75x. Below about 0.8x the foot IK clamps on some frames (measured: 0.8x 6.7% of frames, 0.6x 24%).

Rigify tip: export the DEF- deform bones only (uncheck the control rig, or use "Deform Bones Only" in the exporter).

## MetaHuman-named skeletons

If your skeleton uses MetaHuman bone names, the upload pre-check looks for these 26 names: root, pelvis, spine_01 to spine_05, neck_01, neck_02, head, clavicle_l/r, upperarm_l/r, lowerarm_l/r, hand_l/r, thigh_l/r, calf_l/r, foot_l/r, ball_l/r.

The show applies a stricter check to a MetaHuman-named body: same bone names and parents as the reference body, each bone length within 5 percent and rest rotations within 5 degrees. A stylized body or one with extra bones can fail it; the character still loads and plays its own clips, it just is not driven by the shared body animations. A MetaHuman export where the face mesh carries its own copy of the body bones still counts as one skeleton, because bones are matched by name. Face shapes can live on the head mesh or the single body mesh.

A rig missing spine_04, spine_05 or neck_02 still passes the humanoid check (Path 1); it just is not identical to the reference body.

## Path 2: everything else brings its own movement

Birds, four-legged and many-legged creatures, spiders, cars, props and unrecognised humanoids are welcome. The importer never pretends humanoid motion can drive an unknown skeleton. You must:

1. Include at least one animation clip in the GLB.
2. On the Movement page, map one clip to **Idle**. Talk and emotions are optional; missing roles fall back to related clips, then to procedural motion driven from the parts the importer can identify.

Name the moving parts plainly so the procedural fallbacks find them. The importer looks for these node names:

| Part | Names it recognises |
|---|---|
| body | `body`, `body_...` |
| legs | `leg_1`, `leg1`, `leg_2_Mesh` ... |
| arms | `arm_...`, `hand_...`, `forearm_...`, `upperarm_...` |
| eyes | `eye_L`, `eye_R`, `eyeball_1` |
| eyelids | `eyelid_upper_L`, `eyelid_lower_R` |
| brows | `brow_L`, `brow_1` |
| wings, tails, wheels | `wing_...`, `tail_...`, `wheel_...` |

A file with no bones at all can still appear as one rigid piece. For a bird or creature you are rigging yourself, `animation.md` lists the roles worth authoring clips for, in priority order.

## The one-skeleton rule

Any number of skinned meshes may share one armature. Two unrelated armatures in one file are refused with:

> This file has 2 separate skeletons. Love Bird drives one: parent every skinned mesh (head, body, clothes) to the same armature.

Fix in Blender: select each mesh, set its Armature modifier to the main armature, and `Parent > Armature Deform` to it; delete the extra armature. Clothing from Marvelous Designer or a separate rig needs its weights transferred (Data Transfer modifier, Vertex Groups) to the main armature.

## Coming with the universal-expressions release

Accepted once the universal-expressions release is live. Check `rulesPendingRelease.live` in the live spec: if it is not `true`, use the canonical names above.

- Non-humanoid rigs have no requirements. Bones named `head`, `jaw` / `beak_lower` / `mandible`, `tail*`, `wing*` and `ear*` get emote motion and beak lip-sync automatically. Until then, Path 2 above (map one clip to Idle) applies.
