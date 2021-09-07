const { writeFileSync } = require('fs')
const { join } = require('path')

exports.onPostBuild = (
  { store },
  { globalHeaders = {}, headers = {}, redirects: nowRedirects = [] } = {}
) => {
  // Do not change this.
  const REDIRECT_FILE_NAME = '__now_routes_g4t5bY.json'

  // cache-control headers
  const ALWAYS_CACHE = {
    headers: { 'cache-control': 'public, max-age=31536000, immutable' },
    continue: true,
  }

  const NEVER_CACHE = {
    headers: { 'cache-control': 'public,max-age=0,must-revalidate' },
    continue: true,
  }

  // routes
  const securityRoutes = [
    {
      src: '/.*',
      headers: {
        'referrer-policy': 'same-origin',
        'feature-policy':
          "geolocation 'self'; microphone 'self'; camera 'self'",
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

  const cachingRoutes = [
    {
      src: '^/(icons|static)/(.*)$',
      ...ALWAYS_CACHE,
    },
    {
      src: '^/.*\\.(js|css)$',
      ...ALWAYS_CACHE,
    },
    {
      src: '^/(sw\\.js|app-data\\.json|.*\\.html|page-data/.*)$',
      ...NEVER_CACHE,
    },
  ]

  const preFilesystemRoutes = []

  const filesystemRoute = { handle: 'filesystem' }

  const postFilesystemRoutes = []

  const localizedNotFoundRoutes = []

  const notFoundRoute = { src: '/.*', status: 404, dest: '/404' }

  const {
    pages,
    program: { directory },
    redirects,
  } = store.getState()

  nowRedirects.forEach(({ source, destination, statusCode = 308 }) => {
    postFilesystemRoutes.push({
      src: source,
      status: statusCode,
      headers: { Location: destination },
    })
  })

  // redirects
  const SPLAT_REGEXP = /\*/

  redirects.forEach(({ fromPath, toPath, force, isPermanent, statusCode }) => {
    let status = isPermanent ? 301 : 302
    status = statusCode || status

    let src = fromPath
    let dest = toPath

    const isSrcWildcard = SPLAT_REGEXP.test(src)
    const isDestWildcard = SPLAT_REGEXP.test(dest)

    if (isSrcWildcard && isDestWildcard) {
      src = src.replace(SPLAT_REGEXP, '(.*)')
      dest = dest.replace(SPLAT_REGEXP, '$1')
    }

    if (isSrcWildcard && !isDestWildcard) {
      src = src.replace(SPLAT_REGEXP, '.*')
    }

    const route =
      status === 200
        ? {
            src,
            dest,
          }
        : {
            src,
            status,
            headers: { Location: dest },
          }

    force ? preFilesystemRoutes.push(route) : postFilesystemRoutes.push(route)
  })

  // client-only routes
  const GATSBY_MATCHPATH_REGEXP = /\*|:[^/]+/gi
  const NOT_FOUND_REGEXP = /\/404\/?$/

  Array.from(pages.values())
    .filter((page) => page.matchPath && page.matchPath !== page.path)
    .forEach((page) => {
      const src = page.matchPath.replace(GATSBY_MATCHPATH_REGEXP, '.*')
      const dest = page.path

      const isNotFoundPage = NOT_FOUND_REGEXP.test(dest)

      isNotFoundPage
        ? localizedNotFoundRoutes.push({
            src,
            status: 404,
            dest,
          })
        : preFilesystemRoutes.push({
            src,
            dest,
          })
    })

  // merge globalHeaders from pluginOptions
  securityRoutes[0].headers = { ...securityRoutes[0].headers, ...globalHeaders }

  // add per-route headers from pluginOptions
  Object.entries(headers).forEach(([route, routeHeaders]) => {
    securityRoutes.push({
      src: route,
      headers: routeHeaders,
      continue: true,
    })
  })

  const routes = [
    ...securityRoutes,
    ...cachingRoutes,
    ...preFilesystemRoutes,
    filesystemRoute,
    ...postFilesystemRoutes,
    ...localizedNotFoundRoutes,
    notFoundRoute,
  ]

  writeFileSync(
    join(directory, 'public', REDIRECT_FILE_NAME),
    JSON.stringify(routes)
  )
}
