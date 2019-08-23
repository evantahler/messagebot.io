import React from 'react'
import { Jumbotron, Row, Col, Button } from 'react-bootstrap'
import Page from './../components/layouts/page.js'

const mailingListURL = 'http://eepurl.com/bTrGYP'

export default function IndexPage () {
  const joinMailingList = () => {
    window.location.href = mailingListURL
  }

  return (
    <Page>
      <Jumbotron>
        <Row>
          <Col md={4} style={{ textAlign: 'center' }}>
            <img src='/static/images/logo.png' style={{ maxWidth: '80%' }} className='animated-hover-robot' />
          </Col>
          <Col md={8}>
            <h1>Message Bot</h1>
            <br />
            <h2>A Framework for Modern Digital Marketing</h2>
            <br />
            <Button variant='danger' size='large' onClick={joinMailingList}>Join our Mailing List</Button>
          </Col>
        </Row>
      </Jumbotron>
    </Page>
  )
}
