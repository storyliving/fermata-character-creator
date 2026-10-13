# Rigging that survives the boat

Generic rules, learned the hard way.

## One armature

Head, body and clothes may be separate meshes, but all of them must be skinned to the SAME armature. Two unrelated armatures in one file are refused by the importer.

## Put every joint at the joint

The shoulder joint belongs at the center of the shoulder ball (the middle of the sleeve head or the arm socket), not at the armpit and not at the bottom of the arm. A joint that sits too low makes the sleeve or shoulder pad stay behind while the arm swings, and the arm looks broken partway down. The same goes for the elbow (center of the elbow), wrist (at the cuff), hip, knee, neck base and jaw hinge. Check by raising the arm to 90 and 160 degrees and to the front: the whole shoulder should turn with the arm.

## Weights: no seams

- Vertices that touch, or sit within a few millimeters of each other (across a seam, or between the inner and outer wall of a thick garment), must carry identical weights. If they do not, the mesh tears when the pose changes. Generated meshes often come as thousands of tiny islands: weld weights across them (copy weights between coincident vertices, then smooth along the surface).
- Make the blend between bones smooth along the surface, not per mesh island.
- At most 4 bone influences per vertex, normalized.
- Test extremes: arms raised, arms across the chest, deep bends. Look for holes, flaps and white slivers.

## Hands and fingers

Hands that matter need finger bones, and so do gloves. A glove that is one rigid piece reads as a static mitten. Give each hand a chain per finger (three bones per finger, two for the thumb is acceptable), skin the glove or hand mesh to them, and keep a few poses ready: relaxed, fist, point, open. Check that fingers do not poke through each other or the body.

## Standing poses

A hand on the hip should rest against the hip, with the forearm angled in, the wrist straight and the elbow out to the side. Check it from the front, three-quarter and back. If it reads floating or broken, fix the joint positions and weights before adding more clips.

## Non-human rigs

Birds, creatures and props need at least one animation clip (an idle). Name the moving parts plainly: `wing_L`, `wing_R`, `tail`, `ear_L`, `jaw` or `beak_lower`, `eye_L`, `eye_R`, `eyelid_upper_L`. See the `fermata-character-import` skill for what the importer looks for.

## Keep clips honest

An idle that loops, a blink, a talk loop and one reaction are enough to start. Make every clip start and end on the neutral pose so they blend. Never leave the jaw open outside talking.
