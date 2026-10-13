# Formats and export

Source: the build.lovebird.show importer. The live spec's `formats` block overrides this page.

## What the site accepts

| Format | Status | What happens |
|---|---|---|
| `.glb` (glTF 2.0 binary) | Preferred | Opened in the browser before upload: face level, skeleton and clips are read and shown on the Body check page. Stored unmodified. |
| `.fbx` | Accepted | The browser cannot look inside it. It is stored but never loaded in the browser or the show, so **an FBX face cannot emote or lip-sync**. |
| `.gltf` + `.bin` + textures | Not accepted directly | Repack as one `.glb` (Blender: import, then export as glTF Binary). |
| `.vrm` | Not accepted directly | Convert to `.glb` (below). |
| MetaHuman | Use the custom door | Export the low-poly body and face as ONE GLB on the MetaHuman skeleton with morph targets. The separate MetaHuman ZIP door is DNA-only and nothing in the game reads DNA today. |

Maximum 250 MB per file. Above that the upload returns HTTP 413 and the site says: "This file is larger than 250 MB."

## Blender: exact export settings

`File > Export > glTF 2.0 (.glb/.gltf)`

Before exporting:
1. Select the armature and every mesh that belongs to the character.
2. `Ctrl+A > All Transforms` on the meshes and the armature. Unapplied scale is the most common cause of a giant or tiny character.
3. Scale: 1 Blender unit = 1 metre. A human-sized character is about 1.7 units tall.
4. Face the character down Blender's -Y axis (front view, numpad 1, shows its face).
5. Pack textures: `File > External Data > Pack Resources`.

In the exporter:
- **Format**: glTF Binary (.glb)
- **Include**: Selected Objects (or Visible Objects)
- **Transform**: +Y Up on
- **Data > Mesh**: Apply Modifiers on (except the Armature modifier, which the exporter handles), UVs on, Normals on
- **Data > Material**: Export; Images: Automatic (or JPEG to save space)
- **Data > Shape Keys**: on. Shape-key names travel in `mesh.extras.targetNames`; the uploader reads them from there, so nobody types them.
- **Data > Armature**: Use Rest Position on
- **Data > Skinning**: on
- **Animation**: on; each Blender action becomes a named clip (use NLA tracks or the Actions mode); Always Sample Animations on
- **Compression**: off. The web preview can decode Draco (`KHR_draco_mesh_compression`) and meshopt (`EXT_meshopt_compression`), but uncompressed is the safest. Turn Draco on only to get under 250 MB.

Head, body and clothes may be separate meshes. They must all be skinned to the same armature. Two armatures in one file are refused.

## FBX to GLB (keep the face)

1. In Blender, `File > Import > FBX`. If the character comes in at 100x scale, set Import Scale 0.01 or apply scale after import.
2. Check shape keys arrived: Object Data Properties > Shape Keys.
3. Fix transforms (`Ctrl+A > All Transforms`), then export with the settings above.
4. Run `node scripts/glb-check.mjs character.glb`.

## VRM / VRoid to GLB

1. Install the VRM add-on for Blender (VRM Add-on for Blender, by saturday06).
2. `File > Import > VRM`.
3. VRoid bone names (`J_Bip_C_Hips` and so on) are recognised by the humanoid classifier, so the body inherits Love Bird animation.
4. VRM blend-shape clips (expressions) and spring bones are VRM extensions the importer does not read. Bake the expressions you want into shape keys named with ARKit or `EMO_` names (see `blendshapes.md`).
5. Export as GLB with the settings above.

## Textures

- Embed them in the GLB (PNG or JPEG; WebP via `EXT_texture_webp` is decoded by the preview). External texture files do not travel with a single-file upload; the checker FAILs them.
- Up to 2048 px, 1024 px for anything that must look good on phones in a crowd. See `limits.md`.

## Tripo, Meshy, Rodin and other generators

- Download GLB, not OBJ or USDZ.
- Generator rigs usually use Mixamo-like names (`LeftUpLeg`, `Spine1`). These are recognised.
- Generator files often carry 4K textures and 100k+ triangles. Decimate and resize before upload (see `limits.md`).
