# Taking a reference image apart

Generators are good at one clean object and bad at hidden seams. So never ask for the whole character and hope the parts come out separable. Split first.

## 1. The master image

One neutral, front-facing image: standing, arms slightly away from the body, mouth closed, eyes open, even soft light, plain background. This is the authority for the look. Every later step is compared back to it.

If the person only has a rough idea, make 3 master options and let them pick one. Do not move on until the master is approved.

## 2. The parts list

Write the list before generating anything. Separate any piece that needs its own motion, replacement or material.

| Character type | Typical parts |
|---|---|
| Human | head (bald), hair, torso, upper garment, lower garment, two arms, two hands (with fingers), gloves, two legs, shoes, accessories |
| Beaked bird | head shell without beak or eyes, upper beak, lower beak, two eyes, two eyelid pieces, neck, torso, two wings, tail, feet, clothing |
| Dog / cat | head shell, jaw, nose, tongue, two ears (separate, they move), two eyes with lids, torso, four legs, tail, collar and clothing |
| Alien / creature | whatever moves on its own: eyes (any number), antennae, tentacles, mouth parts, limbs |

Rule of thumb: if it blinks, talks, flaps, wags, swings or comes off, it is its own part.

## 3. Making a part plate

For each part, make one image (any image generator that can take your master as a reference):

- one object, centered, filling most of the frame
- plain, contrasting background, no floor, no cast shadow touching the object
- same lighting direction, same material language and same colors as the master
- the part in its neutral pose, un-occluded: show the full eyeball even if lids normally cover it; show the whole beak base even if it normally meets the face
- no text, no logos

Prompt shape that works (adapt freely):

> "[PART NAME] of the character in the reference image, isolated on a plain light-grey background, neutral pose, front view, soft even studio lighting, same materials and colors as the reference, single object, no shadow on the ground, no other body parts."

Make a **contact sheet** of all plates at the end and compare it to the master. Fix mismatched colors and proportions now; it is cheaper than fixing meshes.

## 4. Attachment hints

For each part, decide where it joins its neighbor (neck base, shoulder ball, hip, beak hinge) and note it. These become pivots and joint positions during assembly. If two parts must fit snugly (a beak on a face, a hand in a glove), generate the second part from an image that shows the mating surface, and check the fit in 3D before texturing.

## 5. Eyes are special

Eyes need to be real round eyeballs sitting inside sockets so they can aim and so lids can close over them. Generate each eye as its own sphere-like part (with iris and pupil painted on), and the lids as separate shells. Do not use a flat painted eye on the face.

## 6. Hands

Hands need to bend. Plan hands as their own parts with the fingers separated enough to rig (see `rigging.md`). If the character wears gloves, the gloves are the hands: skin them with finger bones.
