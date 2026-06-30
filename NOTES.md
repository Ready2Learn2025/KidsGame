# Mason's Space Arcade Notes

This is the living roadmap for Mason's Space Arcade. Preserve existing product decisions, keep completed work visible, and challenge any new feature that does not improve one of the four pillars: Fun, Learning, Reward, or Simplicity.

## Product Vision

Mason's Space Arcade should evolve into a polished, premium-feeling educational arcade for children that is completely free, has no adverts, no subscriptions, no account requirement, and is safe for children.

The game should be fast to load, work equally well on desktop, tablet, and mobile, and feel like a real downloadable game rather than a website. Learning should happen through play and reward, not through an experience that feels like schoolwork.

Long-term vision: "A completely free educational arcade where children learn through play without adverts, subscriptions or manipulative monetisation."

## Approved

### Product Principles

- Keep the experience free, child-safe, advert-free, subscription-free, and account-free.
- Prioritize the four pillars: Fun, Learning, Reward, and Simplicity.
- Make the first screen feel like entering an arcade, with games as the primary focus.
- Hide advanced features until the player has completed at least one game.
- Keep destructive and parent-level actions away from normal child play.

### First-Time Experience

The first-time flow should become:

Welcome -> Choose Game -> Play -> Earn Stars -> Celebrate -> Unlock Avatar Items -> Continue Playing

Approved UX changes:

- Make games the primary focus on the homepage.
- Show a large `Play` button.
- Recommend a first game.
- Reward the player immediately after their first game.
- Unlock avatar/shop depth after the first completion instead of presenting it up front.
- Add an optional, skippable first-time tutorial that explains how to play, stars, unlocks, avatars, and pets.

### Homepage Hierarchy

The homepage priority order is:

1. Play Games
2. Featured Game
3. Continue Playing
4. Stars
5. Avatar
6. Shop
7. Parent Settings
8. Reset Progress

### Parent-Friendly Design

- `Reset Progress` should require a deliberate parent-style action.
- Approved reset patterns include holding the button for 3 seconds, requiring confirmation, or solving a simple challenge such as `4 + 5`.
- Reset controls should be visually and spatially separated from child-facing play actions.

### Shared Game Navigation

Every game should contain a consistent navigation bar with the same minimum controls:

- Home
- Restart
- Pause
- Help
- Mute
- Settings

No game should implement these controls differently unless there is a strong accessibility or gameplay reason.

### Difficulty Structure

Each game should support the shared difficulty structure:

- Tiny Learner, for ages 3-4
- Easy
- Medium
- Hard
- Master

Difficulty should affect speed, question complexity, obstacles, and reward multiplier.

### Avatar Rollout

Current goal: make the dressed-up avatar a universal guide across the arcade.

Implemented avatar decisions:

- Shared avatar drawing, persistence, and Home-page shop live in `avatar.js`.
- Home opens avatar buying/equipping from a compact button and modal in `index.html`.
- Home also has a `My Avatar` care room for feeding, treats, bed upgrades, and trick training.
- Pet hats are part of shared avatar storage, buying/equipping, and pet rendering in `avatar.js`.
- Math Stars uses the shared avatar and no longer exposes its own visible shop entry point.
- A shared `ArcadeAvatar.mountGuide(...)` helper provides first-load instructions, avatar speech bubble, replay help button, step-by-step messages, and per-game first-load memory.
- First guide rollout is complete for `math-adventure.html`, `space-trace.html`, `star-catcher.html`, `space-jump.html`, `land-jump.html`, `star-match.html`, `space-pop.html`, `color-planets.html`, `space-dash.html`, `cosmic-pong.html`, and `coller-space.html`.

Implemented `My Avatar` decisions:

