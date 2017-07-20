import React from 'react'
import { Jumbotron, Row, Col, Button } from 'react-bootstrap'
import Page from './../components/layouts/page.js'

export default class extends React.Component {
  joinMailingList () {
    window.location.href = 'http://eepurl.com/bTrGYP'
  }

  render () {
    return (
      <Page loggedIn={false}>
        <Jumbotron>
          <Row>
            <Col md={4}>
              <img src='/static/images/logo.png' style={{maxWidth: 200}} className='animated-hover-robot' />
            </Col>
            <Col md={8}>
              <h1>MessageBot</h1>
              <h2>A future-proof customer relationship and analytics platform that grows with you!</h2>
              <Button bsStyle='primary' bsSize='large' onClick={this.joinMailingList}>Join our Mailing List</Button>
            </Col>
          </Row>
        </Jumbotron>
      </Page>
    )
  }
}
