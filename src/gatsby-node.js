const { writeFileSync } = require('fs')
const { join } = require('path')

// Do not change this.
const REDIRECT_FILE_NAME = '__now_routes_g4t5bY.json'

const security = [
  {
    src: '/.*',
    headers: {
      'referrer-policy': 'same-origin',
      'feature-policy': "geolocation 'self'; microphone 'self'; camera 'self'",
      'expect-ct': 'max-age=604800, enforce',
      'strict-transport-security': 'max-age=31536000; includeSubDomains',
      'x-frame-options': 'DENY',
      'x-xss-protection': '1; mode=block',
      'x-content-type-options': 'nosniff',
      'x-download-options': 'noopen',
    },
    continue: true,
  },
]

const alwaysCache = {
  headers: { 'cache-control': 'public, max-age=31536000, immutable' },
  continue: true,
}

const caching = [
  {
    src: '^/(icons|static)/(.*)$',
    ...alwaysCache,
  },
  {
    src: '^/.*\\.(js|css)$',
    ...alwaysCache,
  },
  {
    src: '^/(sw\\.js|app-data\\.json|.*\\.html|page-data/.*)$',
    headers: { 'cache-control': 'public,max-age=0,must-revalidate' },
    continue: true,
  },
]

const filesystem = { handle: 'filesystem' }

const notFound = { src: '/.*', status: 404, dest: '/404' }

const localizedNotFound = []

exports.onPostBuild = (
  { store },
  { globalHeaders = {}, headers = {} } = {}
) => {
  const {
    pages,
    program: { directory },
    redirects,
  } = store.getState()

  const pre = []
  const post = []

  // redirects
  redirects.forEach(({ fromPath, toPath, force, isPermanent, statusCode }) => {
    let status = isPermanent ? 301 : 302
    status = statusCode || status

    const route =
      status === 200
        ? {
            src: fromPath,
            dest: toPath,
          }
        : {
            src: fromPath,
            status,
            headers: { Location: toPath },
          }

    force ? pre.push(route) : post.push(route)
  })

  // client-only routes
  const GATSBY_MATCHPATH_REGEXP = /\*|:[^/]+/gi
  const NOT_FOUND_REGEXP = /\/404\/?$/

  Array.from(pages.values())
    .filter(page => page.matchPath && page.matchPath !== page.path)
    .forEach(page => {
      const src = page.matchPath.replace(GATSBY_MATCHPATH_REGEXP, '.*')
      const dest = page.path

      const isNotFoundPage = NOT_FOUND_REGEXP.test(dest)

      isNotFoundPage
        ? localizedNotFound.push({
            src,
            status: 404,
            dest,
          })
        : pre.push({
            src,
            dest,
          })
    })

  // merge globalHeaders from pluginOptions
  security[0].headers = { ...security[0].headers, ...globalHeaders }

  // add per-route headers from pluginOptions
  Object.entries(headers).forEach(([route, routeHeaders]) => {
    security.push({
      src: route,
      headers: routeHeaders,
      continue: true,
    })
  })

  const routes = [
    ...security,
    ...caching,
    ...pre,
    filesystem,
    ...post,
    ...localizedNotFound,
    notFound,
  ]

  writeFileSync(
    join(directory, 'public', REDIRECT_FILE_NAME),
    JSON.stringify(routes)
  )
}
