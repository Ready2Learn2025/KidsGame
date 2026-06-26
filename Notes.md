# Kids Game Review Notes

Review date: 2026-06-26

Scope reviewed:
- `index.html` arcade home / unlock screen
- `math-adventure.html` Math Stars and dress-up shop
- `star-catcher.html` basket catching game
- `space-trace.html` letter tracing game
- `star-match.html` card matching game
- `space-pop.html` tap-the-alien game
- `color-planets.html` color sorting game
- `space-dash.html` lane / ship dodging game
- `cosmic-pong.html` pong / rocket building game
- `coller-space.html` spaceship coloring activity
- `ios-app.js`, `manifest.json`, `README.md`

Note: this is a code-level review focused on free-to-play games for children around age 5, with iPhone/iPad touch controls in mind. A final pass on real iOS devices is still recommended.

## Implementation Status

Updated 2026-06-26:
- Fixed all high-priority issues listed below.
- `space-trace.html`: fixed scaled/touch canvas tracing coverage and removed global `event` usage from level selection.
- `space-dash.html`: fixed touch drag steering so it no longer becomes an accidental swipe on finger release.
- `coller-space.html`: fixed touch drawing defaults, removed global `event` usage, made the canvas responsive, added multi-step undo, and added local save/restore for "save for later" behavior.
- `cosmic-pong.html`: added touch-first instructions, touchstart paddle placement, mobile layout adjustments, and a clear rocket-complete replay state.
- Stage 2 medium-priority fixes completed: `space-dash.html` now persists best score, `star-match.html` resets its round star HUD per board, `space-pop.html` has a real pop-speed ramp, and remaining known desktop-first hints are touch-first.
- Verification completed: embedded scripts in the six changed pages pass `node --check`.
- Verification limitation: the in-app browser runtime failed to connect in this environment, so real rendered QA on iPhone/iPad is still needed.

## How The Games Work

- The app is a static HTML arcade. There is no build system, package file, or automated test suite.
- `index.html` stores the shared arcade bank in `localStorage` under `masonArcade`.
- Most games call an `arcadeEarn(n)` helper that increments both `coins` and `earned`.
- Unlocking is based on total lifetime `earned`, not spendable `coins`.
- Math Stars uses spendable `coins` for its dress-up shop and stores math-specific customization in the same arcade bank.
- Several pages duplicate the same bank, audio, background, and canvas patterns directly inside each HTML file.

## Bugs And Issues

### High Priority

1. Fixed: `space-trace.html` match calculation can fail on scaled/touch canvases.
   - Lines 290-298 calculate covered pixel indexes using `x` and `y` values that can be fractional.
   - `outlinePixels` stores integer pixel indexes, so fractional `coveredPixels` entries often do not match.
   - On iPhone/iPad, where the canvas is visually scaled, this can make letters much harder or impossible to complete.
   - Fix: round or floor `x`, `y`, and the base pixel position before adding indexes. Better: sample from the drawing canvas and compare integer pixel coordinates.

2. Fixed: `space-dash.html` touch steering can snap unexpectedly after a drag.
   - Lines 473-488 use touch drag to steer, then `touchend` also treats the same gesture as a swipe and calls `moveLane()`.
   - A child can drag the ship smoothly, lift their finger, and have the ship jump one lane.
   - Fix: track whether touch movement was used for steering and skip swipe-lane movement for drag gestures, or choose one touch model only.

3. Fixed: `coller-space.html` touch drawing does not call `preventDefault()`.
   - Lines 615-617 attach touch handlers directly, but `startDrawing` and `draw` do not prevent default touch behavior.
   - On iOS this can cause page scrolling/gesture behavior while a child is trying to draw.
   - Fix: add non-passive touch listeners and call `e.preventDefault()` in `touchstart` and `touchmove`, or convert this page to pointer events like `color-planets.html`.

4. Fixed: `coller-space.html` relies on global `event`.
   - Lines 459-468 use `event.target` inside `setBrushSize()` and `toggleEffect()`.
   - This depends on browser-specific global event behavior and can break on some mobile browsers.
   - `space-trace.html` has the same pattern at lines 165-168.
   - Fix: pass the clicked button explicitly, for example `onclick="setBrushSize(event, 8)"`, or bind listeners in JavaScript.

5. Fixed: `cosmic-pong.html` is not well optimized for touch-first iPhone play.
   - Start text says "mouse up & down" at lines 87-92.
   - Touch control only updates on `touchmove` at lines 413-417.
   - The game uses a wide 820x500 canvas; on small iPhones the paddle and ball become quite small.
   - Fix: add touch-specific instructions, support touchstart/tap positioning, and consider a portrait-friendly layout or larger touch target.

### Medium Priority

