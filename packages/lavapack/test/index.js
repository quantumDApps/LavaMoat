const test = require('ava')
const { pipe, from, concat } = require('mississippi')
const pack = require('../')


test('dummy test', (t) => {
  pack({
    includePrelude: false
  })
  t.pass('no error thrown')
})

test('sourcemap test', async (t) => {
  const packStream = pack({
    raw: true,
    includePrelude: false,
    devMode: true,
    // hasExports: true,
  })

  // concat pack into a buffer
  const { promise, resolve, callback } = deferred()
  pipe(
    packStream,
    concat(resolve),
    callback
  )

  // add modules
  const modules = [{
    id: '1',
    sourceFile: 'index.js',
    source: `require('./log.js');`,
    deps: {
      './log.js': '2'
    },
    entry: true
  }, {
    id: '2',
    sourceFile: 'log.js',
    source: `console.log('hi');\nnew Error('danger');\nconsole.log('the end');`,
    deps: {},
  }]
  modules.forEach(moduleData => {
    packStream.write(moduleData)
  })
  packStream.end()

  const bundleBuffer = await promise
  // console.log(bundleBuffer.toString())
  
  t.pass('no error thrown')
})

function deferred () {
  const result = {}
  result.promise = new Promise((resolve, reject) => {
    result.resolve = resolve
    result.reject = reject
    result.callback = (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    }
  })
  return result
}