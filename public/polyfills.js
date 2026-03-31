/**
 * Polyfills for legacy browsers (iOS 11+, Safari 11+, iPod Touch)
 * Loaded via <script> before any Next.js code runs.
 * 
 * Covers APIs that Supabase and modern React code depend on:
 * globalThis, crypto.randomUUID, Object.hasOwn, Array.at,
 * String.replaceAll, Promise.allSettled, queueMicrotask,
 * structuredClone, AbortController
 */
(function () {
  'use strict';

  // ── globalThis (required by Supabase JS SDK) ──
  if (typeof globalThis === 'undefined') {
    if (typeof self !== 'undefined') { self.globalThis = self; }
    else if (typeof window !== 'undefined') { window.globalThis = window; }
  }

  // ── crypto.randomUUID (required by Supabase Auth) ──
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID !== 'function') {
    crypto.randomUUID = function () {
      if (typeof crypto.getRandomValues === 'function') {
        var buf = new Uint8Array(16);
        crypto.getRandomValues(buf);
        buf[6] = (buf[6] & 0x0f) | 0x40;
        buf[8] = (buf[8] & 0x3f) | 0x80;
        var hex = [];
        for (var i = 0; i < 16; i++) {
          hex.push(('0' + buf[i].toString(16)).slice(-2));
        }
        return (
          hex.slice(0, 4).join('') + '-' +
          hex.slice(4, 6).join('') + '-' +
          hex.slice(6, 8).join('') + '-' +
          hex.slice(8, 10).join('') + '-' +
          hex.slice(10, 16).join('')
        );
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
    };
  }

  // ── Object.hasOwn ──
  if (typeof Object.hasOwn !== 'function') {
    Object.defineProperty(Object, 'hasOwn', {
      value: function (obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
      },
      configurable: true,
      writable: true
    });
  }

  // ── Array.prototype.at ──
  if (!Array.prototype.at) {
    Object.defineProperty(Array.prototype, 'at', {
      value: function (index) {
        var n = index >= 0 ? index : this.length + index;
        return n >= 0 && n < this.length ? this[n] : undefined;
      },
      configurable: true,
      writable: true
    });
  }

  // ── String.prototype.at ──
  if (!String.prototype.at) {
    Object.defineProperty(String.prototype, 'at', {
      value: function (index) {
        var n = index >= 0 ? index : this.length + index;
        return n >= 0 && n < this.length ? this.charAt(n) : undefined;
      },
      configurable: true,
      writable: true
    });
  }

  // ── String.prototype.replaceAll ──
  if (!String.prototype.replaceAll) {
    Object.defineProperty(String.prototype, 'replaceAll', {
      value: function (search, replacement) {
        if (search instanceof RegExp) {
          if (!search.global) {
            throw new TypeError('replaceAll called with a non-global RegExp');
          }
          return this.replace(search, replacement);
        }
        return this.split(search).join(replacement);
      },
      configurable: true,
      writable: true
    });
  }

  // ── Promise.allSettled ──
  if (typeof Promise.allSettled !== 'function') {
    Promise.allSettled = function (promises) {
      return Promise.all(
        Array.from(promises).map(function (p) {
          return Promise.resolve(p).then(
            function (v) { return { status: 'fulfilled', value: v }; },
            function (r) { return { status: 'rejected', reason: r }; }
          );
        })
      );
    };
  }

  // ── queueMicrotask ──
  if (typeof queueMicrotask !== 'function') {
    window.queueMicrotask = function (cb) {
      Promise.resolve().then(cb);
    };
  }

  // ── structuredClone (basic JSON-based fallback) ──
  if (typeof structuredClone !== 'function') {
    window.structuredClone = function (value) {
      return JSON.parse(JSON.stringify(value));
    };
  }

  // ── AbortController (minimal polyfill) ──
  if (typeof AbortController === 'undefined') {
    window.AbortController = function () {
      this.signal = {
        aborted: false,
        addEventListener: function () {},
        removeEventListener: function () {}
      };
      var ctrl = this;
      this.abort = function () { ctrl.signal.aborted = true; };
    };
  }

  // ── Object.fromEntries ──
  if (typeof Object.fromEntries !== 'function') {
    Object.fromEntries = function (iterable) {
      var obj = {};
      var entries = Array.from(iterable);
      for (var i = 0; i < entries.length; i++) {
        obj[entries[i][0]] = entries[i][1];
      }
      return obj;
    };
  }

  // Mark polyfills loaded
  window.__POLYFILLS_LOADED = true;
})();
