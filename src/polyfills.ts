// Polyfills for browser-only globals that some bundled packages reference at
// runtime in the Hermes/JSC environment (DOMRect, DOMPoint, etc.)

const g = global as any;

if (typeof g.DOMRect === 'undefined') {
  g.DOMRect = class DOMRect {
    x: number; y: number; width: number; height: number;
    top: number; right: number; bottom: number; left: number;

    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x; this.y = y; this.width = width; this.height = height;
      this.top = y; this.right = x + width; this.bottom = y + height; this.left = x;
    }
    toJSON() {
      return { x: this.x, y: this.y, width: this.width, height: this.height,
               top: this.top, right: this.right, bottom: this.bottom, left: this.left };
    }
    static fromRect(r: { x?: number; y?: number; width?: number; height?: number }) {
      return new g.DOMRect(r.x ?? 0, r.y ?? 0, r.width ?? 0, r.height ?? 0);
    }
  };
}

if (typeof g.DOMPoint === 'undefined') {
  g.DOMPoint = class DOMPoint {
    x: number; y: number; z: number; w: number;
    constructor(x = 0, y = 0, z = 0, w = 1) {
      this.x = x; this.y = y; this.z = z; this.w = w;
    }
  };
}

if (typeof g.DOMMatrix === 'undefined') {
  g.DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true; isIdentity = true;
  };
}
