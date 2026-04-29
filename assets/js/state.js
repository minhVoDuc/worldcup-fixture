/* ============================================================
   WC 2026 — State Manager
   A simple reactive store (no framework needed)
   ============================================================ */

const State = (() => {
  const _store = {
    phase: 'pre',        // 'pre' | 'live' | 'post'
    currentRoute: 'home',
    config: null,
    rawMatches: [],      // raw from data source
    matches: [],         // normalized
    groupStandings: {},  // { 'Group A': [...rows] }
    lastUpdated: null,
    loading: true,
    error: null,
    filters: {
      schedule: { group: 'all', round: 'all', date: 'all' },
      results:  { group: 'all', round: 'all' },
      standings:{ group: 'all' },
    },
  };

  const _listeners = {};

  function get(key) {
    return key ? _store[key] : { ..._store };
  }

  function set(patch) {
    const changed = [];
    for (const [k, v] of Object.entries(patch)) {
      if (_store[k] !== v) {
        _store[k] = v;
        changed.push(k);
      }
    }
    changed.forEach(k => emit(k, _store[k]));
    if (changed.length) emit('*', { ..._store });
  }

  function on(event, cb) {
    if (!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(cb);
    return () => off(event, cb);
  }

  function off(event, cb) {
    if (_listeners[event]) {
      _listeners[event] = _listeners[event].filter(fn => fn !== cb);
    }
  }

  function emit(event, data) {
    (_listeners[event] || []).forEach(cb => cb(data));
  }

  return { get, set, on, off, emit };
})();

export default State;
