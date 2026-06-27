/* Shared Space Arcade avatar, shop, and dress-up persistence. */
(function(){
  const ARCADE_KEY = 'masonArcade';
  const DEFAULT_CHAR = { color:'red', hat:'none', outfit:'none', pet:'none' };
  const TAB_KEYS = { colors:'color', hats:'hat', outfits:'outfit', pets:'pet' };
  const TABS = [
    { id:'colors', label:'🎨 Colors' },
    { id:'hats', label:'🎩 Hats' },
    { id:'outfits', label:'👕 Outfits' },
    { id:'pets', label:'🐾 Pets' },
  ];

  const CATALOG_DATA = {
    colors:[
      {id:'red',    label:'Classic Red',   price:0,  c:'#FF3B30', owned:true },
      {id:'orange', label:'Bright Orange', price:10, c:'#FF9500', owned:false},
      {id:'yellow', label:'Sunny Yellow',  price:10, c:'#FFD700', owned:false},
      {id:'blue',   label:'Deep Blue',     price:10, c:'#007AFF', owned:false},
      {id:'green',  label:'Leafy Green',   price:15, c:'#34C759', owned:false},
      {id:'purple', label:'Royal Purple',  price:15, c:'#AF52DE', owned:false},
      {id:'pink',   label:'Pretty Pink',   price:20, c:'#FF2D55', owned:false},
      {id:'teal',   label:'Cool Teal',     price:20, c:'#32ADE6', owned:false},
      {id:'gold',   label:'✨ Gold ✨',    price:50, c:'#FFB700', owned:false},
    ],
    hats:[
      {id:'none',      label:'No Hat',         price:0,  emoji:'😶',  owned:true },
      {id:'party',     label:'Party Hat',      price:15, emoji:'🎉',  owned:false},
      {id:'cowboy',    label:'Cowboy Hat',     price:15, emoji:'🤠',  owned:false},
      {id:'crown',     label:'Crown',          price:25, emoji:'👑',  owned:false},
      {id:'propeller', label:'Propeller',      price:20, emoji:'🌀',  owned:false},
      {id:'tophat',    label:'Top Hat',        price:30, emoji:'🎩',  owned:false},
      {id:'wizard',    label:'Wizard Hat',     price:35, emoji:'🧙',  owned:false},
      {id:'astronaut', label:'Astronaut Helm', price:40, emoji:'🚀',  owned:false},
    ],
    outfits:[
      {id:'none',      label:'Default',    price:0,  emoji:'👤', owned:true },
      {id:'stripes',   label:'Stripes',    price:20, emoji:'〰️', owned:false},
      {id:'stars',     label:'Stars',      price:20, emoji:'⭐', owned:false},
      {id:'polka',     label:'Polka Dots', price:25, emoji:'🔵', owned:false},
      {id:'rainbow',   label:'Rainbow',    price:35, emoji:'🌈', owned:false},
      {id:'lightning', label:'Lightning',  price:30, emoji:'⚡', owned:false},
      {id:'hearts',    label:'Hearts',     price:30, emoji:'❤️', owned:false},
      {id:'ninja',     label:'Ninja',      price:45, emoji:'🥷', owned:false},
    ],
    pets:[
      {id:'none',   label:'No Pet', price:0,  emoji:'🚫', owned:true },
      {id:'dog',    label:'Dog',    price:30, emoji:'🐶', owned:false},
      {id:'cat',    label:'Cat',    price:30, emoji:'🐱', owned:false},
      {id:'donkey', label:'Donkey', price:40, emoji:'🫏', owned:false},
      {id:'slime',  label:'Slime',  price:25, emoji:'🟢', owned:false},
    ]
  };

  const BODY = {red:'#FF3B30',orange:'#FF9500',yellow:'#FFD700',blue:'#007AFF',green:'#34C759',purple:'#AF52DE',pink:'#FF2D55',teal:'#32ADE6',gold:'#FFB700'};
  const mounts = {};
  const guideMounts = {};

  function arcadeLoad(){ try { return JSON.parse(localStorage.getItem(ARCADE_KEY)) || {}; } catch(e){ return {}; } }
  function arcadeSave(b){ localStorage.setItem(ARCADE_KEY, JSON.stringify(b)); }
  function copyChar(char){ return {...DEFAULT_CHAR, ...(char || {})}; }
  function cloneCatalog(){
    return Object.fromEntries(Object.entries(CATALOG_DATA).map(([tab, items]) => [tab, items.map(item => ({...item}))]));
  }
  function defaultOwned(){
    const owned = {};
    Object.entries(CATALOG_DATA).forEach(([tab, items]) => {
      owned[tab] = items.filter(item => item.owned).map(item => item.id);
    });
    return owned;
  }
  function normalizeOwned(owned){
    const base = defaultOwned();
    Object.keys(CATALOG_DATA).forEach(tab => {
      const ids = Array.isArray(owned && owned[tab]) ? owned[tab] : [];
      base[tab] = Array.from(new Set([...base[tab], ...ids]));
    });
    return base;
  }
  function ownedFromCatalog(catalog){
    const owned = {};
    Object.keys(catalog).forEach(tab => {
      owned[tab] = catalog[tab].filter(item => item.owned).map(item => item.id);
    });
    return owned;
  }
  function applyOwned(catalog, owned){
    Object.keys(catalog).forEach(tab => {
      const ids = new Set((owned && owned[tab]) || []);
      catalog[tab].forEach(item => { item.owned = item.owned || ids.has(item.id); });
    });
    return catalog;
  }
  function ensureState(bank){
    let changed = false;
    if (!bank.avatarChar) {
      bank.avatarChar = copyChar(bank.mathChar);
      changed = true;
    } else {
      bank.avatarChar = copyChar(bank.avatarChar);
    }
    if (!bank.avatarOwned) {
      bank.avatarOwned = normalizeOwned(bank.mathOwned);
      changed = true;
    } else {
      bank.avatarOwned = normalizeOwned(bank.avatarOwned);
    }
    if (!bank.mathChar || !bank.mathOwned) {
      bank.mathChar = copyChar(bank.avatarChar);
      bank.mathOwned = normalizeOwned(bank.avatarOwned);
      changed = true;
    }
    return { bank, changed };
  }
  function getState(save){
    const result = ensureState(arcadeLoad());
    if (save && result.changed) arcadeSave(result.bank);
    return {
      bank: result.bank,
      char: copyChar(result.bank.avatarChar),
      owned: normalizeOwned(result.bank.avatarOwned),
      catalog: applyOwned(cloneCatalog(), result.bank.avatarOwned)
    };
  }
  function saveState(bank, char, catalog){
    const owned = ownedFromCatalog(catalog);
    bank.avatarChar = copyChar(char);
    bank.avatarOwned = normalizeOwned(owned);
    bank.mathChar = copyChar(char);
    bank.mathOwned = normalizeOwned(owned);
    arcadeSave(bank);
  }

  function shade(hex, amt){
    const n = parseInt(hex.replace('#',''), 16);
    const R = Math.min(255, Math.max(0, (n >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt));
    const B = Math.min(255, Math.max(0, (n & 0xff) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }
  function resolveEl(target){
    return typeof target === 'string' ? document.getElementById(target) : target;
  }

  function drawChar(target, mood='happy', size=148, char){
    const el = resolveEl(target); if (!el) return;
    const activeChar = copyChar(char || getState(false).char);
    const col = BODY[activeChar.color] || '#FF3B30';
    const dark = shade(col, -35), feet = shade(col, -58);
    const vc = {happy:'#72D7F5',excited:'#FFDF00',thinking:'#B4E3FF',sad:'#9ECFEE'}[mood] || '#72D7F5';
    const mouth = mood === 'sad'
      ? `<path d="M65 97 Q80 87 95 97" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>`
      : mood === 'thinking'
      ? `<line x1="66" y1="93" x2="94" y2="93" stroke="white" stroke-width="3" stroke-linecap="round"/>`
      : `<path d="M65 88 Q80 102 95 88" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    const brow = mood === 'thinking'
      ? `<path d="M64 70 Q69 66 74 70" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M86 70 Q91 66 96 70" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/>` : '';
    const hats = {
      party:`<polygon points="80,8 57,44 103,44" fill="#FF4500"/>
        <polygon points="80,8 67,27 93,27" fill="#FFD700" opacity="0.9"/>
        <circle cx="80" cy="8" r="5" fill="#FF0066"/>
        <line x1="57" y1="44" x2="103" y2="44" stroke="#FF0066" stroke-width="4"/>`,
      cowboy:`<ellipse cx="80" cy="46" rx="32" ry="9" fill="#7B3F00"/>
        <rect x="58" y="20" width="44" height="28" rx="6" fill="#9B5010"/>
        <rect x="58" y="44" width="44" height="5" rx="2" fill="#FFD700"/>`,
      crown:`<polygon points="52,47 52,20 64,34 80,12 96,34 108,20 108,47" fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
        <circle cx="80" cy="15" r="6" fill="#FF3B30"/>
        <circle cx="52" cy="33" r="5" fill="#007AFF"/>
        <circle cx="108" cy="33" r="5" fill="#34C759"/>`,
      propeller:`<rect x="76" y="18" width="8" height="24" fill="#888" rx="3"/>
        <circle cx="80" cy="18" r="7" fill="#555"/>
        <ellipse cx="80" cy="13" rx="22" ry="7" fill="#FF3B30" transform="rotate(-18 80 13)"/>
        <ellipse cx="80" cy="13" rx="22" ry="7" fill="#007AFF" transform="rotate(72 80 13)"/>`,
      tophat:`<ellipse cx="80" cy="47" rx="30" ry="8" fill="#111"/>
        <rect x="60" y="14" width="40" height="34" rx="4" fill="#222"/>
        <rect x="60" y="44" width="40" height="5" rx="2" fill="#FF3B30"/>`,
      wizard:`<polygon points="80,4 54,52 106,52" fill="#6A0DAD"/>
        <ellipse cx="80" cy="52" rx="28" ry="8" fill="#7B17D9"/>
        <circle cx="70" cy="30" r="5" fill="#FFD700"/>
        <circle cx="88" cy="19" r="3.5" fill="#FFD700"/>`,
      astronaut:`<ellipse cx="80" cy="30" rx="32" ry="30" fill="white" opacity="0.92"/>
        <ellipse cx="80" cy="33" rx="20" ry="15" fill="${vc}" opacity="0.65"/>
        <ellipse cx="80" cy="30" rx="32" ry="30" fill="none" stroke="#ddd" stroke-width="2"/>`,
      none:''
    };
    const outfits = {
      stripes:`<line x1="60" y1="96" x2="60" y2="140" stroke="white" stroke-width="3.5" opacity="0.38"/>
        <line x1="72" y1="96" x2="72" y2="140" stroke="white" stroke-width="3.5" opacity="0.38"/>
        <line x1="84" y1="96" x2="84" y2="140" stroke="white" stroke-width="3.5" opacity="0.38"/>
        <line x1="96" y1="96" x2="96" y2="140" stroke="white" stroke-width="3.5" opacity="0.38"/>`,
      stars:`<text x="60" y="118" font-size="16" fill="white" opacity="0.65">⭐</text>
        <text x="80" y="133" font-size="12" fill="white" opacity="0.65">⭐</text>
        <text x="70" y="103" font-size="11" fill="white" opacity="0.65">⭐</text>`,
      polka:`<circle cx="66" cy="108" r="6" fill="white" opacity="0.38"/>
        <circle cx="88" cy="118" r="6" fill="white" opacity="0.38"/>
        <circle cx="76" cy="131" r="6" fill="white" opacity="0.38"/>
        <circle cx="97" cy="107" r="4" fill="white" opacity="0.38"/>`,
      rainbow:`<rect x="56" y="96"  width="48" height="8" fill="#FF3B30" opacity="0.5"/>
        <rect x="56" y="104" width="48" height="8" fill="#FF9500" opacity="0.5"/>
        <rect x="56" y="112" width="48" height="8" fill="#FFD700" opacity="0.5"/>
        <rect x="56" y="120" width="48" height="8" fill="#34C759" opacity="0.5"/>
        <rect x="56" y="128" width="48" height="8" fill="#007AFF" opacity="0.5"/>`,
      lightning:`<polygon points="82,96 70,120 78,120 66,142 90,116 81,116 94,96" fill="#FFD700" opacity="0.75"/>`,
      hearts:`<text x="60" y="118" font-size="18" fill="white" opacity="0.72">❤️</text>
        <text x="80" y="132" font-size="13" fill="white" opacity="0.72">❤️</text>`,
      ninja:`<rect x="56" y="96" width="48" height="46" fill="#111" opacity="0.48" rx="5"/>
        <rect x="56" y="108" width="48" height="5" fill="white" opacity="0.38"/>`,
      none:''
    };
    el.innerHTML = `<svg viewBox="0 0 160 205" width="${size}" height="${size*1.28}" xmlns="http://www.w3.org/2000/svg">
      ${hats[activeChar.hat] || ''}
      <ellipse cx="80" cy="108" rx="46" ry="50" fill="${col}"/>
      <ellipse cx="96" cy="97" rx="20" ry="36" fill="${dark}" opacity="0.28"/>
      ${outfits[activeChar.outfit] || ''}
      <ellipse cx="80" cy="82" rx="29" ry="23" fill="${vc}" opacity="0.88"/>
      <ellipse cx="70" cy="74" rx="9" ry="6" fill="white" opacity="0.38"/>
      <circle cx="70" cy="81" r="4.5" fill="white"/>
      <circle cx="90" cy="81" r="4.5" fill="white"/>
      ${brow}${mouth}
      <rect x="118" y="93" width="19" height="30" rx="5" fill="${dark}"/>
      <rect x="120" y="97" width="15" height="6" rx="2" fill="${col}" opacity="0.55"/>
      <rect x="62" y="152" width="22" height="30" rx="9" fill="${dark}"/>
      <rect x="86" y="152" width="22" height="30" rx="9" fill="${dark}"/>
      <ellipse cx="73" cy="182" rx="14" ry="8" fill="${feet}"/>
      <ellipse cx="97" cy="182" rx="14" ry="8" fill="${feet}"/>
    </svg>`;
  }

  function drawPet(target, mood='happy', size=80, char){
    const el = resolveEl(target); if (!el) return;
    const pet = copyChar(char || getState(false).char).pet;
    if (!pet || pet === 'none') { el.innerHTML = ''; return; }
    const ex = mood === 'excited', sad = mood === 'sad';
    const svgs = {
      dog:`<svg viewBox="0 0 100 120" width="${size}" height="${size*1.2}" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="28" cy="38" rx="13" ry="19" fill="#C8860A" transform="rotate(-15 28 38)"/>
        <ellipse cx="72" cy="38" rx="13" ry="19" fill="#C8860A" transform="rotate(15 72 38)"/>
        <ellipse cx="28" cy="40" rx="8" ry="13" fill="#E8A020" transform="rotate(-15 28 40)"/>
        <ellipse cx="72" cy="40" rx="8" ry="13" fill="#E8A020" transform="rotate(15 72 40)"/>
        <ellipse cx="50" cy="52" rx="33" ry="31" fill="#D4901A"/>
        <ellipse cx="50" cy="65" rx="21" ry="15" fill="#E8A020"/>
        <circle cx="38" cy="46" r="7" fill="white"/><circle cx="62" cy="46" r="7" fill="white"/>
        <circle cx="${ex?40:38}" cy="${ex?44:46}" r="4" fill="#333"/>
        <circle cx="${ex?64:62}" cy="${ex?44:46}" r="4" fill="#333"/>
        <circle cx="${ex?41:39}" cy="${ex?43:45}" r="1.5" fill="white"/>
        <circle cx="${ex?65:63}" cy="${ex?43:45}" r="1.5" fill="white"/>
        <ellipse cx="50" cy="62" rx="7" ry="5" fill="#222"/>
        ${sad?`<path d="M42 70 Q50 66 58 70" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
             :`<path d="M42 70 Q50 78 58 70" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
               <ellipse cx="50" cy="79" rx="6" ry="4" fill="#FF6B9D" opacity="0.85"/>`}
        <ellipse cx="50" cy="105" rx="25" ry="16" fill="#D4901A"/>
        <path d="M75 105 Q94 90 86 75" stroke="#C8860A" stroke-width="7" fill="none" stroke-linecap="round"/>
      </svg>`,
      cat:`<svg viewBox="0 0 100 120" width="${size}" height="${size*1.2}" xmlns="http://www.w3.org/2000/svg">
        <polygon points="22,20 12,48 38,44" fill="#888"/>
        <polygon points="78,20 62,44 88,48" fill="#888"/>
        <polygon points="24,25 17,44 36,42" fill="#FFB3B3"/>
        <polygon points="76,25 64,42 83,44" fill="#FFB3B3"/>
        <ellipse cx="50" cy="58" rx="35" ry="33" fill="#999"/>
        <ellipse cx="50" cy="70" rx="21" ry="13" fill="#bbb"/>
        <ellipse cx="37" cy="52" rx="9" ry="${ex?11:8}" fill="#FFD700"/>
        <ellipse cx="63" cy="52" rx="9" ry="${ex?11:8}" fill="#FFD700"/>
        <ellipse cx="37" cy="52" rx="${ex?3:5}" ry="${ex?9:5}" fill="#111"/>
        <ellipse cx="63" cy="52" rx="${ex?3:5}" ry="${ex?9:5}" fill="#111"/>
        <circle cx="34" cy="49" r="1.5" fill="white"/><circle cx="60" cy="49" r="1.5" fill="white"/>
        <polygon points="50,63 46,67 54,67" fill="#FF9999"/>
        <line x1="22" y1="66" x2="44" y2="68" stroke="#666" stroke-width="1.5"/>
        <line x1="22" y1="70" x2="44" y2="70" stroke="#666" stroke-width="1.5"/>
        <line x1="56" y1="68" x2="78" y2="66" stroke="#666" stroke-width="1.5"/>
        <line x1="56" y1="70" x2="78" y2="70" stroke="#666" stroke-width="1.5"/>
        ${sad?`<path d="M44 72 Q50 68 56 72" stroke="#888" stroke-width="2" fill="none" stroke-linecap="round"/>`
             :`<path d="M44 72 Q50 78 56 72" stroke="#888" stroke-width="2" fill="none" stroke-linecap="round"/>`}
        <ellipse cx="50" cy="106" rx="25" ry="15" fill="#999"/>
        <path d="M75 108 Q100 94 88 72" stroke="#999" stroke-width="9" fill="none" stroke-linecap="round"/>
      </svg>`,
      donkey:`<svg viewBox="0 0 100 128" width="${size}" height="${size*1.28}" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="30" cy="18" rx="10" ry="22" fill="#888" transform="rotate(-10 30 18)"/>
        <ellipse cx="70" cy="18" rx="10" ry="22" fill="#888" transform="rotate(10 70 18)"/>
        <ellipse cx="30" cy="19" rx="6"  ry="16" fill="#FFB3B3" transform="rotate(-10 30 19)"/>
        <ellipse cx="70" cy="19" rx="6"  ry="16" fill="#FFB3B3" transform="rotate(10 70 19)"/>
        <ellipse cx="50" cy="55" rx="31" ry="29" fill="#888"/>
        <ellipse cx="50" cy="70" rx="19" ry="13" fill="#aaa"/>
        <circle cx="36" cy="48" r="7" fill="white"/><circle cx="64" cy="48" r="7" fill="white"/>
        <circle cx="${ex?38:36}" cy="${ex?46:48}" r="4" fill="#4a3000"/>
        <circle cx="${ex?66:64}" cy="${ex?46:48}" r="4" fill="#4a3000"/>
        <circle cx="${ex?39:37}" cy="${ex?45:47}" r="1.5" fill="white"/>
        <circle cx="${ex?67:65}" cy="${ex?45:47}" r="1.5" fill="white"/>
        <circle cx="44" cy="72" r="3.5" fill="#777"/><circle cx="56" cy="72" r="3.5" fill="#777"/>
        ${sad?`<path d="M38 78 Q50 74 62 78" stroke="#666" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
             :`<path d="M38 78 Q50 84 62 78" stroke="#666" stroke-width="2.5" fill="none" stroke-linecap="round"/>`}
        <rect x="46" y="28" width="8" height="26" rx="3" fill="#555"/>
        <ellipse cx="50" cy="110" rx="26" ry="15" fill="#888"/>
      </svg>`,
      slime:`<svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="66" rx="44" ry="30" fill="#00CC44" opacity="0.18"/>
        <path d="M10 65 Q8 30 30 18 Q50 8 70 18 Q92 30 90 65 Q85 90 50 95 Q15 90 10 65Z" fill="#00CC55"/>
        <ellipse cx="35" cy="35" rx="12" ry="8" fill="white" opacity="0.22" transform="rotate(-20 35 35)"/>
        <ellipse cx="25" cy="88" rx="8" ry="9" fill="#00CC55"/>
        <ellipse cx="75" cy="86" rx="7" ry="8" fill="#00CC55"/>
        <ellipse cx="50" cy="92" rx="6" ry="7" fill="#00CC55"/>
        <circle cx="36" cy="52" r="${ex?10:8}" fill="white"/>
        <circle cx="64" cy="52" r="${ex?10:8}" fill="white"/>
        <circle cx="${ex?38:36}" cy="${ex?50:52}" r="${ex?6:5}" fill="#111"/>
        <circle cx="${ex?66:64}" cy="${ex?50:52}" r="${ex?6:5}" fill="#111"/>
        <circle cx="${ex?40:38}" cy="${ex?48:50}" r="2" fill="white"/>
        <circle cx="${ex?68:66}" cy="${ex?48:50}" r="2" fill="white"/>
        ${sad?`<path d="M38 66 Q50 60 62 66" stroke="#007722" stroke-width="3" fill="none" stroke-linecap="round"/>`
             :`<path d="M38 66 Q50 74 62 66" stroke="#007722" stroke-width="3" fill="none" stroke-linecap="round"/>
               <circle cx="42" cy="64" r="3.5" fill="#007722" opacity="0.45"/>
               <circle cx="58" cy="64" r="3.5" fill="#007722" opacity="0.45"/>`}
        <circle cx="18" cy="50" r="4" fill="#00EE66" opacity="0.45"/>
        <circle cx="84" cy="55" r="3" fill="#00EE66" opacity="0.45"/>
      </svg>`
    };
    el.innerHTML = svgs[pet] || '';
  }

  function injectStyles(){
    if (document.getElementById('arcade-avatar-style')) return;
    const s = document.createElement('style');
    s.id = 'arcade-avatar-style';
    s.textContent = `
      .arcade-avatar-shop{width:100%;display:grid;gap:14px;}
      .avatar-preview{display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;background:rgba(255,255,255,0.09);border:1px solid rgba(255,215,0,0.34);border-radius:20px;padding:15px 18px;}
      .avatar-preview-art{display:flex;align-items:flex-end;justify-content:center;gap:6px;min-width:170px;}
      .avatar-balance{font-size:1.45rem;color:#FFD700;text-shadow:0 0 12px rgba(255,200,0,0.35);}
      .avatar-tabs{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;}
      .avatar-tab{font-family:inherit;font-size:0.92rem;padding:9px 16px;border:1px solid rgba(255,255,255,0.22);border-radius:14px;cursor:pointer;background:rgba(255,255,255,0.12);color:rgba(255,255,255,0.86);}
      .avatar-tab.active{background:#fff;color:#FF4500;border-color:#fff;}
      .avatar-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(135px,1fr));gap:12px;width:100%;}
      .avatar-card{background:rgba(255,255,255,0.94);border:3px solid transparent;border-radius:18px;padding:13px;text-align:center;box-shadow:0 4px 0 rgba(0,0,0,0.18);position:relative;}
      .avatar-card.owned{border-color:#30C840;}
      .avatar-card.equipped{border-color:#FF6B35;background:#FFF3E8;}
      .avatar-own-badge{position:absolute;top:5px;right:5px;background:#30C840;color:#fff;border-radius:50%;width:20px;height:20px;font-size:11px;display:flex;align-items:center;justify-content:center;}
      .avatar-visual{height:54px;display:flex;align-items:center;justify-content:center;}
      .avatar-color-dot{width:50px;height:50px;border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.2);}
      .avatar-emoji{font-size:2.35rem;}
      .avatar-card-name{font-size:0.88rem;color:#444;margin-top:6px;min-height:34px;display:flex;align-items:center;justify-content:center;}
      .avatar-buy-btn{font-family:inherit;font-size:0.8rem;padding:8px 0;width:100%;border:0;border-radius:10px;cursor:pointer;margin-top:7px;color:white;}
      .avatar-guide-help{position:fixed;right:16px;top:calc(66px + env(safe-area-inset-top));z-index:1210;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,215,0,0.48);background:rgba(7,7,24,0.86);color:#FFD700;font-family:inherit;font-size:1.1rem;box-shadow:0 8px 24px rgba(0,0,0,0.32);cursor:pointer;}
      .avatar-guide-overlay{position:fixed;inset:0;z-index:1300;background:rgba(3,3,16,0.68);display:flex;align-items:center;justify-content:center;padding:20px;}
      .avatar-guide-overlay[hidden]{display:none;}
      .avatar-guide-card{width:min(560px,94vw);background:rgba(14,14,42,0.96);border:2px solid rgba(255,215,0,0.46);border-radius:24px;padding:20px;box-shadow:0 18px 50px rgba(0,0,0,0.48);color:#fff;}
      .avatar-guide-main{display:flex;gap:18px;align-items:flex-end;}
      .avatar-guide-art{display:flex;align-items:flex-end;justify-content:center;gap:4px;min-width:142px;}
      .avatar-guide-copy{flex:1;display:grid;gap:10px;}
      .avatar-guide-title{font-size:1.45rem;color:#FFD700;text-shadow:0 0 12px rgba(255,200,0,0.35);}
      .avatar-guide-bubble{position:relative;background:#fff;color:#333;border-radius:18px;padding:14px 16px;font-size:1.05rem;line-height:1.35;min-height:78px;display:flex;align-items:center;}
      .avatar-guide-bubble::after{content:'';position:absolute;left:-12px;bottom:20px;border:7px solid transparent;border-right-color:#fff;}
      .avatar-guide-dots{display:flex;gap:6px;justify-content:center;min-height:9px;}
      .avatar-guide-dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.3);}
      .avatar-guide-dot.active{background:#FFD700;}
      .avatar-guide-actions{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:16px;}
      .avatar-guide-btn{font-family:inherit;border:0;border-radius:999px;padding:10px 18px;cursor:pointer;font-size:0.95rem;}
      .avatar-guide-btn.secondary{background:rgba(255,255,255,0.12);color:#fff;border:1px solid rgba(255,255,255,0.22);}
      .avatar-guide-btn.primary{background:#FFD700;color:#7A3800;}
      @media (max-width:520px){.avatar-preview{align-items:center}.avatar-grid{grid-template-columns:repeat(2,minmax(0,1fr));}.avatar-card-name{font-size:0.78rem;}.avatar-tab{font-size:0.82rem;padding:8px 12px;}}
      @media (max-width:520px){.avatar-guide-overlay{align-items:flex-end;padding:12px;}.avatar-guide-card{padding:16px;border-radius:20px;}.avatar-guide-main{align-items:center;gap:10px;}.avatar-guide-art{min-width:96px;}.avatar-guide-title{font-size:1.18rem;}.avatar-guide-bubble{font-size:0.92rem;min-height:96px;}.avatar-guide-bubble::after{display:none;}.avatar-guide-help{right:12px;top:calc(62px + env(safe-area-inset-top));}}
    `;
    document.head.appendChild(s);
  }

  function renderShop(rootId){
    const ctx = mounts[rootId]; if (!ctx) return;
    const { root } = ctx;
    const state = getState(true);
    const tab = ctx.activeTab || 'colors';
    const items = state.catalog[tab] || [];
    const key = TAB_KEYS[tab];

    root.querySelectorAll('[data-avatar-tab]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.avatarTab === tab);
    });
    const balance = root.querySelector('[data-avatar-balance]');
    if (balance) balance.textContent = state.bank.coins || 0;
    drawChar(root.querySelector('[data-avatar-char]'), 'happy', ctx.charSize || 132, state.char);
    drawPet(root.querySelector('[data-avatar-pet]'), 'happy', ctx.petSize || 74, state.char);

    const grid = root.querySelector('[data-avatar-grid]');
    if (!grid) return;
    grid.innerHTML = '';
    items.forEach(item => {
      const equipped = state.char[key] === item.id;
      const card = document.createElement('div');
      card.className = 'avatar-card' + (item.owned ? ' owned' : '') + (equipped ? ' equipped' : '');
      const visual = tab === 'colors'
        ? `<div class="avatar-color-dot" style="background:${item.c}"></div>`
        : `<div class="avatar-emoji">${item.emoji}</div>`;
      const btnLabel = equipped ? '✓ On!' : item.owned ? 'Put on!' : `Buy ⭐${item.price}`;
      const btnBg = equipped ? '#30C840' : item.owned ? '#FF6B35' : '#007AFF';
      card.innerHTML = `${item.owned ? '<div class="avatar-own-badge">✓</div>' : ''}
        <div class="avatar-visual">${visual}</div>
        <div class="avatar-card-name">${item.label}</div>`;
      const button = document.createElement('button');
      button.className = 'avatar-buy-btn';
      button.style.background = btnBg;
      button.textContent = btnLabel;
      button.addEventListener('click', () => buyOrEquip(rootId, tab, item.id));
      card.appendChild(button);
      grid.appendChild(card);
    });
  }

  function buyOrEquip(rootId, tab, id){
    const ctx = mounts[rootId]; if (!ctx) return;
    const state = getState(true);
    const item = (state.catalog[tab] || []).find(entry => entry.id === id);
    const key = TAB_KEYS[tab];
    if (!item || !key) return;
    if (!item.owned) {
      const coins = state.bank.coins || 0;
      if (coins < item.price) {
        if (ctx.onToast) ctx.onToast('Not enough stars! Keep playing! ⭐');
        return;
      }
      state.bank.coins = coins - item.price;
      item.owned = true;
    }
    state.char[key] = id;
    saveState(state.bank, state.char, state.catalog);
    renderShop(rootId);
    if (ctx.onChange) ctx.onChange(getState(false));
  }

  function mountShop(options){
    injectStyles();
    const root = resolveEl(options.root || options.rootId);
    if (!root) return;
    const rootId = root.id || ('avatar-shop-' + Object.keys(mounts).length);
    if (!root.id) root.id = rootId;
    mounts[rootId] = {
      root,
      activeTab: 'colors',
      onChange: options.onChange,
      onToast: options.onToast,
      charSize: options.charSize,
      petSize: options.petSize,
    };
    root.innerHTML = `<div class="arcade-avatar-shop">
      <div class="avatar-preview">
        <div class="avatar-preview-art">
          <div data-avatar-char></div>
          <div data-avatar-pet></div>
        </div>
        <div class="avatar-balance">⭐ <span data-avatar-balance>0</span> stars</div>
      </div>
      <div class="avatar-tabs"></div>
      <div class="avatar-grid" data-avatar-grid></div>
    </div>`;
    const tabs = root.querySelector('.avatar-tabs');
    TABS.forEach(tab => {
      const btn = document.createElement('button');
      btn.className = 'avatar-tab' + (tab.id === 'colors' ? ' active' : '');
      btn.dataset.avatarTab = tab.id;
      btn.textContent = tab.label;
      btn.addEventListener('click', () => {
        mounts[rootId].activeTab = tab.id;
        renderShop(rootId);
      });
      tabs.appendChild(btn);
    });
    renderShop(rootId);
  }

  function guideSeenKey(gameId){
    return 'avatarGuideSeen.' + gameId;
  }
  function readSeen(gameId){
    try { return localStorage.getItem(guideSeenKey(gameId)) === 'true'; } catch(e) { return false; }
  }
  function writeSeen(gameId){
    try { localStorage.setItem(guideSeenKey(gameId), 'true'); } catch(e) {}
  }
  function currentGuideMessage(ctx){
    return ctx.messages[Math.max(0, Math.min(ctx.index, ctx.messages.length - 1))] || '';
  }
  function renderGuide(ctx){
    drawChar(ctx.root.querySelector('[data-guide-char]'), ctx.mood || 'happy', ctx.charSize || 104);
    drawPet(ctx.root.querySelector('[data-guide-pet]'), ctx.mood || 'happy', ctx.petSize || 58);
    ctx.root.querySelector('[data-guide-title]').textContent = ctx.title || 'Your Space Buddy';
    ctx.root.querySelector('[data-guide-message]').textContent = currentGuideMessage(ctx);
    const dots = ctx.root.querySelector('[data-guide-dots]');
    dots.innerHTML = '';
    ctx.messages.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'avatar-guide-dot' + (i === ctx.index ? ' active' : '');
      dots.appendChild(dot);
    });
    const primary = ctx.root.querySelector('[data-guide-primary]');
    primary.textContent = ctx.index < ctx.messages.length - 1 ? 'Next' : (ctx.primaryLabel || 'Got it');
    ctx.root.querySelector('[data-guide-back]').hidden = ctx.index === 0;
  }
  function showGuide(rootId){
    const ctx = guideMounts[rootId]; if (!ctx) return;
    ctx.index = 0;
    renderGuide(ctx);
    ctx.root.hidden = false;
  }
  function hideGuide(rootId){
    const ctx = guideMounts[rootId]; if (!ctx) return;
    ctx.root.hidden = true;
    if (ctx.remember !== false) writeSeen(ctx.gameId);
    if (ctx.onClose) ctx.onClose();
  }
  function mountGuide(options){
    injectStyles();
    const gameId = options.gameId || 'game';
    const rootId = options.rootId || ('avatar-guide-' + gameId);
    let root = resolveEl(rootId);
    if (!root) {
      root = document.createElement('div');
      root.id = rootId;
      document.body.appendChild(root);
    }
    root.className = 'avatar-guide-overlay';
    root.hidden = true;
    root.innerHTML = `<div class="avatar-guide-card" role="dialog" aria-modal="true" aria-labelledby="${rootId}-title">
      <div class="avatar-guide-main">
        <div class="avatar-guide-art">
          <div data-guide-char></div>
          <div data-guide-pet></div>
        </div>
        <div class="avatar-guide-copy">
          <div class="avatar-guide-title" id="${rootId}-title" data-guide-title></div>
          <div class="avatar-guide-bubble" data-guide-message></div>
          <div class="avatar-guide-dots" data-guide-dots></div>
        </div>
      </div>
      <div class="avatar-guide-actions">
        <button class="avatar-guide-btn secondary" data-guide-back type="button">Back</button>
        <button class="avatar-guide-btn secondary" data-guide-close type="button">Skip</button>
        <button class="avatar-guide-btn primary" data-guide-primary type="button">Got it</button>
      </div>
    </div>`;
    const help = document.createElement('button');
    help.className = 'avatar-guide-help';
    help.type = 'button';
    help.setAttribute('aria-label', 'Show game help');
    help.textContent = '?';
    document.body.appendChild(help);

    guideMounts[rootId] = {
      root,
      help,
      gameId,
      title: options.title,
      messages: Array.isArray(options.messages) && options.messages.length ? options.messages : ['Ready for a space mission?'],
      primaryLabel: options.primaryLabel,
      remember: options.remember,
      onClose: options.onClose,
      mood: options.mood,
      charSize: options.charSize,
      petSize: options.petSize,
      index: 0
    };
    const ctx = guideMounts[rootId];
    help.addEventListener('click', () => showGuide(rootId));
    root.querySelector('[data-guide-close]').addEventListener('click', () => hideGuide(rootId));
    root.querySelector('[data-guide-back]').addEventListener('click', () => {
      ctx.index = Math.max(0, ctx.index - 1);
      renderGuide(ctx);
    });
    root.querySelector('[data-guide-primary]').addEventListener('click', () => {
      if (ctx.index < ctx.messages.length - 1) {
        ctx.index++;
        renderGuide(ctx);
      } else {
        hideGuide(rootId);
      }
    });
    renderGuide(ctx);
    if (options.show !== false && !readSeen(gameId)) showGuide(rootId);
  }

  window.ArcadeAvatar = {
    getState: () => getState(true),
    drawChar,
    drawPet,
    mountShop,
    mountGuide,
    showGuide,
    refreshShop: renderShop
  };
})();
