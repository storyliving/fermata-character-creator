# Troubleshooting: what the importer says, why, and the fix

Messages are quoted from the build.lovebird.show importer. Check `knownIssues` in the live spec first: a current site bug and its workaround will be listed there.

## Upload page

| Message | Cause | Fix |
|---|---|---|
| "This file is larger than 250 MB..." | Over the size limit (HTTP 413). | Resize textures, decimate, then Draco. See `limits.md`. |
| "This browser session expired during the upload. Refresh the page, open the character in My Gallery, and choose the file again." | Session expired mid-upload (401). | Exactly what it says. The character record exists; open it from My Gallery and pick the same file. Do not create a second character. |
| "The upload permission expired..." | Signed upload ticket expired (403). | Choose the file again; a fresh ticket is made for the same character. |
| "The studio is handling too many uploads right now..." | Rate limited (429). | Wait a minute, then choose the file again from My Gallery. |
| "The connection stopped before the body arrived..." | Network drop or timeout. | Open the character in My Gallery and choose the same file. |
| "The upload service did not finish, but this character is saved in My Gallery..." | Server error (5xx) or invalid ticket. | Retry once from My Gallery. If it repeats, file a bug (surface `import`) with the time and character name. |
| "This body file was not accepted. The character record is safe; check that it is a GLB or FBX under 250 MB..." | Any other refusal. | Run `glb-check.mjs`; if the file passes, file a bug. |

## Body check page

| Message | Cause | Fix |
|---|---|---|
| "This is not a GLB file (no glTF header)." | Renamed file (an OBJ, ZIP or .gltf with a .glb name). | Export a real glTF Binary from Blender. |
| "GLB version N is not supported. Export glTF 2.0." | glTF 1.0 or an exotic exporter. | Re-export from Blender 3.6+ as glTF 2.0. |
| "The GLB has no JSON chunk first." | Corrupt or truncated file. | Re-export; check the download completed. |
| "We could not open a preview of this file: ... You can replace it now or continue and let the backstage check look again." | The browser loader failed (unsupported required extension, corrupt buffer). | Run the checker; remove exotic `extensionsRequired`; re-export. If Blender opens it fine and the site still fails, file a bug and attach the checker JSON. |
| "The body is safe, but this browser cannot look inside an FBX..." | FBX upload. | Fine for a body. For a face, convert to GLB (`formats.md`). |
| "This file has N separate skeletons. Love Bird drives one: parent every skinned mesh (head, body, clothes) to the same armature." | Two armatures. | Merge to one armature (`rig.md`). |
| "Bring one movement clip" / "This rig is not a supported humanoid. In Movement, map one of its clips to Idle before continuing." | Not a supported humanoid, no idle mapped. | Add a clip and map it to Idle, or rename bones so the humanoid classifier recognises them (`rig.md`). Run the checker to see which required roles are missing. |
| "No supported humanoid skeleton found; bring an idle clip in Movement." | Same as above. | Same. |
| "No packed textures were found..." | Textures external or the body uses flat colours. | Pack resources in Blender and re-export. |
| "I did not find separate moving parts inside this file..." | No skeleton. | Fine for a statue. To move, add an armature or plainly named parts plus a clip. |
| "No movements are stored in this file yet. You can keep going and add them later." | No clips. | A supported humanoid needs none. Others: add clips on Movement. |
| Face level PARTIAL | A required blink/mouth shape or core emotion is missing. | Uploads anyway. Add the missing shapes (`blendshapes.md`) when you can; a missing emotion shows a neutral face. |
| An expression row in Advanced does not move the face | The shape is named outside the official list, or the shape has no visible delta. | Check the name normalises as expected; test the key at 1.0 in Blender. If the shape is correct and the row still shows nothing, file a bug (surface `import`). |

## Movement page warnings

| Message | Fix |
|---|---|
| "idle clip has root motion: the character will drift while standing" | Delete root/hips location keys from the idle action. |
| "walk clip is marked non-looping: walking will stutter at the loop point" | Make first and last frames match. |
| "custom role ... has no clip and no fallback: it will breathe and look around" | Assign a clip or a fallback role. |
| "None of the N parts in this file have names. Rename them (leg, wing, wheel, tail...)" | Rename objects/bones in Blender (`rig.md`, part names). |
| "We could not tell exactly which way the limbs bend, so the first walking preview may need an adjustment." | Informational. Check the walk preview; supply a walk clip if it looks wrong. |
| "odd leg count N: gait pairs will be approximate" / "one leg: hops will stand in for walking" | Informational for creatures. Supply a walk clip for a better gait. |
| "no leg, wing or wheel limbs recognised: only whole-body procedural motion will play" | Name limbs (`leg_1`, `wing_L`, `wheel_1`) or supply clips. |

## After upload

| Symptom | Cause | Fix |
|---|---|---|
| Face does not emote in the screen test | FBX upload, or no `EMO_` shapes, or only custom emotion names the conversation never asks for. | GLB with core `EMO_` names (`blendshapes.md`). |
| Mouth does not move when they talk | Missing jawOpen / mouthClose / mouthFunnel / mouthPucker, or viseme names without a mapping. | Add the four mouth shapes or map visemes in Advanced > Custom Visemes. |
| Character is huge, tiny, lying down or facing away | Unapplied transforms, wrong scale, wrong forward axis. | `Ctrl+A > All Transforms`, 1 unit = 1 m, face -Y in Blender, +Y Up on export. |
| "<name> is already backstage" and the Send backstage button is disabled | One character per person in the show. | Use **Leave the line** on the Backstage boat card for the other character first (only before its boat sails). |
| "You already have a character on Love Bird Live" after deleting a character | Known server issue: deleting a character that was backstage did not free the slot. | Always Leave the line before deleting. If already stuck, file a bug (surface `backstage`) with both character names. |
| Name cannot be changed | Names are fixed once created. | Create a new character. |
| Character is in the gallery but not on the island | Custom imports wait for reviewer approval, and enter on the next boat. | Wait for the boat; ask the host. If nothing after two boats, file a bug (surface `boat`). |
