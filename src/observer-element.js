import { Observer, ObserverInterface } from './observer-interface'

function isElementInViewport(element, offset, viewportState) {
  const rect = element.getBoundingClientRect()
  return (
    !!(rect.width && rect.height) &&
    rect.top < viewportState.height + offset &&
    rect.bottom > 0 - offset &&
    rect.left < viewportState.width + offset &&
    rect.right > 0 - offset
  )
}

function isElementInDOM(element) {
  return element && element.parentNode
}

const ElementObserver = ObserverInterface(function ElementObserver(element, opts = {}) {
  if (!(this instanceof ElementObserver)) {
    return new ElementObserver(...arguments)
  }

  this.element = element
  this.onEnter = opts.onEnter
  this.onExit = opts.onExit
  this._didEnter = false
  const viewport = Observer.call(this, opts)

  if (isElementInDOM(element)) {
    this.check(viewport.getState())
  }
})

ElementObserver.prototype.check = function(viewportState) {
  const { onEnter, onExit, element, offset, once, _didEnter } = this
  if (!isElementInDOM(element)) {
    return this.destroy()
  }

  const inViewport = isElementInViewport(element, offset, viewportState)
  if (!_didEnter && inViewport) {
    this._didEnter = true
    if (onEnter) {
      onEnter.call(this, element, viewportState)
      once && this.destroy()
    }
  } else if (_didEnter && !inViewport) {
    this._didEnter = false
    if (onExit) {
      onExit.call(this, element, viewportState)
      once && this.destroy()
    }
  }
}

export default ElementObserver
