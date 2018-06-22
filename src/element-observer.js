import Observer from './observer'

export default function ElementObserver(element, opts = {}) {
  if (!(this instanceof ElementObserver)) return new ElementObserver(...arguments)

  this.element = element
  this.onEnter = opts.onEnter
  this.onExit = opts.onExit
  this._didEnter = false

  const viewport = Observer.call(this, opts)
  if (isElementInDOM(element)) this.check(viewport.getState())
}

ElementObserver.prototype = Object.create(Observer.prototype)
ElementObserver.prototype.constructor = ElementObserver

ElementObserver.prototype.check = function(viewportState) {
  const { onEnter, onExit, element, offset, once, _didEnter } = this
  if (!isElementInDOM(element)) return this.destroy()

  const inViewport = isElementInViewport(element, offset, viewportState)
  if (!_didEnter && inViewport) {
    this._didEnter = true
    if (onEnter) {
      onEnter.call(this, element, viewportState)
      if (once) this.destroy()
    }
  } else if (_didEnter && !inViewport) {
    this._didEnter = false
    if (onExit) {
      onExit.call(this, element, viewportState)
      if (once) this.destroy()
    }
  }
}

function isElementInViewport(element, offset, viewportState) {
  const elRect = element.getBoundingClientRect()

  if (!elRect.width || !elRect.height) return false

  let topBound, bottomBound, leftBound, rightBound
  const viewportElement = viewportState.viewportElement
  if (viewportElement === window) {
    topBound = viewportState.height
    bottomBound = 0
    leftBound = viewportState.width
    rightBound = 0
  } else {
    const scrollElRect = viewportElement.getBoundingClientRect()
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
