# README Demo GIF Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the unsupported README MP4 player with an automatically playing, optimized GIF made from the approved 21-second recording.

**Architecture:** Use a temporary Python virtual environment outside the repository to obtain an FFmpeg binary without adding project dependencies. Generate the GIF with FFmpeg's `palettegen` and `paletteuse` filters, then reference the asset through standard Markdown supported by GitHub.

**Tech Stack:** PowerShell, Python 3.12 temporary virtual environment, imageio-ffmpeg, Pillow, FFmpeg, Markdown, Git

## Global Constraints

- Use `social_media - Brave 2026-07-23 18-08-46.mp4` as the complete 21-second source.
- Target a maximum width of 900 pixels and 10 to 12 FPS.
- Keep the GIF at 8 MB or less while preserving readable interface text.
- Reduce width or frame rate before shortening the demonstration.
- Remove the original 29 MB MP4 and unsupported HTML `<video>` block.
- Do not change application source code or runtime behavior.

---

### Task 1: Generate and publish the README demo GIF

**Files:**
- Create: `docs/assets/social-media-demo.gif`
- Modify: `README.md:1-10`
- Delete: `docs/assets/social-media-demo.mp4`

**Interfaces:**
- Consumes: `C:\Users\Raul_\Videos\Captures\social_media - Brave 2026-07-23 18-08-46.mp4`
- Produces: GitHub-compatible animated image at `docs/assets/social-media-demo.gif`

- [ ] **Step 1: Create an isolated conversion environment**

Run:

```powershell
python -m venv C:\tmp\readme-gif-venv
C:\tmp\readme-gif-venv\Scripts\python.exe -m pip install imageio-ffmpeg Pillow
```

Expected: pip exits with code 0 and installs `imageio-ffmpeg` and Pillow only in `C:\tmp\readme-gif-venv`.

- [ ] **Step 2: Generate a palette and an initial 900-pixel, 12 FPS GIF**

Run:

```powershell
$gifFfmpeg = & C:\tmp\readme-gif-venv\Scripts\python.exe -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"
$gifSource = 'C:\Users\Raul_\Videos\Captures\social_media - Brave 2026-07-23 18-08-46.mp4'
& $gifFfmpeg -y -i $gifSource -vf "fps=12,scale=900:-1:flags=lanczos,palettegen=stats_mode=diff" C:\tmp\social-media-demo-palette.png
& $gifFfmpeg -y -i $gifSource -i C:\tmp\social-media-demo-palette.png -lavfi "fps=12,scale=900:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=sierra2_4a:diff_mode=rectangle" docs\assets\social-media-demo.gif
```

Expected: FFmpeg exits with code 0 and creates a multi-frame GIF covering approximately 21 seconds.

- [ ] **Step 3: Enforce the 8 MB target without cutting the recording**

Run:

```powershell
(Get-Item docs\assets\social-media-demo.gif).Length
```

Expected: a value no greater than `8388608`. If it is larger, repeat Step 2 at `fps=10,scale=720:-1`; if still larger, repeat at `fps=10,scale=640:-1`. Regenerate both the palette and GIF with the same FPS and scale on every attempt.

- [ ] **Step 4: Replace the unsupported README video block**

Replace the current `<video>` block and MP4 link below `# Social Media` with:

```markdown
[![Social Media application demo](docs/assets/social-media-demo.gif)](docs/assets/social-media-demo.gif)
```

Delete `docs/assets/social-media-demo.mp4` after confirming the GIF exists.

- [ ] **Step 5: Verify the artifact and repository diff**

Run:

```powershell
C:\tmp\readme-gif-venv\Scripts\python.exe -c "from PIL import Image; from pathlib import Path; p=Path(r'docs/assets/social-media-demo.gif'); im=Image.open(p); print({'format': im.format, 'size': im.size, 'frames': im.n_frames, 'duration_seconds': sum(im.seek(i) or im.info.get('duration', 0) for i in range(im.n_frames))/1000, 'bytes': p.stat().st_size})"
$gifFfmpeg = & C:\tmp\readme-gif-venv\Scripts\python.exe -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"
& $gifFfmpeg -v error -i docs\assets\social-media-demo.gif -f null NUL
```

Also run:

```powershell
git diff --check
git status --short
git diff -- README.md
```

Expected: the GIF decodes without error, spans approximately 21 seconds, is animated, is no greater than 8 MB, the README references its relative path, and the only product changes are the README plus replacement of the MP4 by the GIF.

- [ ] **Step 6: Commit the tested replacement**

Run:

```powershell
git add README.md docs/assets/social-media-demo.gif docs/assets/social-media-demo.mp4
git commit -m "docs: optimize README application demo"
```

Expected: one commit on `develop` containing the README edit, GIF addition, and MP4 removal.