6. Fixed: `space-dash.html` shows "Best" but does not persist it.
   - `best` is initialized in memory and reset when the page reloads.
   - For children, losing a best score can feel broken.
   - Fix: store best score in `localStorage`, preferably under the shared arcade bank.

7. Fixed: `coller-space.html` says "save for later" on the home card, but does not save the design inside the app.
   - The Save button downloads a PNG only.
   - There is no `localStorage` persistence, reload restore, or gallery.
   - Fix: store the canvas data URL locally after drawing or when pressing Save, then restore it on page load.

8. Fixed: `coller-space.html` undo only has one useful step.
   - `saveHistory()` replaces `history` with a single image at lines 474-476.
   - Undo returns to the first saved state, then the stack is empty.
   - Fix: push snapshots before each stroke/sticker, cap the stack size, and pop one step at a time.

9. Fixed: `star-match.html` session score is not reset when starting a new board.
   - `sessionStars` is incremented at lines 188 and 200 but not reset in `startGame()`.
   - This may be intentional as "stars earned on this visit", but the HUD label looks round-based.
   - Fix: either reset it per board or relabel it as page/session stars.

10. Fixed: `cosmic-pong.html` does not clearly end or restart after rocket completion.
    - At score 10, it gives the liftoff bonus and message, but the game continues.
    - Fix: show a kid-friendly win screen with "Play again" and "Home" buttons, or intentionally continue with clear text.

11. Fixed: `space-pop.html` has a comment for ramping difficulty but the interval never changes.
    - `interval` is set once before `setInterval(popRandom, interval)`.
    - Fix: use recursive `setTimeout` or restart the interval as time decreases.

12. Fixed: Several game hints are desktop-first.
    - Examples: `space-dash.html` line 46, `cosmic-pong.html` lines 87-92.
    - For the target audience and iOS requirement, instructions should say "tap", "drag", or "move your finger" first.

### Lower Priority / Polish

13. The app uses external Google Fonts links on some pages.
    - This adds network dependency and can delay first paint, especially from an iOS home-screen launch.
    - Fix: use a local font asset, system rounded fonts, or preload/cache intentionally.

14. `manifest.json` and `ios-app.js` use `icon.svg` for PWA and Apple touch icon.
    - iOS home-screen icons are more reliable with PNG sizes such as 180x180 and 512x512.
    - Fix: add PNG icons and reference them from both `manifest.json` and `ios-app.js`.

15. `ios-app.js` disables pinch zoom.
    - This may be desirable for games, but it reduces accessibility.
    - Fix: keep game canvases locked if needed, but consider whether the arcade home/shop pages should allow normal accessibility zoom.

16. `README.md` only contains the published URL.
    - There are no setup, testing, deployment, or device QA instructions.
    - Fix: add a short README explaining how to open the static app locally and what devices/viewports to test.

## Optimization Opportunities

1. Move shared arcade bank code into a single JS file.
   - `arcadeLoad`, `arcadeSave`, and `arcadeEarn` are repeated in almost every game.
   - A shared helper would make unlock/star bugs easier to fix once.

2. Move shared iOS/home-link/game styles into a common CSS file.
   - Each page repeats home button styles, star backgrounds, and canvas layout rules.
   - A shared stylesheet would reduce file size and visual drift.

3. Use pointer events consistently.
   - `color-planets.html` already uses pointer events and is closer to modern touch/mouse unification.
   - Converting canvas games to pointer events would reduce duplicate mouse/touch logic.

4. Add a simple smoke-test page or script.
   - Since this is static HTML, a small Playwright or browser smoke test could open every page and check for console errors.
   - This would catch syntax/runtime errors before publishing.

5. Add a child-friendly iOS QA checklist.
   - Test iPhone portrait, iPad portrait, iPad landscape, home-screen standalone mode, airplane mode, sound unlock, and touch-only play with no keyboard/mouse.

6. Consider a central game registry.
   - `index.html` is the only source of game names/costs right now.
   - If game metadata grows, a shared `games.js` file would avoid editing markup and logic together.

7. Keep animations lighter on older devices.
   - Several pages create 100+ animated background stars and run continuous canvas loops.
   - Add reduced-motion handling and pause loops when the page is hidden.

## Suggested Fix Order

1. Done: Fix `space-trace.html` pixel matching so tracing reliably completes on iOS.
2. Done: Fix `space-dash.html` touch steering so drags do not become accidental swipes.
3. Done: Fix `coller-space.html` touch/default behavior, global `event`, undo, and save persistence.
4. Done: Make `cosmic-pong.html` touch-first and add a clear win/restart state.
5. Done: Persist `space-dash.html` best score.
6. Extract shared arcade/localStorage helpers.
7. Add PNG home-screen icons and a short README/device QA checklist.
