import { Observer, ObserverInterface } from './observer-interface'

const PositionObserver = ObserverInterface(function PositionObserver(opts = {}) {
  if (!(this instanceof PositionObserver)) {
    return new PositionObserver(...arguments)
  }

  this.onTop = opts.onTop
  this.onBottom = opts.onBottom
  this.onMaximized = opts.onMaximized
  this._wasTop = true
  this._wasBottom = false

  const viewport = Observer.call(this, opts)
  this.check(viewport.getState())
})

PositionObserver.prototype.check = function(viewportState) {
  const { onBottom, onTop, onMaximized, _wasTop, _wasBottom, container, offset, once } = this
  const { scrollHeight } = container
  const { height, y } = viewportState
  const atTop = y - offset <= 0
  const atBottom = scrollHeight > height && height + y + offset >= scrollHeight
  let untriggered = false

  if (onBottom && !_wasBottom && atBottom) {
    onBottom.call(this, container, viewportState)
  } else if (onTop && !_wasTop && atTop) {
    onTop.call(this, container, viewportState)
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
}

export default PositionObserver
