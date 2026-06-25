// Polyfill missing DOM classes for pdfjs-dist / pdf-parse in Node.js serverless environments (like Vercel)
if (typeof globalThis !== "undefined") {
  (globalThis as any).DOMMatrix = (globalThis as any).DOMMatrix || class DOMMatrix {
    constructor() {}
  };
  (globalThis as any).ImageData = (globalThis as any).ImageData || class ImageData {
    constructor() {}
  };
  (globalThis as any).Path2D = (globalThis as any).Path2D || class Path2D {
    constructor() {}
  };
}
