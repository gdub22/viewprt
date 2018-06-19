import { addViewportObserver, removeViewportObserver } from './viewports-manager'

/**
 * @class Observer
 * Each type of observer implements these options/methods
 */
export default function Observer(opts) {
  this.offset = ~~opts.offset || 0
  this.container = opts.container || document.body
  this.once = Boolean(opts.once)
  return this.activate()
}

Observer.prototype = {
  activate() {
    return addViewportObserver(this)
  },
  destroy() {
    removeViewportObserver(this)
  }
}
