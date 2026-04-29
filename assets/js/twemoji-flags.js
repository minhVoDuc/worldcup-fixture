/* ============================================================
   WC 2026 — Twemoji Flag-Only Parser  v1.0
   Targets ONLY .flag-emoji elements.
   Non-flag emoji (⚽ 🏆 ⭐ etc.) are left as-is.
   ============================================================ */

(function () {
  if (typeof twemoji === 'undefined') return;

  /* Regional indicator range: U+1F1E6 – U+1F1FF
     A country flag = exactly 2 regional indicators joined */
  function isFlag(iconCodepoint) {
    const parts = iconCodepoint.split('-');
    if (parts.length !== 2) return false;
    return parts.every(p => {
      const n = parseInt(p, 16);
      return n >= 0x1F1E6 && n <= 0x1F1FF;
    });
  }

  function parseEl(el) {
    if (!el) return;
    twemoji.parse(el, {
      folder: 'svg',
      ext: '.svg',
      callback: function (icon, options) {
        if (!isFlag(icon)) return false; // ← skip non-flag emoji
        return ''.concat(options.base, options.size, '/', icon, options.ext);
      }
    });
  }

  function parseAllFlags() {
    document.querySelectorAll('.flag-emoji').forEach(parseEl);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', parseAllFlags);
  } else {
    parseAllFlags();
  }

  // Watch for dynamically injected views
  const observer = new MutationObserver(mutations => {
    let needsParse = false;
    for (const mut of mutations) {
      for (const node of mut.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.classList?.contains('flag-emoji') ||
            node.querySelector?.('.flag-emoji')) {
          needsParse = true; break;
        }
      }
      if (needsParse) break;
    }
    if (needsParse) parseAllFlags();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.WC_PARSE_FLAGS = parseAllFlags; // manual re-parse if needed
})();