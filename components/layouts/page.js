import React from 'react'
import { Grid } from 'react-bootstrap'
import Head from 'next/head'
import Router from 'next/router'

import Header from './../header.js'
import Footer from './../footer.js'

export default class extends React.Component {
  componentDidMount () {
    Router.onRouteChangeComplete = (url) => {
      ga('send', 'pageview', location.pathname) // eslint-disable-line
    }
  }

  globalStyle () {
    return {
      fontFamily: 'Open Sans'
    }
  }

  render () {
    return (
      <div>
        <Head>
          <link rel='apple-touch-icon' sizes='57x57' href='/static/images/icons/apple-icon-57x57.png' />
          <link rel='apple-touch-icon' sizes='60x60' href='/static/images/icons/apple-icon-60x60.png' />
          <link rel='apple-touch-icon' sizes='72x72' href='/static/images/icons/apple-icon-72x72.png' />
          <link rel='apple-touch-icon' sizes='76x76' href='/static/images/icons/apple-icon-76x76.png' />
          <link rel='apple-touch-icon' sizes='114x114' href='/static/images/icons/apple-icon-114x114.png' />
          <link rel='apple-touch-icon' sizes='120x120' href='/static/images/icons/apple-icon-120x120.png' />
          <link rel='apple-touch-icon' sizes='144x144' href='/static/images/icons/apple-icon-144x144.png' />
          <link rel='apple-touch-icon' sizes='152x152' href='/static/images/icons/apple-icon-152x152.png' />
          <link rel='apple-touch-icon' sizes='180x180' href='/static/images/icons/apple-icon-180x180.png' />
          <link rel='icon' type='image/png' sizes='192x192' href='/static/images/icons/android-icon-192x192.png' />
          <link rel='icon' type='image/png' sizes='32x32' href='/static/images/icons/favicon-32x32.png' />
          <link rel='icon' type='image/png' sizes='96x96' href='/static/images/icons/favicon-96x96.png' />
          <link rel='icon' type='image/png' sizes='16x16' href='/static/images/icons/favicon-16x16.png' />

          <meta name='viewport' content='width=device-width' />
          <link rel='stylesheet' type='text/css' href='/static/css/bootstrap.min.css' />
          <link rel='stylesheet' type='text/css' href='/static/css/animations.css' />
          <link href='https://fonts.googleapis.com/css?family=Open+Sans:300,400,700,800' rel='stylesheet' />

          <title>MessageBot</title>

          <script src='/static/js/googleAnalytics.js' />
        </Head>

        <Grid style={this.globalStyle()}>
          <br />
          <Header loggedIn={this.props.loggedIn} />
          { this.props.children }
          <Footer />
        </Grid>

      </div>
    )
  }
}