- Home placement: `My Avatar` button sits beside `Avatar Shop`; on mobile the two buttons stack.
- Modal view: current avatar and pet appear in a small room scene with mood/status bars.
- Needs: `Energy`, `Hunger`, `Happiness`, and `Tricks`.
- Spend stars on food, treats, and a one-time better bed.
- Tricks: train wave, spin, moonwalk, and rocket pose with energy and treat boosts.
- Persistence: care state is stored under `masonArcade.avatarCare`.
- Rewards: a small daily care bonus can trigger after feeding or training when hunger and happiness are high.

## Planned

### UX And Onboarding

- Rework the homepage around the approved hierarchy.
- Add the recommended first game and primary `Play` entry point.
- Gate avatar/shop/advanced management until after first completion.
- Add a first-game reward and celebration screen.
- Add optional onboarding that can be skipped immediately.
- Add consistent game navigation across all current games.
- Add parent-safe reset progress controls.

### Accessibility Roadmap

- Large tap targets.
- High contrast mode.
- Colour blind mode.
- Reduced animations.
- Reduced flashing.
- Large text mode.
- Simple reading mode.
- Audio instructions as a future enhancement.

### Mobile And Responsive Roadmap

Review every screen for:

- Landscape and portrait layouts.
- Tablet layouts.
- Small phone layouts.
- Safe areas.
- Dynamic Island.
- Gesture navigation.
- Rotation.
- Canvas resizing.
- Accidental browser scrolling prevention.

### Gameplay Systems

- Standardize the new difficulty structure across games.
- Improve reward economy with daily reward, win streak, achievement bonuses, mystery rewards, perfect game bonus, and first play bonus.
- Introduce achievements for `First Game`, `100 Stars`, `500 Stars`, `First Pet`, `All Pets`, `10 Games Played`, `Perfect Score`, `Fast Learner`, `Math Master`, and `Explorer`.
- Introduce profile statistics for games played, stars earned, favourite game, longest streak, time played, highest score, and items unlocked.

### Pet Progression

Each pet should have:

- Level.
- Mood.
- Energy.
- Favourite food.
- Animations.
- Small passive bonuses.

### Guide And Learning Tips

- Add educational tips after the intro layer:
  - Math Stars: wrong answer, timed mode, counting hints.
  - Space Trace: low match progress, slow tracing reminder.
  - Color Planets: wrong color bin reminder.
- Keep action-game guidance short and avoid interrupting active play.

### Technical Roadmap

- Review responsive layouts.
- Review performance and asset loading.
- Reduce code duplication.
- Create reusable UI components.
- Move toward a shared game framework.
- Improve game state management.
- Add save versioning.
- Improve offline support.
- Improve PWA behavior.

## Nice To Have

### Polish Checklist

- Consistent spacing.
- Consistent fonts.
- Consistent button styles.
- Animation consistency.
- Loading transitions.
- Success animations.
- Failure animations.
- Screen transitions.
- Particle effects.
- Confetti.
- Floating stars.

### Expanded Avatar Cosmetics

- Hairstyles.
- Faces.
- Expressions.
- Shoes.
- Glasses.
- Animated hats.
- Animated pets.
- Trails.
- Victory animations.
- Character backgrounds.
- Seasonal cosmetics.

## Future Ideas

### Pet Roadmap

- Pet mini-games.
- Pet accessories.
- Pet homes.
- Pet collection book.

### Audio Roadmap

- Menu music.
- Game music.
- Win fanfare.
- Achievement sounds.
- Pet sounds.
- Button sounds.
- Ambient space sounds.
- Mute controls.
- Volume sliders.

### Accessibility Future

- Audio instructions.
- More parent-tuned settings presets.
- Per-player comfort settings if profiles are introduced later.

## Prioritised Implementation Backlog

### 🔴 High Priority

- Rework homepage hierarchy so games and the primary `Play` action come first.
- Build first-time flow: welcome, choose game, first reward, celebration, and unlock moment.
- Add parent-safe reset progress flow with long press, confirmation, and simple challenge.
- Create a shared game navigation component and roll it into every game.
- Add responsive/mobile safeguards for canvas resizing, safe areas, rotation, and accidental scrolling.
- Add save versioning before introducing larger profile, achievement, and economy changes.

