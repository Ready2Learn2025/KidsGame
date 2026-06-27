# Space Arcade Notes

## Avatar Rollout

Current goal: make the dressed-up avatar a universal guide across the arcade.

### Implemented

- Shared avatar drawing, persistence, and Home-page shop live in `avatar.js`.
- Home owns avatar buying/equipping below the star wallet in `index.html`.
- Math Stars uses the shared avatar and no longer exposes its own visible shop entry point.
- A shared `ArcadeAvatar.mountGuide(...)` helper now provides:
  - first-load instructions,
  - avatar speech bubble,
  - replay help button,
  - step-by-step messages,
  - per-game first-load memory.
- First guide rollout is complete for all current arcade games:
  - `math-adventure.html`
  - `space-trace.html`
  - `star-catcher.html`
  - `star-match.html`
  - `space-pop.html`
  - `color-planets.html`
  - `space-dash.html`
  - `cosmic-pong.html`
  - `coller-space.html`

### Next

- Add educational tips after the intro layer:
  - Math Stars: wrong answer, timed mode, counting hints.
  - Space Trace: low match progress, slow tracing reminder.
  - Color Planets: wrong color bin reminder.
- Keep action-game guidance short and avoid interrupting active play.

## Review Items

Previous fixed/review bug listings should not be carried forward as active work here. This file tracks current rollout notes and remaining avatar-guide tasks only.
