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
      '#home-link{top:calc(16px + env(safe-area-inset-top)) !important;' +
                 'left:calc(16px + env(safe-area-inset-left)) !important;}';
    head.appendChild(s);
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
