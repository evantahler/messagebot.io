import React from 'react'
import { Grid, Row, Col } from 'react-bootstrap'
import Head from 'next/head'
import Router from 'next/router'

import Header from './../header.js'
import Footer from './../footer.js'

import DangerAlert from './../alerts/danger.js'
import SuccessAlert from './../alerts/success.js'

import TestRouter from './../utils/testRouter.js' //eslint-disable-line

const CheckLoginPages = [
  '/'
]

export default class extends React.Component {
  componentDidMount () {
    this.checkLoggedIn()

    try {
      window.MESSAGEBOT.init(this.props.client.get('personGuid'), (error) => {
        if (error) { console.error(error) }
        window.MESSAGEBOT.track({type: 'pageview'})
      })
    } catch (error) { console.error(error) }
  }

  checkLoggedIn () {
    const client = this.props.client
    if (CheckLoginPages.indexOf(Router.pathname) >= 0) {
      client.action({}, '/api/session', 'PUT', (response) => {
        if (response.success) { Router.push('/dashboard') }
      })
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
          <link rel='stylesheet' type='text/css' href='/static/css/react-datetime.css' />
          <link rel='stylesheet' type='text/css' href='/static/css/codemirror.css' />
          <link href='https://fonts.googleapis.com/css?family=Open+Sans:300,400,700,800' rel='stylesheet' />

          <script type='text/javascript' src={`${process.env.API_URL}/api/client`} />

          <title>MessageBot</title>
        </Head>

        <Grid style={this.globalStyle()}>
          <br />
          <Header loggedIn={this.props.loggedIn} client={this.props.client} />

          <Row>
            <Col md={12}>
              <DangerAlert message={this.props.error} />
              <SuccessAlert message={this.props.successMessage} />
            </Col>
          </Row>

          {
            this.props.children
            ? this.props.children
            : this.props.error
              ? null
              : <em>Loading...</em>
          }

          <Footer />
        </Grid>

      </div>
    )
  }
}
