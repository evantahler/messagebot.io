// until https://github.com/zeit/next.js/issues/1827 is solved
// we need to stub the router in the test ENV

import Router from 'next/router'

if (process.env.NODE_ENV === 'test') {
  const mockedRouter = { push: () => {} }
  Router.router = mockedRouter
}
