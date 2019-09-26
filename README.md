# gatsby-plugin-zeit-now

Configuring Zeit Now [routes](https://zeit.co/docs/v2/advanced/routes/), enhancing [zero-config deployments](https://zeit.co/blog/zero-config).

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

## Inspirations

[gatsby-plugin-netlify](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-netlify)

[gatsby-plugin-now](https://github.com/zeit/now/tree/master/packages/gatsby-plugin-now)

[Security + Cache Headers Example for Gatsby](https://spectrum.chat/zeit/now/security-cache-headers-example-for-gatsby~ad47cdc7-f132-42b8-a9bf-0f0058035fad)

## License

MIT
