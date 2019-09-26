const { writeFileSync } = require('fs')
const { join } = require('path')

// Do not change this.
const REDIRECT_FILE_NAME = '__now_routes_g4t5bY.json'

const security = {
  src: '/.*',
  headers: {
    'referrer-policy': 'same-origin',
    'feature-policy': "geolocation 'self'; microphone 'self'; camera 'self'",
    'expect-ct': 'max-age=604800, enforce',
    'strict-transport-security': 'max-age=31536000; includeSubDomains',
    'x-frame-options': 'DENY',
    'x-xss-protection': '1; mode=block',
    'x-content-type-options': 'nosniff',
    'x-download-options': 'noopen'
  },
  continue: true
}

const neverCache = {
  headers: { 'cache-control': 'public, max-age=0, must-revalidate' },
  continue: true
}
const alwaysCache = {
  headers: { 'cache-control': 'public, max-age=31536000, immutable' },
  continue: true
}

const sw = {
  src: '/sw.js',
  ...neverCache,
  continue: false
}

const caching = [
  sw,
  {
    src: '/(.*).html',
    ...neverCache
  },
  {
    src: '/page-data/.*',
    ...neverCache
  },
  {
    src: '/(icons|static)/.*',
    ...alwaysCache
  },
  {
    src: '/(.*).(js|css)',
    ...alwaysCache
  }
]

const filesystem = { handle: 'filesystem' }

const notFound = { src: '/(.*)', status: 404, dest: '/404' }

exports.onPostBuild = ({ store }) => {
  const { pages, program, redirects } = store.getState()

  const pre = []
  const post = []

  // redirects
  redirects.forEach(({ fromPath, toPath, force, isPermanent, statusCode }) => {
    let status = isPermanent ? 301 : 302
    status = statusCode || status

    if (status === 200) {
      pre.push({
        src: fromPath,
        dest: toPath
      })
      return
    }

    const route = {
      src: fromPath,
      status,
      headers: { Location: toPath }
    }

    force ? pre.push(route) : post.push(route)
  })

  // client-only routes
  Array.from(pages.values())
    .filter(page => page.matchPath && page.matchPath !== page.path)
    .forEach(page =>
      pre.push({
        src: page.matchPath.replace('*', '.*'),
        dest: page.path
      })
    )

  const routes = [security, ...caching, ...pre, filesystem, ...post, notFound]

  writeFileSync(
    join(program.directory, 'public', REDIRECT_FILE_NAME),
    JSON.stringify(routes)
  )
}
