import React from 'react'
import { Row, Col } from 'react-bootstrap'
import Page from './../components/layouts/page.js'

export default class extends React.Component {
  render () {
    return (
      <Page loggedIn>
        <Row>
          <Col md={12}>
            <h1>MessageBot Dashboard</h1>
          </Col>
        </Row>
      </Page>
    )
  }
}
