# Space Arcade Notes

## Avatar Rollout

Current goal: make the dressed-up avatar a universal guide across the arcade.

### Implemented

- Shared avatar drawing, persistence, and Home-page shop live in `avatar.js`.
- Home opens avatar buying/equipping from a compact button and modal in `index.html`.
- Pet hats are part of shared avatar storage, buying/equipping, and pet rendering in `avatar.js`.
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

## Deferred Game Enhancements

Documented for later work only; do not start these until the avatar shop button and pet hats work is complete and verified.

- Color Planets:
  - Add a richer space background with occasional shooting stars and rockets.
  - Add a 30 second timer.
  - Add best score tracking.
- Star Catcher:
  - Replace the heart-only HUD label with `Health |` followed by the hearts.
  - Add best score tracking.
- Space Trace:
  - Plan a separate rebuild because touch input is unreliable.
- Star Match:
  - Add a 2 minute timer on Medium.
  - Add a 2:30 timer on Hard.
  - Track quickest time as the best score.
- Space Pop:
  - Add clearer explanation of what to pop and what not to pop.
  - Add health that goes down whenever the player hits their pet.
- Space Dash:
  - Reduce planet density so the screen is less messy.
  - Add a fuel symbol that gives bonus points and a speed boost.
- Cosmic Pong:
  - Fix the iOS web issue where the player cannot get past the "move your mouse up and down" start instruction.
- Color Ship:
  - Remove the background icon so the canvas starts blank.
  - Move tools into a side bar where the player taps an icon, then selects that tool's options.

## Review Items

Previous fixed/review bug listings should not be carried forward as active work here. This file tracks current rollout notes and remaining avatar-guide tasks only.
