import React from 'react'
import { Row, Col } from 'react-bootstrap'
import Page from './../components/layouts/page.js'

export default class extends React.Component {
  render () {
    return (
      <Page>

        <Row style={{paddingTop: 50}}>
          <Col md={2} />
          <Col md={8} style={{textAlign: 'center'}}>
            <img src='/static/images/logo.png' style={{maxWidth: 200}} className='animated-hover-robot' />
            <h1>MessageBot</h1>
            <br />
            <h2>A future-proof customer relationship and analytics platform that grows with you!</h2>
            <a href='http://eepurl.com/bTrGYP'>Join our Mailing List</a>
          </Col>
          <Col md={2} />
        </Row>

      </Page>
    )
  }
}
