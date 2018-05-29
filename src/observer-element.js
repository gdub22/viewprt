import { Observer, ObserverInterface } from './observer-interface'

function isElementInViewport(element, scrollEl, offset, viewportState) {
  const elRect = element.getBoundingClientRect()

  if (!elRect.width || !elRect.height) return false

  let topBound, bottomBound, leftBound, rightBound
  if (scrollEl === window) {
    topBound = viewportState.height
    bottomBound = 0
    leftBound = viewportState.width
    rightBound = 0
  } else {
    const scrollElRect = scrollEl.getBoundingClientRect()
    topBound = scrollElRect.bottom
    bottomBound = scrollElRect.top
    leftBound = scrollElRect.right
    rightBound = scrollElRect.left
  }

  return (
    elRect.top < topBound + offset &&
    elRect.bottom > bottomBound - offset &&
    elRect.left < leftBound + offset &&
    elRect.right > rightBound - offset
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
    this.check(viewport.getState(), viewport.scrollEl)
  }
})

ElementObserver.prototype.check = function(viewportState, scrollEl) {
  const { onEnter, onExit, element, offset, once, _didEnter } = this
  if (!isElementInDOM(element)) {
    return this.destroy()
  }

  const inViewport = isElementInViewport(element, scrollEl, offset, viewportState)
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
