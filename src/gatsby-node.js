const { writeFileSync } = require('fs')
const { join } = require('path')

// Do not change this.
const REDIRECT_FILE_NAME = '__now_routes_g4t5bY.json'

exports.onPostBuild = ({ store }) => {
  const { pages, program, redirects } = store.getState()

  const pre = []
  const post = []

  // client-only routes
  Array.from(pages.values())
    .filter(page => page.matchPath && page.matchPath !== page.path)
    .forEach(page =>
      post.push({
        src: page.matchPath.replace('*', '.*'),
        dest: page.path
      })
    )

  // redirects
  redirects.forEach(({ fromPath, toPath, force, isPermanent, statusCode }) => {
    if (!statusCode || statusCode === 200) {
      pre.push({
        src: fromPath,
        dest: toPath
      })
      return
    }

    const route = {
      src: fromPath,
      status: statusCode || (isPermanent ? 301 : 302),
      headers: { Location: toPath }
    }

    force ? pre.push(route) : post.push(route)
  })

  const filesystem = { handle: 'filesystem' }

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

  const notFound = { src: '/(.*)', status: 404, dest: '/404' }

  writeFileSync(
    join(program.directory, 'public', REDIRECT_FILE_NAME),
    JSON.stringify([security, ...pre, filesystem, ...post, notFound])
  )
}
