# gatsby-plugin-zeit-now

Configuring Zeit Now/Vercel [routes](https://vercel.com/docs/configuration#project/routes), enhancing [zero-config deployments](https://vercel.com/blog/zero-config).

## How it works

Add basic security headers and [caching headers](https://www.gatsbyjs.org/docs/caching/).

Automatically generates [redirects and rewrites](https://www.gatsbyjs.org/docs/actions/#createRedirect).

## Install

With Yarn:

```bash
yarn add gatsby-plugin-zeit-now
```

Or with npm:

```bash
npm install --save gatsby-plugin-zeit-now
```

## Usage

Add plugin to gatsby-config.js

```js
plugins: ['gatsby-plugin-zeit-now']
```

### Options

- `globalHeaders` allows modifying default headers (shown below) that apply to all routes.

```js
plugins: [
  {
    resolve: 'gatsby-plugin-zeit-now',
    options: {
      globalHeaders: {
        'referrer-policy': 'same-origin',
        'feature-policy':
          "geolocation 'self'; microphone 'self'; camera 'self'",
        'expect-ct': 'max-age=604800, enforce',
        'strict-transport-security': 'max-age=31536000; includeSubDomains',
        'x-frame-options': 'DENY',
        'x-xss-protection': '1; mode=block',
        'x-content-type-options': 'nosniff',
        'x-download-options': 'noopen'
      }
    }
  }
]
```

- `headers` allows configuring per-route headers.

```js
plugins: [
  {
    resolve: 'gatsby-plugin-zeit-now',
    options: {
      headers: {
        '/about': {
          'content-security-policy':
            "base-uri 'self'; default-src 'self' https://fonts.googleapis.com data:; object-src 'none'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; style-src 'self' 'https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com"
        }
      }
    }
  }
]
```

## Inspirations

[gatsby-plugin-netlify](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-netlify)

[gatsby-plugin-now](https://github.com/zeit/now/tree/master/packages/gatsby-plugin-now)

[Security + Cache Headers Example for Gatsby](https://spectrum.chat/zeit/now/security-cache-headers-example-for-gatsby~ad47cdc7-f132-42b8-a9bf-0f0058035fad)

## License

MIT
