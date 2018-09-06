/* global PositionObserver, ElementObserver, __viewports__ */

const path = require('path')
const assert = require('assert').strict
const puppeteer = require('puppeteer')

describe('viewprt', () => {
  let browser, page
  const pageWidth = 1024
  const pageHeight = 768
  async function createPage() {
    const pageUrl = `file:${path.join(__dirname, 'index.html')}`
    page = await browser.newPage()
    await page.setViewport({ width: pageWidth, height: pageHeight })
    await page.goto(pageUrl)
  }
  async function closePage() {
    await page.close()
  }

  before(async () => {
    browser = await puppeteer.launch()
  })

  beforeEach(async () => {
    await createPage()
  })

  afterEach(async () => {
    await closePage()
  })

  after(async () => {
    await browser.close()
  })

  it('loads the umd library and exposes public functions', async () => {
    const viewprt = await page.evaluate(() => window.viewprt)
    assert(viewprt)
    assert(viewprt.PositionObserver)
    assert(viewprt.ElementObserver)
  })

  it('can create instances', async () => {
    assert(await page.evaluate(() => new PositionObserver() instanceof PositionObserver))
    assert(await page.evaluate(() => PositionObserver() instanceof PositionObserver))
    assert(await page.evaluate(() => new ElementObserver() instanceof ElementObserver))
    assert(await page.evaluate(() => ElementObserver() instanceof ElementObserver))
  })

  describe('options', () => {
    it('offset option', async () => {
      async function testOption(input, expected) {
        const posObserver = await page.evaluate(offset => PositionObserver({ offset }), input)
        assert.equal(posObserver.offset, expected)
        const elObserver = await page.evaluate(offset => ElementObserver(null, { offset }), input)
        assert.equal(elObserver.offset, expected)
      }

      await testOption(undefined, 0)
      await testOption(null, 0)
      await testOption(100, 100)
      await testOption(-100, -100)
      await testOption('100', 100)
      await testOption('abc', 0)
    })

    it('once option', async () => {
      async function testOption(input, expected) {
        const posObserver = await page.evaluate(once => PositionObserver({ once }), input)
        assert.equal(posObserver.once, expected)
        const elObserver = await page.evaluate(once => ElementObserver(null, { once }), input)
        assert.equal(elObserver.once, expected)
      }

      await testOption(true, true)
      await testOption(false, false)
      await testOption(0, false)
      await testOption(1, true)
      await testOption(undefined, false)
      await testOption(null, false)
    })

    it('container option', async () => {
      assert(
        await page.evaluate(() => {
          const posObserver = PositionObserver()
          return posObserver.container === document.body
        })
      )
      assert(
        await page.evaluate(() => {
          const elObserver = ElementObserver()
          return elObserver.container === document.body
        })
      )

      assert(
        await page.evaluate(() => {
          const container = document.createElement('div')
          const posObserver = PositionObserver({ container })
          return posObserver.container === container
        })
      )
      assert(
        await page.evaluate(() => {
          const container = document.createElement('div')
          const elObserver = ElementObserver(null, { container })
          return elObserver.container === container
        })
      )
    })
  })

  describe('Observers', () => {
    it('auto-activates, can destroy and re-activate', async () => {
      async function testObserverType(type) {
        const [
          initialViewportCount,
          initialObserverCount,
          destroyedViewportCount,
          reactivatedViewportCount,
          reactivatedObserverCount,
          alreadyActivatedViewportCount,
          alreadyActivatedObserverCount
        ] = await page.evaluate(type => {
          const observer =
            type === 'ElementObserver' ? ElementObserver(document.createElement('div')) : PositionObserver()
          const initialViewportCount = __viewports__.length
          const initialObserverCount = __viewports__[0].observers.length
          observer.destroy()
          const destroyedViewportCount = __viewports__.length
          observer.activate()
          const reactivatedViewportCount = __viewports__.length
          const reactivatedObserverCount = __viewports__[0].observers.length
          observer.activate()
          const alreadyActivatedViewportCount = __viewports__.length
          const alreadyActivatedObserverCount = __viewports__[0].observers.length
          return [
            initialViewportCount,
            initialObserverCount,
            destroyedViewportCount,
            reactivatedViewportCount,
            reactivatedObserverCount,
            alreadyActivatedViewportCount,
            alreadyActivatedObserverCount
          ]
        }, type)
        assert.equal(initialViewportCount, 1)
        assert.equal(initialObserverCount, 1)
        assert.equal(destroyedViewportCount, 0)
        assert.equal(reactivatedViewportCount, 1)
        assert.equal(reactivatedObserverCount, 1)
        assert.equal(alreadyActivatedViewportCount, 1)
        assert.equal(alreadyActivatedObserverCount, 1)
      }

      await testObserverType('PositionObserver')
      await closePage()
      await createPage()
      await testObserverType('ElementObserver')
    })

    it('reuses the same viewport if containers are the same', async () => {
      async function testObserverType(type) {
        const [viewportCount, observerCount1, observerCount2] = await page.evaluate(type => {
          const Observer = window[type]
          Observer()
          Observer()
          Observer()
          const container = document.createElement('div')
          if (type === 'ElementObserver') {
            Observer(document.createElement('div'), { container })
            Observer(document.createElement('div'), { container })
          } else {
            Observer({ container })
            Observer({ container })
          }
          return [__viewports__.length, __viewports__[0].observers.length, __viewports__[1].observers.length]
        }, type)
        assert.equal(viewportCount, 2)
        assert.equal(observerCount1, 3)
        assert.equal(observerCount2, 2)
      }

      await testObserverType('PositionObserver')
      await closePage()
      await createPage()
      await testObserverType('ElementObserver')
    })

    it('destroys after trigging with once option', async () => {
      assert.ok(
        await page.evaluate(pageHeight => {
          const content = document.createElement('div')
          const contentHeight = pageHeight * 2
          content.style.height = contentHeight + 'px'
          document.body.appendChild(content)

          return new Promise(resolve => {
            PositionObserver({
              once: true,
              onBottom() {
                setTimeout(() => resolve(__viewports__.length === 0))
              }
            })
            window.scrollTo(0, contentHeight)
          })
        }, pageHeight)
      )

      await closePage()
      await createPage()

      assert.ok(
        await page.evaluate(pageHeight => {
          const content = document.createElement('div')
          const contentHeight = pageHeight * 2
          content.style.height = contentHeight + 'px'
          document.body.appendChild(content)

          const element = document.createElement('div')
          element.style.height = '10px'
          document.body.appendChild(element)

          return new Promise(resolve => {
            ElementObserver(element, {
              once: true,
              onEnter() {
                setTimeout(() => resolve(__viewports__.length === 0))
              }
            })
            window.scrollTo(0, contentHeight)
          })
        }, pageHeight)
      )
    })
  })

  describe('PositionObserver', () => {
    it('triggers onBottom callback when reaching bottom', async () => {
      assert(
        await page.evaluate(pageHeight => {
          const content = document.createElement('div')
          const contentHeight = pageHeight * 2
          content.style.height = contentHeight + 'px'
          document.body.appendChild(content)

          return new Promise(resolve => {
            PositionObserver({
              onBottom() {
                resolve(1)
              }
            })
            window.scrollTo(0, contentHeight)
          })
        }, pageHeight)
      )
    })

    it('triggers onTop callback when reaching top', async () => {
      assert(
        await page.evaluate(pageHeight => {
          const content = document.createElement('div')
          const contentHeight = pageHeight * 2
          content.style.height = contentHeight + 'px'
          document.body.appendChild(content)
          window.scrollTo(0, contentHeight)

          return new Promise(resolve => {
            PositionObserver({
              onTop() {
                resolve(1)
              }
            })
            window.scrollTo(0, 0)
          })
        }, pageHeight)
      )
    })

    it('triggers onRight callback when reaching right', async () => {
      assert(
        await page.evaluate(pageWidth => {
          const content = document.createElement('div')
          const contentWidth = pageWidth * 2
          content.style.height = '1px'
          content.style.width = contentWidth + 'px'
          document.body.appendChild(content)

          return new Promise(resolve => {
            PositionObserver({
              onRight() {
                resolve(1)
              }
            })
            window.scrollTo(contentWidth, 0)
          })
        }, pageWidth)
      )
    })

    it('triggers onLeft callback when reaching left', async () => {
      assert(
        await page.evaluate(pageWidth => {
          const content = document.createElement('div')
          const contentWidth = pageWidth * 2
          content.style.height = '1px'
          content.style.width = contentWidth + 'px'
          document.body.appendChild(content)
          window.scrollTo(contentWidth, 0)

          return new Promise(resolve => {
            PositionObserver({
              onLeft() {
                resolve(1)
              }
            })
            window.scrollTo(0, 0)
          })
        }, pageWidth)
      )
    })

    it('triggers onBottom callback if created while at bottom', async () => {
      assert(
        await page.evaluate(pageHeight => {
          const content = document.createElement('div')
          const contentHeight = pageHeight * 2
          content.style.height = contentHeight + 'px'
          document.body.appendChild(content)
          window.scrollTo(0, contentHeight)

          return new Promise(resolve => {
            PositionObserver({
              onBottom() {
                resolve(1)
              }
            })
          })
        }, pageHeight)
      )
    })

    it('triggers onRight callback if created while at right', async () => {
      assert(
        await page.evaluate(pageWidth => {
          const content = document.createElement('div')
          const contentWidth = pageWidth * 2
          content.style.height = '1px'
          content.style.width = contentWidth + 'px'
          document.body.appendChild(content)
          window.scrollTo(contentWidth, 0)

          return new Promise(resolve => {
            PositionObserver({
              onRight() {
                resolve(1)
              }
            })
          })
        }, pageWidth)
      )
    })

    it('triggers onMaximized but not other callbacks when content and container are same size', async () => {
      assert(
        await page.evaluate(pageHeight => {
          const content = document.createElement('div')
          const contentHeight = pageHeight * 2
          content.style.height = contentHeight + 'px'
          document.body.appendChild(content)

          return new Promise(resolve => {
            PositionObserver({
              onMaximized() {
                resolve(1)
              },
              onTop() {
                resolve(0)
              },
              onBottom() {
                resolve(0)
              },
              onLeft() {
                resolve(0)
              },
              onRight() {
                resolve(0)
              }
            })
            window.scrollTo(0, contentHeight)
            content.style.height = pageHeight + 'px'
          })
        }, pageHeight)
      )
    })

    it('handles scroll/resize events with custom handler', async () => {
      assert.notEqual(
        await page.evaluate(pageHeight => {
          const content = document.createElement('div')
          const contentHeight = pageHeight * 2
          content.style.height = contentHeight + 'px'
          document.body.appendChild(content)
          window.scrollTo(0, contentHeight)

          return new Promise(resolve => {
            let count = 0
            PositionObserver({
              handleScrollResizeEvent: handler => {
                count = count + 1
                return handler
              },
              onBottom() {
                resolve(1)
              }
            })
          })
        }, pageHeight),
        0
      )
    })
  })

  describe('ElementObserver', () => {
    it('triggers onEnter/onExit scrolling up/down', async () => {
      assert.ok(
        await page.evaluate(pageHeight => {
          const content = document.createElement('div')
          const contentHeight = pageHeight * 2
          content.style.height = contentHeight + 'px'
          document.body.appendChild(content)

          const element = document.createElement('div')
          element.style.height = '10px'
          document.body.appendChild(element)

          return new Promise(resolve => {
            let entered, exited
            ElementObserver(element, {
              onEnter() {
                entered = true
              },
              onExit() {
                exited = true
                entered && exited && resolve(1)
              }
            })

            window.scrollTo(0, contentHeight)
            setTimeout(() => window.scrollTo(0, 0), 65)
          })
        }, pageHeight)
      )
    })

    it('triggers onEnter/onExit scrolling left/right', async () => {
      assert.ok(
        await page.evaluate(pageWidth => {
          const content = document.createElement('div')
          const contentWidth = pageWidth * 2
          content.style.width = contentWidth + 'px'
          content.style.height = '10px'
          document.body.appendChild(content)

          const element = document.createElement('div')
          element.style.height = '10px'
          document.body.appendChild(element)

          return new Promise(resolve => {
            let entered, exited
            ElementObserver(element, {
              onEnter() {
                entered = true
              },
              onExit() {
                exited = true
                entered && exited && resolve(1)
              }
            })

            window.scrollTo(contentWidth, 0)
            setTimeout(() => window.scrollTo(0, 0), 65)
          })
        }, pageWidth)
      )
    })

    it('triggers on non-window containers when scrolling container', async () => {
      assert.ok(
        await page.evaluate(() => {
          const container = document.createElement('div')
          container.style.height = '100px'
          container.style.width = '100px'
          container.style.overflow = 'auto'
          document.body.appendChild(container)

          const spacer = document.createElement('div')
          spacer.style.height = '200px'
          container.appendChild(spacer)

          const element = document.createElement('div')
          element.style.height = '10px'
          element.style.width = '10px'
          container.appendChild(element)

          return new Promise(resolve => {
            let entered, exited
            ElementObserver(element, {
              container,
              onEnter() {
                entered = true
              },
              onExit() {
                exited = true
                entered && exited && resolve(1)
              }
            })

            container.scrollTop = 200
            setTimeout(() => (container.scrollTop = 0), 65)
          })
        })
      )
    })

    it('triggers on non-window containers when scrolling window', async () => {
      assert.ok(
        await page.evaluate(pageHeight => {
          const spacer = document.createElement('div')
          const spacerHeight = pageHeight * 2
          spacer.style.height = spacerHeight + 'px'
          document.body.appendChild(spacer)

          const container = document.createElement('div')
          const containerHeight = 100
          container.style.height = containerHeight + 'px'
          container.style.width = containerHeight + 'px'
          container.style.overflow = 'auto'
          document.body.appendChild(container)

          const element = document.createElement('div')
          element.style.height = containerHeight / 2 + 'px'
          element.style.width = containerHeight / 2 + 'px'
          container.appendChild(element)

          return new Promise(resolve => {
            let entered, exited
            ElementObserver(element, {
              container,
              onEnter() {
                entered = true
              },
              onExit() {
                exited = true
                entered && exited && resolve(1)
              }
            })

            window.scrollTo(0, spacerHeight + containerHeight)
            setTimeout(() => window.scrollTo(0, 0), 65)
          })
        }, pageHeight)
      )
    })

    it('should trigger onEnter multiple times without an onExit callback', async () => {
      assert.ok(
        await page.evaluate(pageHeight => {
          const content = document.createElement('div')
          const contentHeight = pageHeight * 2
          content.style.height = contentHeight + 'px'
          document.body.appendChild(content)

          const element = document.createElement('div')
          element.style.height = '10px'
          document.body.appendChild(element)

          return new Promise(resolve => {
            let entered = 0
            ElementObserver(element, {
              onEnter() {
                entered++
                entered === 2 && resolve(1)
              }
            })

            window.scrollTo(0, contentHeight)
            setTimeout(() => window.scrollTo(0, 0), 65)
            setTimeout(() => window.scrollTo(0, contentHeight), 65 * 2)
          })
        }, pageHeight)
      )
    })

    it('triggers onEnter if in view upon creation', async () => {
      assert.ok(
        await page.evaluate(() => {
          const element = document.createElement('div')
          element.style.height = '10px'
          document.body.appendChild(element)

          return new Promise(resolve => {
            ElementObserver(element, {
              onEnter() {
                resolve(1)
              }
            })
          })
        })
      )
    })

    it('auto destroys if no longer DOM', async () => {
      const results = await page.evaluate(pageHeight => {
        const content = document.createElement('div')
        const contentHeight = pageHeight * 2
        content.style.height = contentHeight + 'px'
        document.body.appendChild(content)

        const element = document.createElement('div')
        element.style.height = '10px'
        document.body.appendChild(element)

        const results = []
        ElementObserver(element)
        results.push(__viewports__.length)
        document.body.removeChild(element)
        window.scrollTo(0, contentHeight)
        return new Promise(resolve => {
          setTimeout(() => {
            results.push(__viewports__.length)
            resolve(results)
          }, 65)
        })
      }, pageHeight)

      assert.deepEqual(results, [1, 0])
    })

    it('does not auto-destroy if not initiallly in DOM', async () => {
      assert.ok(
        await page.evaluate(() => {
          const element = document.createElement('div')
          element.style.height = '10px'

          ElementObserver(element)
          return __viewports__.length === 1
        })
      )
    })

    it('handles scroll/resize events with custom handler', async () => {
      assert.notEqual(
        await page.evaluate(pageHeight => {
          const content = document.createElement('div')
          const contentHeight = pageHeight * 2
          content.style.height = contentHeight + 'px'
          document.body.appendChild(content)

          const element = document.createElement('div')
          element.style.height = '10px'
          document.body.appendChild(element)

          return new Promise(resolve => {
            let entered, exited
            let count = 0
            ElementObserver(element, {
              handleScrollResizeEvent: handler => {
                count = count + 1
                return handler
              },
              onEnter() {
                entered = true
              },
              onExit() {
                exited = true
                entered && exited && resolve(1)
              }
            })

            window.scrollTo(0, contentHeight)
            setTimeout(() => window.scrollTo(0, 0), 65)
          })
        }, pageHeight),
        0
      )
    })
  })
})
