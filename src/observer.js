import Viewport from './viewport'

/**
 * @class Observer
 * Base class - each type of observer implements these options/methods
 */
export default function Observer(opts) {
  this.offset = ~~opts.offset || 0
  this.container = opts.container || document.body
  this.once = Boolean(opts.once)
  return this.activate()
}

Observer.prototype = {
  activate() {
    const container = this.container
    let viewport = viewports.get(container)

    if (!viewport) {
      viewport = new Viewport(container)
      viewports.set(container, viewport)
    }

    const viewportObservers = viewport.observers
    if (viewportObservers.indexOf(this) < 0) viewportObservers.push(this)

    return viewport
  },

  destroy() {
    const container = this.container
    const viewport = viewports.get(container)

    if (viewport) {
      const viewportObservers = viewport.observers
      const observerIndex = viewportObservers.indexOf(this)
      if (observerIndex > -1) viewportObservers.splice(observerIndex, 1)
      if (!viewportObservers.length) {
        viewport.destroy()
        viewports.delete(container)
      }
    }
  }
}

// Internally track all viewports so we only have 1 set of event listeners per container
const viewports = new Map()
// Expose private variable for tests
if (process.env.NODE_ENV === 'test') window.__viewports__ = viewports
