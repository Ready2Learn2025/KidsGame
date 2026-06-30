/* Shared Mason's Space Arcade state, first-play rewards, settings, and game chrome. */
(function(){
  const ARCADE_KEY = 'masonArcade';
  const SAVE_VERSION = 2;
  const FIRST_PLAY_REWARD = 15;
  const FIRST_PLAY_HAT = 'party';
  let paused = false;
  let navMounted = false;
  let settingsModal = null;
  let pauseOverlay = null;

  function isHomePage(){
    const file = location.pathname.split('/').pop();
    return !file || file === 'index.html';
  }

  window.__arcadeCoreWillMountNav = !isHomePage();

  function readRaw(){
    try { return JSON.parse(localStorage.getItem(ARCADE_KEY)) || {}; }
    catch(e){ return {}; }
  }

  function writeRaw(bank){
    localStorage.setItem(ARCADE_KEY, JSON.stringify(bank || {}));
  }

  function unique(list){
    return Array.from(new Set(Array.isArray(list) ? list : []));
  }

  function hasAvatarProgress(bank){
    if (!bank) return false;
    const char = bank.avatarChar || bank.mathChar || {};
    if (char.color && char.color !== 'red') return true;
    if (char.hat && char.hat !== 'none') return true;
    if (char.outfit && char.outfit !== 'none') return true;
    if (char.pet && char.pet !== 'none') return true;
    if (char.petHat && char.petHat !== 'none') return true;
    const owned = bank.avatarOwned || bank.mathOwned || {};
    return Object.keys(owned).some(tab => unique(owned[tab]).some(id => id !== 'none' && id !== 'red'));
  }

  function hasPriorProgress(bank){
    if (!bank) return false;
    if ((Number(bank.earned) || 0) > 0 || (Number(bank.coins) || 0) > 0) return true;
    if (hasAvatarProgress(bank)) return true;
    if (bank.avatarCare) return true;
    return Object.keys(bank).some(key => /^best/i.test(key) && bank[key]);
  }

  function normalizeAvatarFields(bank){
    const defaultOwned = {
      colors: ['red'],
      hats: ['none'],
      outfits: ['none'],
      pets: ['none'],
      petHats: ['none']
    };
    const defaultChar = { color:'red', hat:'none', outfit:'none', pet:'none', petHat:'none' };
    bank.avatarChar = { ...defaultChar, ...(bank.avatarChar || bank.mathChar || {}) };
    bank.mathChar = { ...defaultChar, ...(bank.mathChar || bank.avatarChar || {}) };
    bank.avatarOwned = { ...defaultOwned, ...(bank.avatarOwned || bank.mathOwned || {}) };
    bank.mathOwned = { ...defaultOwned, ...(bank.mathOwned || bank.avatarOwned || {}) };
    Object.keys(defaultOwned).forEach(tab => {
      bank.avatarOwned[tab] = unique([...(defaultOwned[tab] || []), ...(bank.avatarOwned[tab] || [])]);
      bank.mathOwned[tab] = unique([...(defaultOwned[tab] || []), ...(bank.mathOwned[tab] || [])]);
    });
  }

  function normalize(bank){
    const b = bank || {};
    normalizeAvatarFields(b);
    b.saveVersion = Math.max(Number(b.saveVersion) || 0, SAVE_VERSION);
    b.coins = Math.max(0, Number(b.coins) || 0);
    b.earned = Math.max(0, Number(b.earned) || 0);
    b.settings = { muted:false, ...(b.settings || {}) };
    b.settings.muted = !!b.settings.muted;
    b.gameCompletions = b.gameCompletions && typeof b.gameCompletions === 'object' ? b.gameCompletions : {};

    const existingFirstPlay = b.firstPlay && typeof b.firstPlay === 'object' ? b.firstPlay : null;
    const onboarded = hasPriorProgress(b);
    b.firstPlay = {
      completed: onboarded,
      gameId: '',
      completedAt: '',
      rewardGiven: onboarded,
      celebrationSeen: onboarded,
      ...(existingFirstPlay || {})
    };
    b.firstPlay.completed = !!b.firstPlay.completed;
    b.firstPlay.rewardGiven = !!b.firstPlay.rewardGiven;
    b.firstPlay.celebrationSeen = !!b.firstPlay.celebrationSeen;
    return b;
  }

  function load(){
    const before = readRaw();
    const after = normalize(before);
    if (JSON.stringify(before) !== JSON.stringify(after)) writeRaw(after);
    return after;
  }

  function save(bank){
    const normalized = normalize(bank || {});
    writeRaw(normalized);
    return normalized;
  }

  function unlockFirstPlayReward(bank){
    const b = normalize(bank || load());
    if (b.firstPlay.rewardGiven) return b;
    b.coins += FIRST_PLAY_REWARD;
    b.earned += FIRST_PLAY_REWARD;
    b.avatarOwned.hats = unique([...(b.avatarOwned.hats || []), FIRST_PLAY_HAT]);
    b.mathOwned.hats = unique([...(b.mathOwned.hats || []), FIRST_PLAY_HAT]);
    if (!b.avatarChar.hat || b.avatarChar.hat === 'none') b.avatarChar.hat = FIRST_PLAY_HAT;
    if (!b.mathChar.hat || b.mathChar.hat === 'none') b.mathChar.hat = FIRST_PLAY_HAT;
    b.firstPlay.rewardGiven = true;
    return b;
  }

  function earnStars(amount){
    const n = Math.max(0, Number(amount) || 0);
    const b = load();
    b.coins += n;
    b.earned += n;
    save(b);
    return b;
  }

  function gameIdFromLocation(){
    return (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/i, '') || 'index';
  }

  function recordGameStart(gameId){
    const b = load();
    b.lastPlayedGameId = gameId || gameIdFromLocation();
    b.lastPlayedAt = new Date().toISOString();
    save(b);
    return b;
  }

  function completeGame(gameId, details){
    const id = gameId || gameIdFromLocation();
    const b = load();
    const current = b.gameCompletions[id] || { count:0 };
    b.gameCompletions[id] = {
      ...current,
      count: (Number(current.count) || 0) + 1,
      lastCompletedAt: new Date().toISOString(),
      lastDetails: details || {}
    };
    if (!b.firstPlay.completed) {
      b.firstPlay.completed = true;
      b.firstPlay.gameId = id;
      b.firstPlay.completedAt = b.gameCompletions[id].lastCompletedAt;
      b.firstPlay.celebrationSeen = false;
      unlockFirstPlayReward(b);
    }
    save(b);
    return b;
  }

  function hasFirstPlayCompleted(){
    return !!load().firstPlay.completed;
  }

  function markCelebrationSeen(){
    const b = load();
    b.firstPlay.celebrationSeen = true;
    save(b);
    return b;
  }

  function isMuted(){
    return !!load().settings.muted;
  }

  function setMuted(value){
    const b = load();
    b.settings.muted = !!value;
    save(b);
    document.body.classList.toggle('arcade-muted', b.settings.muted);
    window.dispatchEvent(new CustomEvent('arcade:mutechange', { detail:{ muted:b.settings.muted } }));
    updateNavButtons();
    return b.settings.muted;
  }

  function isPaused(){
    return paused;
  }

  function setPaused(value){
    paused = !!value;
    document.body.classList.toggle('arcade-paused', paused);
    window.dispatchEvent(new CustomEvent('arcade:pausechange', { detail:{ paused } }));
    updateNavButtons();
    return paused;
  }

  function injectNavStyles(){
    if (document.getElementById('arcade-core-style')) return;
    const s = document.createElement('style');
    s.id = 'arcade-core-style';
    s.textContent = `
      body.arcade-has-game-nav{padding-top:calc(70px + env(safe-area-inset-top));}
      .arcade-game-nav{position:fixed;top:0;left:0;right:0;z-index:1250;display:flex;align-items:center;justify-content:center;gap:8px;min-height:58px;padding:calc(8px + env(safe-area-inset-top)) max(10px, env(safe-area-inset-left)) 8px max(10px, env(safe-area-inset-right));background:rgba(7,7,24,0.9);border-bottom:1px solid rgba(255,215,0,0.34);box-shadow:0 8px 28px rgba(0,0,0,0.3);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}
      .arcade-nav-btn{font-family:inherit;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:#fff;min-height:42px;min-width:42px;border-radius:14px;padding:8px 12px;display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;text-decoration:none;font-size:0.94rem;line-height:1;box-shadow:0 3px 0 rgba(0,0,0,0.24);}
      .arcade-nav-btn.primary{background:#FFD700;color:#5b3400;border-color:#FFD700;}
      .arcade-nav-btn[aria-pressed="true"]{background:#32ADE6;color:#041d32;border-color:#32ADE6;}
      .arcade-nav-btn:active{transform:translateY(2px);box-shadow:0 1px 0 rgba(0,0,0,0.24);}
      .arcade-nav-label{display:inline;}
      .arcade-pause-overlay{position:fixed;inset:0;z-index:1240;display:none;align-items:center;justify-content:center;background:rgba(3,3,16,0.56);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);padding:24px;}
      body.arcade-paused .arcade-pause-overlay{display:flex;}
      .arcade-pause-card,.arcade-settings-card{width:min(420px,92vw);background:rgba(14,14,42,0.96);border:2px solid rgba(255,215,0,0.46);border-radius:22px;padding:20px;text-align:center;color:white;box-shadow:0 18px 46px rgba(0,0,0,0.48);}
      .arcade-pause-card h2,.arcade-settings-card h2{margin:0 0 12px;color:#FFD700;font-size:1.6rem;}
      .arcade-settings-modal{position:fixed;inset:0;z-index:1320;display:none;align-items:center;justify-content:center;background:rgba(3,3,16,0.62);padding:20px;}
      .arcade-settings-modal.open{display:flex;}
      .arcade-setting-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 0;border-top:1px solid rgba(255,255,255,0.14);font-size:1rem;}
      .arcade-toggle{width:62px;height:34px;border:0;border-radius:999px;background:rgba(255,255,255,0.2);padding:4px;cursor:pointer;}
      .arcade-toggle span{display:block;width:26px;height:26px;border-radius:50%;background:white;transition:transform .18s ease;}
      .arcade-toggle[aria-pressed="true"]{background:#32ADE6;}
      .arcade-toggle[aria-pressed="true"] span{transform:translateX(28px);}
      @media (max-width:620px){body.arcade-has-game-nav{padding-top:calc(64px + env(safe-area-inset-top));}.arcade-game-nav{gap:5px;justify-content:space-between;}.arcade-nav-btn{min-width:38px;min-height:40px;border-radius:12px;padding:8px 9px;font-size:1rem;}.arcade-nav-label{display:none;}}
    `;
    document.head.appendChild(s);
  }

  function navButton(action){
    return document.querySelector(`[data-arcade-nav="${action}"]`);
  }

  function updateNavButtons(){
    const pause = navButton('pause');
    if (pause) {
      pause.setAttribute('aria-pressed', paused ? 'true' : 'false');
      pause.querySelector('[data-label]').textContent = paused ? 'Resume' : 'Pause';
      pause.querySelector('[data-icon]').textContent = paused ? '▶' : '⏸';
    }
    const mute = navButton('mute');
    if (mute) {
      const muted = isMuted();
      mute.setAttribute('aria-pressed', muted ? 'true' : 'false');
      mute.querySelector('[data-label]').textContent = muted ? 'Muted' : 'Mute';
      mute.querySelector('[data-icon]').textContent = muted ? '🔇' : '🔈';
    }
    const toggle = document.querySelector('[data-arcade-setting="mute"]');
    if (toggle) toggle.setAttribute('aria-pressed', isMuted() ? 'true' : 'false');
  }

  function openSettings(){
    if (!settingsModal) return;
    settingsModal.classList.add('open');
    settingsModal.querySelector('.arcade-settings-card').focus();
    updateNavButtons();
  }

  function closeSettings(){
    if (settingsModal) settingsModal.classList.remove('open');
  }

  function showHelp(gameId){
    if (window.ArcadeAvatar && ArcadeAvatar.showGuideForGame && ArcadeAvatar.showGuideForGame(gameId)) return;
    const help = document.querySelector('.avatar-guide-help');
    if (help) help.click();
  }

  function mountGameNav(options){
    if (navMounted || isHomePage() || !document.body) return;
    const opts = options || {};
    const gameId = opts.gameId || gameIdFromLocation();
    injectNavStyles();
    const nav = document.createElement('nav');
    nav.id = 'arcade-game-nav';
    nav.className = 'arcade-game-nav';
    nav.setAttribute('aria-label', 'Game controls');
    nav.innerHTML = `
      <a class="arcade-nav-btn primary" data-arcade-nav="home" href="index.html"><span>🏠</span><span class="arcade-nav-label">Home</span></a>
      <button class="arcade-nav-btn" data-arcade-nav="restart" type="button"><span>↻</span><span class="arcade-nav-label">Restart</span></button>
      <button class="arcade-nav-btn" data-arcade-nav="pause" type="button" aria-pressed="false"><span data-icon>⏸</span><span class="arcade-nav-label" data-label>Pause</span></button>
      <button class="arcade-nav-btn" data-arcade-nav="help" type="button"><span>?</span><span class="arcade-nav-label">Help</span></button>
      <button class="arcade-nav-btn" data-arcade-nav="mute" type="button" aria-pressed="false"><span data-icon>🔈</span><span class="arcade-nav-label" data-label>Mute</span></button>
      <button class="arcade-nav-btn" data-arcade-nav="settings" type="button"><span>⚙</span><span class="arcade-nav-label">Settings</span></button>
    `;
    pauseOverlay = document.createElement('div');
    pauseOverlay.className = 'arcade-pause-overlay';
    pauseOverlay.innerHTML = `<div class="arcade-pause-card"><h2>Paused</h2><button class="arcade-nav-btn primary" type="button" data-arcade-resume><span>▶</span><span>Resume</span></button></div>`;
    settingsModal = document.createElement('div');
    settingsModal.className = 'arcade-settings-modal';
    settingsModal.innerHTML = `<div class="arcade-settings-card" role="dialog" aria-modal="true" aria-label="Game settings" tabindex="-1">
      <h2>Settings</h2>
      <div class="arcade-setting-row"><span>Mute sounds</span><button class="arcade-toggle" type="button" data-arcade-setting="mute" aria-pressed="false"><span></span></button></div>
      <button class="arcade-nav-btn primary" type="button" data-arcade-close-settings><span>✓</span><span>Done</span></button>
    </div>`;
    document.body.prepend(nav);
    document.body.appendChild(pauseOverlay);
    document.body.appendChild(settingsModal);
    document.body.classList.add('arcade-has-game-nav');
    navMounted = true;

    navButton('restart').addEventListener('click', () => {
      if (typeof opts.onRestart === 'function') opts.onRestart();
      else location.reload();
    });
    navButton('pause').addEventListener('click', () => setPaused(!paused));
    navButton('help').addEventListener('click', () => showHelp(gameId));
    navButton('mute').addEventListener('click', () => setMuted(!isMuted()));
    navButton('settings').addEventListener('click', openSettings);
    pauseOverlay.querySelector('[data-arcade-resume]').addEventListener('click', () => setPaused(false));
    settingsModal.querySelector('[data-arcade-close-settings]').addEventListener('click', closeSettings);
    settingsModal.querySelector('[data-arcade-setting="mute"]').addEventListener('click', () => setMuted(!isMuted()));
    settingsModal.addEventListener('click', e => { if (e.target === settingsModal) closeSettings(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && settingsModal.classList.contains('open')) closeSettings();
    });
    setMuted(isMuted());
    updateNavButtons();
  }

  function autoMount(){
    if (isHomePage()) return;
    const id = gameIdFromLocation();
    recordGameStart(id);
    mountGameNav({ gameId:id });
  }

  load();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoMount);
  else autoMount();

  window.ArcadeCore = {
    load,
    save,
    earnStars,
    recordGameStart,
    completeGame,
    hasFirstPlayCompleted,
    markCelebrationSeen,
    isMuted,
    setMuted,
    isPaused,
    setPaused,
    mountGameNav
  };
})();
