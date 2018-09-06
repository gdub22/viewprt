import Viewport from './viewport'

/**
 * @class Observer
 * Base class - each type of observer implements these options/methods
 */
export default function Observer(opts) {
  this.offset = ~~opts.offset || 0
  this.container = opts.container || document.body
  this.once = Boolean(opts.once)
  this.handleScrollResizeEvent =
    typeof opts.handleScrollResizeEvent === 'function' ? opts.handleScrollResizeEvent : handler => handler
  return this.activate()
}

Observer.prototype = {
  activate() {
    const container = this.container
    const handleScrollResizeEvent = this.handleScrollResizeEvent
    const index = getViewportIndexForContainer(container)
    let viewport

    if (index > -1) {
      viewport = viewports[index]
    } else {
      viewport = new Viewport(container, handleScrollResizeEvent)
      viewports.push(viewport)
    }

    const viewportObservers = viewport.observers
    if (viewportObservers.indexOf(this) < 0) viewportObservers.push(this)

    return viewport
  },

  destroy() {
    const viewportIndex = getViewportIndexForContainer(this.container)
    const viewport = viewports[viewportIndex]

    if (viewport) {
      const viewportObservers = viewport.observers
      const observerIndex = viewportObservers.indexOf(this)
      if (observerIndex > -1) viewportObservers.splice(observerIndex, 1)

      if (!viewportObservers.length) {
        viewport.destroy()
        viewports.splice(viewportIndex, 1)
      }
    }
  }
}

// Internally track all viewports so we only have 1 set of event listeners per container
const viewports = []
// Expose private variable for tests
if (process.env.NODE_ENV === 'test') window.__viewports__ = viewports

function getViewportIndexForContainer(container) {
  for (let i = viewports.length; i--; ) {
    if (viewports[i].container === container) return i
  }
}
