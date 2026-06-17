// ⚠️  MUST be pure CommonJS (no `import`).
// ES module `import` statements are hoisted by Babel so they ALWAYS run before
// any inline code, even if they appear after it in source. Using `require()`
// here guarantees these polyfills execute before any library module is loaded.

// ─── Critical DOM polyfills (inline so nothing can run before them) ──────────

if (typeof global.DOMRect === 'undefined') {
  function DOMRect(x, y, width, height) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;
    this.top = this.y;
    this.left = this.x;
    this.right = this.x + this.width;
    this.bottom = this.y + this.height;
  }
  DOMRect.fromRect = function (r) {
    return new DOMRect(r ? r.x : 0, r ? r.y : 0, r ? r.width : 0, r ? r.height : 0);
  };
  DOMRect.prototype.toJSON = function () {
    return { x: this.x, y: this.y, width: this.width, height: this.height,
             top: this.top, right: this.right, bottom: this.bottom, left: this.left };
  };
  global.DOMRect = DOMRect;
  global.DOMRectReadOnly = DOMRect;
}

if (typeof global.DOMPoint === 'undefined') {
  function DOMPoint(x, y, z, w) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.w = w === undefined ? 1 : w;
  }
  DOMPoint.fromPoint = function (p) {
    return new DOMPoint(p ? p.x : 0, p ? p.y : 0, p ? p.z : 0, p ? p.w : 1);
  };
  global.DOMPoint = DOMPoint;
  global.DOMPointReadOnly = DOMPoint;
}

if (typeof global.DOMMatrix === 'undefined') {
  function DOMMatrix(init) {
    this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
    this.m11 = 1; this.m12 = 0; this.m13 = 0; this.m14 = 0;
    this.m21 = 0; this.m22 = 1; this.m23 = 0; this.m24 = 0;
    this.m31 = 0; this.m32 = 0; this.m33 = 1; this.m34 = 0;
    this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 1;
    this.is2D = true;
    this.isIdentity = true;
  }
  DOMMatrix.fromMatrix = function (m) { return new DOMMatrix(); };
  DOMMatrix.fromFloat32Array = function (a) { return new DOMMatrix(); };
  DOMMatrix.fromFloat64Array = function (a) { return new DOMMatrix(); };
  DOMMatrix.prototype.translate = function () { return new DOMMatrix(); };
  DOMMatrix.prototype.scale = function () { return new DOMMatrix(); };
  DOMMatrix.prototype.rotate = function () { return new DOMMatrix(); };
  DOMMatrix.prototype.multiply = function () { return new DOMMatrix(); };
  DOMMatrix.prototype.inverse = function () { return new DOMMatrix(); };
  DOMMatrix.prototype.toFloat32Array = function () { return new Float32Array(16); };
  DOMMatrix.prototype.toFloat64Array = function () { return new Float64Array(16); };
  global.DOMMatrix = DOMMatrix;
  global.DOMMatrixReadOnly = DOMMatrix;
}

// ─── Observer stubs (react-native-reanimated / gesture-handler web paths) ────

if (typeof global.MutationObserver === 'undefined') {
  global.MutationObserver = function MutationObserver(cb) {
    this.observe = function () {};
    this.disconnect = function () {};
    this.takeRecords = function () { return []; };
  };
}

if (typeof global.ResizeObserver === 'undefined') {
  global.ResizeObserver = function ResizeObserver(cb) {
    this.observe = function () {};
    this.unobserve = function () {};
    this.disconnect = function () {};
  };
}

if (typeof global.IntersectionObserver === 'undefined') {
  global.IntersectionObserver = function IntersectionObserver(cb) {
    this.observe = function () {};
    this.unobserve = function () {};
    this.disconnect = function () {};
  };
}

// ─── Event stubs ─────────────────────────────────────────────────────────────

if (typeof global.CustomEvent === 'undefined') {
  function CustomEvent(type, params) {
    this.type = type || '';
    this.detail = (params && params.detail) || null;
    this.bubbles = (params && params.bubbles) || false;
    this.cancelable = (params && params.cancelable) || false;
  }
  CustomEvent.prototype = Object.create(global.Event ? global.Event.prototype : {});
  global.CustomEvent = CustomEvent;
}

// ─── window/document stubs (gesture-handler, maps web layers) ────────────────

if (typeof global.window === 'undefined') {
  global.window = global;
}

// Ensure window properties that web-flavored libs check for
if (global.window && typeof global.window.matchMedia === 'undefined') {
  global.window.matchMedia = function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () { return true; },
    };
  };
}

if (typeof global.document === 'undefined') {
  global.document = {
    createElement: function (tag) {
      return {
        tagName: (tag || '').toUpperCase(),
        style: {},
        setAttribute: function () {},
        getAttribute: function () { return null; },
        addEventListener: function () {},
        removeEventListener: function () {},
        getBoundingClientRect: function () {
          return new global.DOMRect(0, 0, 0, 0);
        },
        children: [],
        childNodes: [],
        appendChild: function () {},
        removeChild: function () {},
        querySelectorAll: function () { return []; },
        querySelector: function () { return null; },
      };
    },
    createElementNS: function (ns, tag) { return global.document.createElement(tag); },
    createTextNode: function (t) { return { nodeType: 3, textContent: t }; },
    getElementById: function () { return null; },
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    addEventListener: function () {},
    removeEventListener: function () {},
    body: {
      style: {},
      appendChild: function () {},
      removeChild: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
    },
    head: {
      appendChild: function () {},
      removeChild: function () {},
    },
    documentElement: {
      style: {},
      clientWidth: 0,
      clientHeight: 0,
      getBoundingClientRect: function () { return new global.DOMRect(0, 0, 0, 0); },
    },
  };
}

// ─── Navigator stub (some map/geo libs check navigator.geolocation) ───────────

if (typeof global.navigator === 'undefined') {
  global.navigator = {
    userAgent: 'ReactNative',
    platform: 'ReactNative',
    geolocation: undefined,
    language: 'he-IL',
  };
} else if (typeof global.navigator.userAgent === 'undefined') {
  global.navigator.userAgent = 'ReactNative';
}

// ─── Now load the rest of the app ─────────────────────────────────────────────

var registerRootComponent = require('expo').registerRootComponent;
var App = require('./App').default;

registerRootComponent(App);
