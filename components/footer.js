import React from 'react'
import { Col, Row } from 'react-bootstrap'

export default function Footer () {
  const date = new Date()

  return (
    <footer>
      <Row>
        <Col md={12}>
          <hr />
          <p>© MessageBot & Delicious Hat, {date.getFullYear()}</p>
        </Col>
      </Row>
    </footer>
  )
}
