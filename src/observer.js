import { Viewport } from './viewport'

/**
 * @class Observer
 * Base class - each type of observer implements these options/methods
 */
export function Observer(opts) {
  this.offset = ~~opts.offset || 0
  this.container = opts.container || document.body
  this.once = Boolean(opts.once)
  this.observerCollection = opts.observerCollection || defaultObserverCollection
  return this.activate()
}

Observer.prototype = {
  activate() {
    const { container, observerCollection } = this
    const viewports = observerCollection.viewports
    let viewport = viewports.get(container)

    if (!viewport) {
      viewport = new Viewport(container, observerCollection)
      viewports.set(container, viewport)
    }

    const viewportObservers = viewport.observers
    if (viewportObservers.indexOf(this) < 0) viewportObservers.push(this)

    return viewport
  },

  destroy() {
    const { container, observerCollection } = this
    const viewports = observerCollection.viewports
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

/**
 * @class ObserverCollection
 * For grouping observers with a custom scroll/resize handler
 */
export function ObserverCollection(opts = {}) {
  if (!(this instanceof ObserverCollection)) return new ObserverCollection(opts)
  this.viewports = new Map()
  this.handleScrollResize = opts.handleScrollResize
}

// Internally track all viewports so we only have 1 set of event listeners per container
const defaultObserverCollection = new ObserverCollection()

// Expose private variable for tests
if (process.env.NODE_ENV === 'test') window.__viewports__ = defaultObserverCollection.viewports
