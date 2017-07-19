import React from 'react'
import Link from 'next/link'
import { Row, Col } from 'react-bootstrap'
import Page from './../components/layouts/page.js'

export default class extends React.Component {
  render () {
    return (
      <Page>
        <Row>
          <Col md={12}>
            <h1>About MessageBot</h1>
            <p>MessageBot is a replacement to all the marketing and analytic tools you use today.  It can replace Google Analytics, SailThru, MailChimp, Urban Airship... and more!</p>
            <p>Visit <Link href='http://messagebot.io'><a>MessageBot.io</a></Link> to learn more.</p>
            <p>MessageBot is built by the folks at <Link href='https://www.delicioushat.com'><a>Delicious Hat</a></Link></p>
          </Col>
        </Row>
      </Page>
    )
  }
}
