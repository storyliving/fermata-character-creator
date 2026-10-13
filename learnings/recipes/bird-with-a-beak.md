# Recipe: bird with a beak

- **Character type:** bird (toucan, swan, parrot, cockatoo, vulture, owl)
- **Author:** Fermata team
- **Status:** built and uploaded this way ourselves; details vary per character
- **Date:** 2026-10

## The tricky part

The beak. It has to open and close for talking, it has to fit the face snugly, and generated beaks often come out with the wrong base shape or a sealed mouth.

## Parts we split it into

Head shell (no beak, no eyes), upper beak, lower beak, two eyeballs, two eyelids, neck, torso, two wings (arms if the bird wears clothes and has hands), tail, feet, clothing, props.

## Generation notes

- Generate the upper and lower beak from their own plates, each with the base shape that mates with the face. Check the fit in 3D before texturing.
- If a generated bill keeps coming out with the wrong base, model the bill from the face mount outline in Blender and keep the generated texture style.
- Keep the beak aligned by moving and uniformly scaling it as one rigid part; do not squeeze it into place.

## Assembly and rig

- Put a hinge joint at the back of the lower beak (`jaw` or `beak_lower`). The lower beak rotates open around it.
- A long neck needs several bones (a chain of 6 to 10) for smooth S-curves.
- Wings: a short bone chain per wing. Keep a wing layer separate from body motion so wings can pose independently.

## Face and emotions

- `jawOpen` opens the lower beak. `mouthClose` seals it. A beak cannot really pucker; use `mouthFunnel` and `mouthPucker` for a narrower, forward beak line.
- Beak corners and the crest or brow ridge do the acting for smile, frown and brow shapes.
- Lids carry blinks. Check they close fully over round eyeballs.

## Numbers

A hero bird is usually 8,000 to 18,000 triangles with one 2048 px atlas.

## Import result

Birds are a non-humanoid rig: include at least one idle clip and map it to Idle on the Movement page.

## Do differently next time

Generate beaks last, once the head is final.
