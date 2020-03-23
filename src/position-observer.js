import { Observer } from './observer'

export function PositionObserver(opts = {}) {
  if (!(this instanceof PositionObserver)) return new PositionObserver(opts)

  this.onTop = opts.onTop
  this.onBottom = opts.onBottom
  this.onLeft = opts.onLeft
  this.onRight = opts.onRight
  this.onFit = opts.onFit

  this._wasTop = true
  this._wasBottom = false
  this._wasLeft = true
  this._wasRight = false
  this._wasFit = false

  const viewport = Observer.call(this, opts)
  this.check(viewport.getState())
}

PositionObserver.prototype = Object.create(Observer.prototype)
PositionObserver.prototype.constructor = PositionObserver

PositionObserver.prototype.check = function (viewportState) {
  const {
    onTop,
    onBottom,
    onLeft,
    onRight,
    onFit,
    _wasTop,
    _wasBottom,
    _wasLeft,
    _wasRight,
    _wasFit,
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
  const fits = scrollHeight <= height && scrollWidth <= width

  let untriggered = false

  if (onBottom && !_wasBottom && atBottom) onBottom.call(this, container, viewportState)
  else if (onTop && !_wasTop && atTop) onTop.call(this, container, viewportState)
  else if (onRight && !_wasRight && atRight) onRight.call(this, container, viewportState)
  else if (onLeft && !_wasLeft && atLeft) onLeft.call(this, container, viewportState)
  else if (onFit && !_wasFit && fits) onFit.call(this, container, viewportState)
  else untriggered = true

  if (once && !untriggered) this.destroy()

  this._wasTop = atTop
  this._wasBottom = atBottom
  this._wasLeft = atLeft
  this._wasRight = atRight
  this._wasFit = fits
}
