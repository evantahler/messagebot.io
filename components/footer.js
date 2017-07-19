import React from 'react'
import { Col, Row } from 'react-bootstrap'

export default class extends React.Component {
  year () {
    return (new Date()).getFullYear()
  }

  render () {
    return (
      <Row>
        <Col md={12}>
          <hr />
          <p>© MessageBot & Delicious Hat, {this.year()}</p>
        </Col>
      </Row>
    )
  }
}
