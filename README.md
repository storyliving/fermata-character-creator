# Fermata Character Creator

**Make a character. Get it on the boat.**

[Open this repo](https://github.com/storyliving/fermata-character-creator) · [Upload at build.lovebird.show](https://build.lovebird.show/import/custom) · [Resources](https://build.lovebird.show/resources)

<a href="https://github.com/storyliving/fermata-character-creator"><img src="assets/qr-fermata-character-creator.png" alt="QR code that opens github.com/storyliving/fermata-character-creator" width="220"></a>

*Scan, or tap the QR / the links above:* **https://github.com/storyliving/fermata-character-creator**

---

This is a free toolkit for Claude (Claude Code, Claude.ai projects, or any assistant that reads `SKILL.md` files) that helps you:

1. **Build a character from a picture.** Take a reference image apart into separate parts, generate each part with [Tripo](https://www.tripo3d.ai/), put it back together in [Blender](https://www.blender.org) (by hand, through the Blender MCP, or headless), and give it a rig, blinks, a mouth and emotions. It works for humans and for everything else: birds with beaks, dogs, cats, aliens, creatures.
2. **Get it into Love Bird.** The assistant checks your file against the same rules the upload page uses, fixes what it can, walks you through the upload at [build.lovebird.show/import/custom](https://build.lovebird.show/import/custom), and helps debug anything that fails.
3. **Teach us what you learned.** Found a trick for a dog's ears, a bird's beak, an alien with three eyes? Add a recipe to [`learnings/`](learnings/). The more weird and wonderful characters we learn to handle, the more characters the show can take.

## 60-second start

You need Claude and a place to put skills. (Folder paths below are the common ones; check your assistant's docs.)

**Claude Code**

```bash
git clone https://github.com/storyliving/fermata-character-creator
mkdir -p ~/.claude/skills
cp -r fermata-character-creator/skills/fermata-character-builder ~/.claude/skills/
cp -r fermata-character-creator/skills/fermata-character-import  ~/.claude/skills/
```

Restart Claude Code, then say: *"Use the Fermata character builder. I want to make a character from this picture."* and attach your image.

**Claude.ai**: zip each skill folder (`skills/fermata-character-builder`, `skills/fermata-character-import`) and add it as a skill in your Claude settings. You can also download ready-made zips from [build.lovebird.show/resources](https://build.lovebird.show/resources).

**Already have a character file?** Skip to the import skill: *"Use the Fermata character import skill and check my file."* You can also run the checker yourself (needs Node 18+):

```bash
node skills/fermata-character-import/scripts/glb-check.mjs my-character.glb
```

## What is in here

| Path | What |
|---|---|
| [`skills/fermata-character-builder/`](skills/fermata-character-builder) | The build skill: decomposition, Tripo, Blender assembly, rigging, face shapes and emotions, MetaHuman and MetaTailor notes |
| [`skills/fermata-character-import/`](skills/fermata-character-import) | The import skill: the upload rules, a file checker, fixes, troubleshooting, and how to file a bug |
| [`learnings/`](learnings) | Community recipes: bird, four-legged pet, alien, human, and your idea next |
| [`samples/`](samples) | A tiny test file for the checker |
| [`tools/audit.mjs`](tools/audit.mjs) | The check we run before publishing: it fails if anything private slips in |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How to share what you learned |

## What this is not

It is about bodies, faces and getting them into the show. Your character's voice and personality are set up on the build.lovebird.show pages after the upload.

## Safety

- Never paste passwords, API keys, tokens or private files into issues, recipes or chats with the assistant.
- Only upload characters you made or have permission to use.
- The checker runs on your computer. By default it fetches Fermata's public import rules; use `--offline` to use the bundled copy instead.

## License

MIT. See [LICENSE](LICENSE). Contributions are accepted under the same license.
