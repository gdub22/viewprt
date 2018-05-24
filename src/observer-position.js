import { Observer, ObserverInterface } from './observer-interface'

const PositionObserver = ObserverInterface(function PositionObserver(opts = {}) {
  if (!(this instanceof PositionObserver)) {
    return new PositionObserver(...arguments)
  }

  this.onTop = opts.onTop
  this.onBottom = opts.onBottom
  this.onLeft = opts.onLeft
  this.onRight = opts.onRight
  this.onMaximized = opts.onMaximized

  this._wasTop = true
  this._wasBottom = false
  this._wasLeft = true
  this._wasRight = false

  const viewport = Observer.call(this, opts)
  this.check(viewport.getState())
})

PositionObserver.prototype.check = function(viewportState) {
  const {
    onTop,
    onBottom,
    onLeft,
    onRight,
    onMaximized,
    _wasTop,
    _wasBottom,
    _wasLeft,
    _wasRight,
    container,
    offset,
    once
  } = this
  const { scrollHeight, scrollWidth } = container
  const { width, height, positionX, positionY } = viewportState

  const atTop = positionY - offset <= 0
  const atBottom = scrollHeight > height && height + positionY + offset >= scrollHeight
  const atLeft = positionX - offset <= 0
  const atRight = scrollWidth > width && width + positionX + offset >= scrollWidth

  let untriggered = false

  if (onBottom && !_wasBottom && atBottom) {
    onBottom.call(this, container, viewportState)
  } else if (onTop && !_wasTop && atTop) {
    onTop.call(this, container, viewportState)
  } else if (onRight && !_wasRight && atRight) {
    onRight.call(this, container, viewportState)
  } else if (onLeft && !_wasLeft && atLeft) {
    onLeft.call(this, container, viewportState)
  } else if (onMaximized && scrollHeight === height) {
    onMaximized.call(this, container, viewportState)
  } else {
    untriggered = true
  }

  if (once && !untriggered) {
    this.destroy()
  }

  this._wasTop = atTop
  this._wasBottom = atBottom
  this._wasLeft = atLeft
  this._wasRight = atRight
}

export default PositionObserver
