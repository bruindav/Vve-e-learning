// fix 2
// Client-side toegangscode-gate. Geen server of database:
// de code zelf staat niet in leesbare tekst, alleen als SHA-256 hash.
// Na een juiste code wordt dit blijvend onthouden op dit apparaat via localStorage.
(function () {
  var STORAGE_KEY = 'vveGateOk_v1';
  var HASH_HEX = '9630e53504b2f88312bfa602490de57950e48ce6d803734bddaf1ec4a335b35d';

  function isUnlocked() {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) { return false; }
  }

  function unlock() {
    document.documentElement.style.visibility = '';
    var overlay = document.getElementById('access-gate-overlay');
    if (overlay) overlay.remove();
  }

  function sha256Hex(text) {
    var enc = new TextEncoder().encode(text);
    return crypto.subtle.digest('SHA-256', enc).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
    });
  }

  function showGate() {
    var style = document.createElement('style');
    style.textContent =
      '#access-gate-overlay{visibility:visible;position:fixed;inset:0;z-index:999999;' +
      'background:#132228;display:flex;align-items:center;justify-content:center;padding:24px;' +
      "font-family:'IBM Plex Sans',sans-serif;}" +
      '#access-gate-overlay .gate-box{background:#ECE4D1;border-radius:4px;max-width:380px;width:100%;' +
      'padding:32px 28px;box-shadow:0 20px 50px -20px #000000a0;text-align:center;}' +
      '#access-gate-overlay .gate-eyebrow{font-family:\'IBM Plex Mono\',monospace;font-size:11px;' +
      "letter-spacing:.14em;text-transform:uppercase;color:#a86f1c;margin-bottom:14px;}" +
      "#access-gate-overlay h1{font-family:'Fraunces',serif;font-size:22px;color:#2A2118;margin:0 0 10px;}" +
      '#access-gate-overlay p{font-size:13.5px;color:#5A5040;line-height:1.5;margin:0 0 20px;}' +
      '#access-gate-overlay input{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #2F4F4433;' +
      "border-radius:3px;font-size:14px;margin-bottom:12px;font-family:'IBM Plex Mono',monospace;}" +
      '#access-gate-overlay button{width:100%;padding:11px 12px;border:none;border-radius:3px;background:#C98A2C;' +
      "color:#0d1a1f;font-weight:600;font-size:14px;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;}" +
      '#access-gate-overlay button:hover{background:#a86f1c;color:#fff;}' +
      '#access-gate-overlay .gate-error{color:#a13d2c;font-size:12.5px;margin-top:10px;min-height:16px;}';
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.id = 'access-gate-overlay';
    overlay.innerHTML =
      '<div class="gate-box">' +
        '<div class="gate-eyebrow">Digidave &middot; E-learning VvE-bestuur</div>' +
        '<h1>Toegangscode</h1>' +
        '<p>Deze e-learning is alleen toegankelijk voor VvE&rsquo;s met een geldige toegangscode.</p>' +
        '<form id="gate-form" autocomplete="off">' +
          '<input type="password" id="gate-input" placeholder="Toegangscode" autocomplete="off">' +
          '<button type="submit">Ontgrendelen</button>' +
        '</form>' +
        '<div class="gate-error" id="gate-error"></div>' +
      '</div>';
    document.body.appendChild(overlay);

    var form = document.getElementById('gate-form');
    var input = document.getElementById('gate-input');
    var errorEl = document.getElementById('gate-error');
    input.focus();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = input.value.trim();
      if (!val) return;
      sha256Hex(val).then(function (hash) {
        if (hash === HASH_HEX) {
          try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
          unlock();
        } else {
          errorEl.textContent = 'Onjuiste code. Probeer het opnieuw.';
          input.value = '';
          input.focus();
        }
      });
    });
  }

  if (isUnlocked()) {
    document.documentElement.style.visibility = '';
  } else {
    showGate();
  }
})();
