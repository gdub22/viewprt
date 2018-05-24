import { Observer, ObserverInterface } from './observer-interface'

const PositionObserver = ObserverInterface(function PositionObserver(opts = {}) {
  if (!(this instanceof PositionObserver)) {
    return new PositionObserver(...arguments)
  }

  this.on = {
    top: opts.onTop,
    bottom: opts.onBottom,
    left: opts.onLeft,
    right: opts.onRight,
    maximized: opts.onMaximized
  }

  this._was = {
    top: true,
    bottom: false,
    left: true,
    right: false
  }

  const viewport = Observer.call(this, opts)
  this.check(viewport.getState())
})

PositionObserver.prototype.check = function(viewportState) {
  const { on, _was, container, offset, once } = this
  const { scrollHeight } = container
  const { dimension, position } = viewportState

  const at = {
    top: position.y - offset <= 0,
    bottom: scrollHeight > dimension.height && dimension.height + position.y + offset >= scrollHeight
  }

  let untriggered = false

  if (on.bottom && !_was.bottom && at.bottom) {
    on.bottom.call(this, container, viewportState)
  } else if (on.top && !_was.top && at.top) {
    on.top.call(this, container, viewportState)
  } else if (on.maximized && scrollHeight === dimension.height) {
    on.maximized.call(this, container, viewportState)
  } else {
    untriggered = true
  }

  if (once && !untriggered) {
    this.destroy()
  }

  this._was = at
}

export default PositionObserver
