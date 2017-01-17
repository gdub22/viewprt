const assert = require('assert')
const rewire = require('rewire')

const viewprt = rewire('../dist/viewprt.test.js')
const { PositionObserver, ElementObserver } = viewprt
const getViewports = viewprt.__get__('getViewports')
const resetViewports = viewprt.__get__('resetViewports')

describe('viewprt', () => {
  afterEach(() => {
    resetViewports()
  })

  describe('Observers', () => {
    it('resolves the offest option', () => {
      let observer = new PositionObserver()
      assert.equal(observer.offset, 0)

      observer = new PositionObserver({ offset: 100 })
      assert.equal(observer.offset, 100)

      observer = new PositionObserver({ offset: -100 })
      assert.equal(observer.offset, -100)

      observer = new PositionObserver({ offset: '100' })
      assert.equal(observer.offset, 100)

      observer = new PositionObserver({ offset: null })
      assert.equal(observer.offset, 0)

      observer = new PositionObserver({ offset: 'abc' })
      assert.equal(observer.offset, 0)
    })

    it('resolves the container option', () => {
      let observer = new PositionObserver()
      assert.equal(observer.container, document.body)
      let container = document.createElement('div')

      observer = new PositionObserver({ container })
      assert.equal(observer.container, container)
    })

    it('resolves the once option', () => {
      let observer = new PositionObserver()
      assert.equal(observer.once, false)

      observer = new PositionObserver({ once: true })
      assert.equal(observer.once, true)

      observer = new PositionObserver({ once: 0 })
      assert.equal(observer.once, false)

      observer = new PositionObserver({ once: null })
      assert.equal(observer.once, false)
    })
  })

  describe('PositionObserver', () => {
    it('can create instances', () => {
      let observer = new PositionObserver()
      assert.ok(observer instanceof PositionObserver)
    })

    it('auto activates', () => {
      let observer = new PositionObserver()
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)
      assert.equal(getViewports()[0].observers[0], observer)

      observer = new PositionObserver()
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 2)
      assert.equal(getViewports()[0].observers[1], observer)

      observer = new PositionObserver({ container: document.createElement('div') })
      assert.equal(getViewports().length, 2)
      assert.equal(getViewports()[1].observers.length, 1)
      assert.equal(getViewports()[1].observers[0], observer)
    })

    it('can (re)activate', () => {
      let observer = new PositionObserver()
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)

      observer.activate() // doesn't do anything. already activated
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)

      observer.destroy()
      assert.equal(getViewports().length, 0)
      observer.activate() // re-activated
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)
    })

    it('can destroy', () => {
      let observer = new PositionObserver()
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)
      observer.destroy()
      assert.equal(getViewports().length, 0)

      observer.destroy() // destroying again doesn't throw
      assert.equal(getViewports().length, 0)
      assert.ok(observer) // still an instance, just not processed
    })
  })

  describe('ElementObserver', () => {
    it('can create instances', () => {
      let observer = new ElementObserver()
      assert.ok(observer instanceof ElementObserver)
    })

    it('auto activates (if element exists and in DOM)', () => {
      let observer = new ElementObserver()
      assert.equal(getViewports().length, 0)

      let div = document.createElement('div')
      observer = new ElementObserver(div)
      assert.equal(getViewports().length, 0)

      document.body.appendChild(div)
      observer = new ElementObserver(div)
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)
      assert.equal(getViewports()[0].observers[0], observer)
    })

    it('can (re)activate', () => {
      let div = document.createElement('div')
      let observer = new ElementObserver(div)
      assert.equal(getViewports().length, 0)

      document.body.appendChild(div)
      observer.activate()
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)
      assert.equal(getViewports()[0].observers[0], observer)
    })

    it('auto destroys if no longer DOM', () => {
      let div = document.createElement('div')
      document.body.appendChild(div)
      let observer = new ElementObserver(div)

      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)
      assert.equal(getViewports()[0].observers[0], observer)

      document.body.removeChild(div)
      getViewports()[0].checkObservers()
      assert.equal(getViewports().length, 0)
    })

    it('can destroy', () => {
      let div = document.createElement('div')
      document.body.appendChild(div)
      let observer = new ElementObserver(div)
      assert.equal(getViewports().length, 1)
      assert.equal(getViewports()[0].observers.length, 1)

      observer.destroy()
      assert.equal(getViewports().length, 0)
      observer.destroy() // destroying again doesn't throw
      assert.equal(getViewports().length, 0)
      assert.ok(observer) // still an instance, just not processed
    })
  })
})
