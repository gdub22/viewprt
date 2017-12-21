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
    this.destroy()
  } else if (onEnter && !_didEnter && isElementInViewport(element, offset, viewportState)) {
    this._didEnter = true
    onEnter.call(this, element, viewportState)
    once && this.destroy()
  } else if (onExit && _didEnter && !isElementInViewport(element, offset, viewportState)) {
    this._didEnter = false
    onExit.call(this, element, viewportState)
    once && this.destroy()
  }
}

export default ElementObserver
