# README Demo GIF Design

## Goal

Show the application demo immediately at the beginning of GitHub's rendered
README without requiring the visitor to open a separate video player.

## Source

- File: `social_media - Brave 2026-07-23 18-08-46.mp4`
- Duration: 21 seconds
- Source size: 8,074,413 bytes

## Design

Convert the complete source video to an animated GIF and display it directly
below the README title with standard Markdown image syntax. The GIF will use a
maximum width of 900 pixels and a target frame rate of 10 to 12 FPS. Palette
optimization will be used to keep text and interface colors legible.

The GIF should target a size of 8 MB or less. If the complete 21-second result
cannot meet that limit while remaining readable, reduce the output width or
frame rate before shortening the demonstration. The original 29 MB MP4 and
its unsupported HTML `<video>` block will be removed from the repository.

The rendered GIF will link to itself as a fallback, allowing visitors to open
the full-size asset. No application source code or runtime behavior changes.

## Verification

- Confirm that the GIF exists and is referenced by a relative README path.
- Confirm that the file is an animated GIF with the intended dimensions and
  more than one frame.
- Confirm that its duration is close to the 21-second source and its size is no
  greater than 8 MB.
- Run `git diff --check` and review the final repository diff.
