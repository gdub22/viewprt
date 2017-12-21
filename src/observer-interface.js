import { addViewportObserver, removeViewportObserver } from './viewports-manager'

/**
 * @interface Observer
 * Each type of observer implements these options/methods
 */
export function Observer(opts) {
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

export function ObserverInterface(Subclass) {
  Subclass.prototype = Object.create(Observer.prototype)
  Subclass.prototype.constructor = Subclass
  return Subclass
}
