/* Shared iOS / "Add to Home Screen" web-app layer for the Space Arcade.
   Loaded early in <head> by every game so it can inject meta tags before paint. */
(function(){
  var head = document.head || document.getElementsByTagName('head')[0];

  function meta(name, content){
    if (!head || document.querySelector('meta[name="'+name+'"]')) return;
    var m = document.createElement('meta');
    m.setAttribute('name', name);
    m.setAttribute('content', content);
    head.appendChild(m);
  }

  // Launch fullscreen (no Safari chrome) when opened from the Home Screen
  meta('apple-mobile-web-app-capable', 'yes');
  meta('mobile-web-app-capable', 'yes');
  meta('apple-mobile-web-app-status-bar-style', 'black-translucent');
  meta('apple-mobile-web-app-title', 'Space Arcade');
  meta('theme-color', '#070718');

  if (head && !document.querySelector('link[rel="manifest"]')){
    var lm = document.createElement('link');
    lm.rel = 'manifest'; lm.href = 'manifest.json';
    head.appendChild(lm);
  }
  if (head && !document.querySelector('link[rel="apple-touch-icon"]')){
    var li = document.createElement('link');
    li.rel = 'apple-touch-icon'; li.href = 'icon.svg';
    head.appendChild(li);
  }

  // Touch-friendly global styles: no tap flash / callout, no rubber-band scroll,
  // and keep the fixed Home button clear of the notch / Dynamic Island.
  if (head){
    var s = document.createElement('style');
    s.textContent =
      'html{-webkit-text-size-adjust:100%;}' +
      '*{-webkit-tap-highlight-color:rgba(0,0,0,0);}' +
      'body{-webkit-touch-callout:none;overscroll-behavior:none;}' +
      'a,button{touch-action:manipulation;}' +
      'body.arcade-has-home-bar{padding-top:calc(62px + env(safe-area-inset-top));}' +
      '#arcade-home-bar{position:fixed;top:0;left:0;right:0;z-index:1200;' +
        'display:flex;align-items:center;justify-content:center;gap:10px;' +
        'min-height:54px;padding:calc(9px + env(safe-area-inset-top)) 16px 9px;' +
        'background:rgba(7,7,24,0.86);backdrop-filter:blur(14px);' +
        '-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,215,0,0.36);' +
        'box-shadow:0 8px 28px rgba(0,0,0,0.28);color:#FFD700;text-decoration:none;' +
        'font-family:inherit;font-size:1rem;text-shadow:0 0 12px rgba(255,200,0,0.28);}' +
      '#arcade-home-bar:active{transform:translateY(1px);}' +
      '#home-link.arcade-hidden-home-link,.back-btn.arcade-hidden-home-link{display:none !important;}' +
      '#home-link{top:calc(16px + env(safe-area-inset-top)) !important;' +
                 'left:calc(16px + env(safe-area-inset-left)) !important;}';
    head.appendChild(s);
  }

  function isHomePage(){
    var file = location.pathname.split('/').pop();
    return !file || file === 'index.html';
  }

  function installHomeBar(){
    if (isHomePage() || !document.body || document.getElementById('arcade-home-bar')) return;
    Array.prototype.forEach.call(document.querySelectorAll('#home-link,.back-btn'), function(el){
      el.classList.add('arcade-hidden-home-link');
    });
    var a = document.createElement('a');
    a.id = 'arcade-home-bar';
    a.href = 'index.html';
    a.innerHTML = '<span>🚀</span><span>Space Arcade</span>';
    document.body.classList.add('arcade-has-home-bar');
    document.body.appendChild(a);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installHomeBar);
  } else {
    installHomeBar();
  }

  // Block pinch-zoom (belt-and-braces alongside user-scalable=no)
  ['gesturestart','gesturechange','gestureend'].forEach(function(ev){
    document.addEventListener(ev, function(e){ e.preventDefault(); }, { passive:false });
  });

  // In iOS standalone mode plain <a> links would kick the user out to Safari.
  // Intercept same-origin links and navigate inside the web-app shell instead.
  if (window.navigator.standalone){
    document.addEventListener('click', function(e){
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (a && a.target !== '_blank' && a.host === location.host){
        e.preventDefault();
        location.href = a.getAttribute('href');
      }
    }, false);
  }

  // iOS keeps audio muted until a user gesture — warm up the audio session on
  // the first tap so the games' sound effects play.
  function unlock(){
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC){
        if (!window.__arcadeAudio) window.__arcadeAudio = new AC();
        if (window.__arcadeAudio.state === 'suspended') window.__arcadeAudio.resume();
      }
    } catch(e){}
    document.removeEventListener('touchend', unlock);
    document.removeEventListener('click', unlock);
  }
  document.addEventListener('touchend', unlock, false);
  document.addEventListener('click', unlock, false);
})();
