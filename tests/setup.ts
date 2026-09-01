import "@testing-library/jest-dom/vitest"

// Radix UI primitives schedule async focus/dismiss work that React must flush under
// act(). Without this flag, testing-library's fireEvent/userEvent do not await that
// work and component tests that interact with Radix-backed fields hang indefinitely.
;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

// jsdom defines some of these as throwing no-ops and omits others; Radix UI calls
// them during focus/pointer handling. Stub unconditionally so tests never hit the
// jsdom "not implemented" path or a missing global.
window.scrollTo = () => {}
Element.prototype.scrollIntoView = () => {}
Element.prototype.hasPointerCapture = () => false
Element.prototype.setPointerCapture = () => {}
Element.prototype.releasePointerCapture = () => {}
window.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
  root = null
  rootMargin = ""
  thresholds = []
} as unknown as typeof IntersectionObserver
DOMRect.fromRect = (rect?: DOMRectInit) =>
  new DOMRect(rect?.x, rect?.y, rect?.width, rect?.height)
