# Game preview clips

Free users who open a Pro game see a looping, muted preview clip above the
paywall. Drop the clips here with these exact names:

| File | Game |
|------|------|
| `adverse-selection.mp4` | Adverse Selection |
| `holdem.mp4` | Hold'em Market Maker |

Optional matching `*.jpg` (same name) acts as a poster frame while the video
loads. If a clip is missing, the preview silently hides and only the paywall
shows — nothing breaks.

## How to record one (≈10 seconds, looping)

1. Open the game on the site and play a few representative seconds.
2. Screen-record just the game panel:
   - **macOS:** Shift-Cmd-5 → record selected portion.
   - **Windows:** Xbox Game Bar (Win-G) or the Snipping Tool's record.
3. Trim to ~10 seconds of the most interesting action.
4. Export as **MP4 (H.264)**, muted, ideally ≤ ~2 MB. Keep it small — it's
   served from Netlify and counts toward bandwidth. 720p or even 600px wide is
   plenty; lower the bitrate before you raise the resolution.
5. Name it as in the table above and put it in this folder. Commit + push.

A clean loop helps — start and end on a similar frame so the repeat isn't jarring.
