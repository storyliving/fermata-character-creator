# Live bug reports

Fermata reads these reports as they arrive, reproduces them, and replies to the ticket. A precise report gets handled quickly; a vague one waits for a human.

## Endpoint

```
POST https://hq.fermata.me/api/public/bug-report
content-type: application/json
```

No account needed. From curl or a script send `content-type: application/json`; from browser JavaScript send the same JSON body as `text/plain` (avoids a CORS preflight). Rate-limited per address; if you get HTTP 429, wait and send once, never retry in a loop.

| Field | Required | Limit | What to put |
|---|---|---|---|
| `summary` | yes | 200 chars | One line: where, what happened, what was expected. "Body check shows PARTIAL but every EMO_ core shape is present" |
| `details` | no | 4000 chars | Exact on-screen text (quoted), steps pressed in order, what you expected, whether it repeats. |
| `surface` | no | one of `import`, `gallery`, `backstage`, `boat`, `live`, `vote`, `skill`, `other` | Where it happened. Use `skill` when this skill's advice or the live spec disagreed with the site. |
| `characterId` | no | | From the gallery URL if visible. |
| `characterName` | no | | |
| `pageUrl` | no | | Full URL of the page with the problem. |
| `contact` | no | | Email or handle, ONLY if the person wants to be contacted. |
| `validationReport` | no | object, 20 KB | `node scripts/glb-check.mjs file.glb --json` output, trimmed if large (drop `boneNames` and `morphTargets` first). |
| `environment` | no | | Browser and version, OS, device. "Safari 18, iPhone 15, iOS 18.4" |
| `source` | yes | | Always `"skill"` from this skill. |

Response: HTTP 202 with `{ "ok": true, "ticket": "...", "statusUrl": "https://hq.fermata.me/api/public/bug-report/<ticket>" }`.

Status: `GET https://hq.fermata.me/api/public/bug-report/<ticket>` returns `{ ticket, status, reply, duplicateOf, receivedAt, updatedAt }`. Status is one of `received` (filed), `triaging` (an engineer is reproducing it), `fix-in-review` (a fix is built and waiting to go live), `fixed` (live), `duplicate` (linked to another ticket in `duplicateOf`), `not-reproduced`, `needs-info`, `wont-fix`, `failed` (the automatic attempt stopped; a person picks it up). Read `reply` to the person verbatim.

## Procedure

1. **Is it a bug?** If the file breaks a documented rule (two skeletons, over 250 MB, no idle on a creature), fix the file; do not file. If the site contradicts the spec, crashes, loses work, shows a wrong result for a file that passes `glb-check.mjs`, or a button does nothing, file.
2. **Check `knownIssues`** in the live spec. If it is listed, give the person the workaround. File only if the workaround fails, and say so in `details`.
3. **Collect** the exact message text, URL, character name, steps, environment, and the checker JSON.
4. **Redact.** Remove anything that looks like a token, cookie, API key, password, session id, signed URL query string (`?X-Amz-...`, `?token=`), and email addresses unless the person asked to be contacted. Never include the file itself.
5. **Show the person** the exact JSON and ask "Send this to Fermata?" Send only on yes.
6. **Send once:**

```bash
curl -s -X POST https://hq.fermata.me/api/public/bug-report \
  -H 'content-type: application/json' \
  --data @report.json
```

7. **Tell them the ticket** and that Fermata's engineers see it live. Offer to check status later.

## Example

```json
{
  "summary": "Send backstage confirm dialog closes but character never shows Waiting backstage",
  "details": "On the Talk page for 'Mallow' I pressed Send backstage, ticked the terms in 'Send Mallow backstage?', pressed Send backstage. Dialog closed, no error, button still says Send backstage. Repeated twice, same result. Signed in.",
  "surface": "backstage",
  "characterName": "Mallow",
  "pageUrl": "https://build.lovebird.show/import/custom",
  "environment": "Chrome 129, Windows 11",
  "source": "skill"
}
```
