import Viewport from './viewport'

function ObserverCollection(opts) {
  this.viewports = new Map()
  this.handleScrollResize = opts.handleScrollResize || (h => h)
}

/**
 * @class Observer
 * Base class - each type of observer implements these options/methods
 */
export default function Observer(opts) {
  this.offset = ~~opts.offset || 0
  this.container = opts.container || document.body
  this.once = Boolean(opts.once)
  this.observerCollection =
    opts.observerCollection instanceof ObserverCollection ? opts.observerCollection : observerCollection
  return this.activate()
}

Observer.prototype = {
  activate() {
    const container = this.container
    let viewport = this.observerCollection.viewports.get(container)

    if (!viewport) {
      viewport = new Viewport(container)
      viewport.setup(this.observerCollection.handleScrollResize)
      this.observerCollection.viewports.set(container, viewport)
    }

    const viewportObservers = viewport.observers
    if (viewportObservers.indexOf(this) < 0) viewportObservers.push(this)

    return viewport
  },

  destroy() {
    const container = this.container
    const viewport = this.observerCollection.viewports.get(container)

    if (viewport) {
      const viewportObservers = viewport.observers
      const observerIndex = viewportObservers.indexOf(this)
      if (observerIndex > -1) viewportObservers.splice(observerIndex, 1)
      if (!viewportObservers.length) {
        viewport.destroy()
        this.observerCollection.viewports.delete(container)
      }
    }
  }
}

export { ObserverCollection }

// Internally track all viewports so we only have 1 set of event listeners per container
const observerCollection = new ObserverCollection({ handleScrollResize: h => h })

// Expose private variable for tests
if (process.env.NODE_ENV === 'test') window.__viewports__ = observerCollection.viewports
