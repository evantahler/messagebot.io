const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { join } = require('path')

const dev = process.env.NODE_ENV !== 'production'
const port = parseInt(process.env.PORT || 3000)
const app = next({ dev })
const handle = app.getRequestHandler()

const rootStaticFiles = [
  '/robots.txt',
  '/sitemap.xml'
]

const dynamicBaseRoutes = [
  '/people/recent',
  '/events/recent',
  '/messages/recent',
  '/people/search',
  '/events/search',
  '/messages/search',
  '/person/view',
  '/event/view',
  '/message/view',
  '/lists/list',
  '/list/view'
]

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname, query } = parsedUrl

    // static root files
    if (rootStaticFiles.indexOf(pathname) === 0) {
      let path = join(__dirname, 'static', pathname)
      app.serveStatic(req, res, path)
    }

    // routes with dyamic IDs or Pages
    for (let i in dynamicBaseRoutes) {
      let dynamicBaseRoute = dynamicBaseRoutes[i]
      if (pathname.indexOf(dynamicBaseRoute) === 0 && pathname.length > dynamicBaseRoute.length) {
        let base = pathname.split('/')
        query.page = base.pop()

        if (base.join('/') === dynamicBaseRoute) {
          base = base.join('/')
        } else {
          query.item = base.pop()
          base = base.join('/')
        }

        app.render(req, res, base, query)

        return
      }
    }

    // normal handler
    handle(req, res, parsedUrl)
  })
  .listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
