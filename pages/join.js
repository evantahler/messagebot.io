import React from 'react'
import { Row, Col } from 'react-bootstrap'
import Page from './../components/layouts/page.js'

export default class extends React.Component {
  render () {
    return (
      <Page loggedIn={false}>
        <Row>
          <Col md={12}>
            <h1>Join MessageBot</h1>
            <p>Send me an <a href='mailto:admin@messagebot.io'>email</a> to sign your team up.</p>
            <p>Prices and Plans go here.</p>
          </Col>
        </Row>
      </Page>
    )
  }
}