### 🟡 Medium Priority

- Add the optional first-time tutorial.
- Add difficulty framework with Tiny Learner, Easy, Medium, Hard, and Master.
- Add reward economy upgrades: daily reward, streaks, first play bonus, perfect game bonus, and mystery rewards.
- Add achievements and profile statistics.
- Add pet progression basics: levels, mood, energy, favourite foods, animations, and small passive bonuses.
- Add high contrast, reduced animation, reduced flashing, large text, simple reading, and colour blind modes.
- Expand educational guide tips for Math Stars, Space Trace, and Color Planets.
- Consolidate repeated game UI and state handling into reusable helpers.

### 🟢 Future

- Expand avatar cosmetics with animated and seasonal items.
- Expand pets with accessories, homes, collection book, and mini-games.
- Add music, sound effects, volume sliders, and richer mute controls.
- Improve PWA and offline support so the arcade feels more like a downloadable game.
- Add audio instructions and broader accessibility presets.

## Completed Game Enhancements

- Color Planets:
  - Added a richer space background with occasional shooting stars and rockets.
  - Added best score tracking.
  - No timer added by request.
- Star Catcher:
  - Replaced the heart-only HUD label with `Health |` followed by the hearts.
  - Added best score tracking.
- Space Trace:
  - Rebuilt input handling around pointer events so mouse, touch, and stylus tracing share one path.
  - Reworked trace coverage calculation against the actual drawn canvas so touch progress is reliable.
- Star Match:
  - Added a 3 minute timer to each difficulty.
  - Tracks quickest time as the best score.
- Space Pop:
  - Added clearer explanation of what to pop and what not to pop.
  - Added health that goes down whenever the player hits their pet.
- Space Dash:
  - Reduced planet density so the screen is less messy.
  - Added a fuel symbol that gives bonus points and a speed boost.
- Space Jump:
  - Added a Flappy Bird-style jumping game with Easy, Hard, and Harder modes.
  - Added coins that multiply over time, x2 coin powerups, and 3 moon pieces for a bonus.
  - Made Easy much more forgiving with bigger asteroid gaps, wider gate spacing, softer hitboxes, and no shooting-star hazards.
- Land Jump:
  - Added a ground-based jumping game with Easy, Hard, and Harder modes.
  - Added incoming meteors, coin collection, coin multipliers over time, and x2 coin powerups.
  - Enabled jump, double jump, and triple jump before landing.
- Cosmic Pong:
  - Fixed the iOS web issue where the player cannot get past the "move your mouse up and down" start instruction.
- Color Ship:
  - Removed the background icon so the canvas starts blank.
  - Moved tools into a side bar where the player taps an icon, then selects that tool's options.

## Review Items

Previous fixed/review bug listings should not be carried forward as active work here. This file now tracks current decisions, completed history, active roadmap items, and the next implementation priorities.

## Next 10 Development Tasks

1. Redesign the homepage hierarchy around `Play Games`, a featured game, and a large primary `Play` button.
2. Add first-time state tracking so advanced avatar/shop features stay hidden until first completion.
3. Implement the first-game completion reward, celebration moment, and avatar item unlock.
4. Add a parent-safe reset progress flow with long press, confirmation, and a simple challenge.
5. Build a shared game navigation bar with Home, Restart, Pause, Help, Mute, and Settings.
6. Roll the shared navigation bar into every existing game.
7. Add save versioning and a small migration layer for existing localStorage data.
8. Create responsive/mobile QA fixes for safe areas, rotation, canvas resizing, and scroll prevention.
9. Add the optional first-time tutorial covering play, stars, unlocks, avatars, and pets.
10. Design the shared difficulty framework and map current game difficulty names into Tiny Learner, Easy, Medium, Hard, and Master.
