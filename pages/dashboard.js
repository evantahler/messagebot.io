import React from 'react'
import { Row, Col } from 'react-bootstrap'
import Page from './../components/layouts/page.js'
import Client from './../components/utils/client.js'

export default class extends React.Component {
  constructor () {
    super()
    this.state = {
      client: new Client(),
      error: null
    }
  }

  render () {
    return (
      <Page loggedIn client={this.state.client} error={this.state.error}>
        <Row>
          <Col md={12}>
            <h1>MessageBot Dashboard</h1>
          </Col>
        </Row>
      </Page>
    )
  }
}
