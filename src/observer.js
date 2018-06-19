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
    const index = getViewportIndexForContainer(container)
    let viewport

    if (index > -1) {
      viewport = viewports[index]
    } else {
      viewport = new Viewport(container)
      viewports.push(viewport)
    }

    viewport.addObserver(this)
    return viewport
  },

  destroy() {
    const index = getViewportIndexForContainer(this.container)
    const viewport = viewports[index]

    if (viewport) {
      viewport.removeObserver(this)
      if (!viewport.observers.length) {
        viewport.destroy()
        viewports.splice(index, 1)
      }
    }
  }
}

// Internally track all viewports so we only have 1 set of event listeners per container
const viewports = []
function getViewportIndexForContainer(container) {
  for (let i = viewports.length; i--; ) {
    if (viewports[i].container === container) {
      return i
    }
  }
}
