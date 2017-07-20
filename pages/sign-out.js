import React from 'react'
import { Row, Col } from 'react-bootstrap'
import Router from 'next/router'
import Page from './../components/layouts/page.js'
import Client from './../components/utils/client.js'
import DangerAlert from './../components/alerts/danger.js'

export default class extends React.Component {
  constructor () {
    super()
    this.state = {
      client: new Client(),
      error: null
    }
  }

  componentDidMount () {
    const client = this.state.client

    client.action(this.state, '/api/session', 'DELETE', (data) => {
      Router.push({pathname: '/'})
    }, (error) => {
      this.setState({error})
    })
  }

  render () {
    return (
      <Page>
        <Row>
          <Col md={12}>
            <DangerAlert message={this.state.error} />
          </Col>

          <Col md={12}>
            <em>Signing Out...</em>
          </Col>
        </Row>
      </Page>
    )
  }
}
