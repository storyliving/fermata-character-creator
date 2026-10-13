# Recipe: four-legged pet (dog or cat)

- **Character type:** quadruped
- **Author:** Fermata team
- **Status:** **untested idea** (written from general technique, not yet run end to end through the boat)
- **Date:** 2026-10

## The tricky part

Four legs do not match the humanoid skeleton the importer recognizes, so the character takes the "bring your own movement" path. Floppy ears and a tail also want secondary motion.

## Parts we would split it into

Head shell, jaw, nose, tongue, two ears, two eyeballs with lids, torso, four legs (each with paw), tail, collar and clothes.

## Generation notes

Generate ears as separate parts so they can move on their own. Generate the jaw separately if you want it to open. Keep paws simple.

## Assembly and rig

- Name the legs `leg_1` to `leg_4` (or `leg_front_L`, etc.) and the ears `ear_L`, `ear_R`, the tail `tail`, the jaw `jaw`.
- One armature with a spine chain, four leg chains and tail and ear chains.
- Author at least an idle clip (breathing, tail sway). A walk is a bonus.

## Face and emotions

Use the same face contract. A dog's `jawOpen` opens the jaw; smile and frown move the lip line; ears and brow ridges do a lot of the emotional acting, so make good `EMO_` poses that include ear positions if your ears are on the face mesh, or ear clips if they are bones.

## Import result

Non-humanoid path: one clip mapped to Idle.

## Do differently next time

Please tell us. This is an open invitation to be the first.
