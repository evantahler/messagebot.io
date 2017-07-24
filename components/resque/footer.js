import React from 'react'
import { Row, Col } from 'react-bootstrap'
import Link from 'next/link'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      client: props.client,
      redis: {},
      version: ''
    }
  }

  componentDidMount () {
    this.loadPackageDetails()
  }

  loadPackageDetails () {
    const client = this.state.client

    client.action({}, '/api/resque/packageDetails', 'GET', (data) => {
      this.setState({
        version: data.packageDetails.packageJSON.version,
        redis: {
          host: data.packageDetails.redis[0].host,
          port: data.packageDetails.redis[0].port,
          db: data.packageDetails.redis[0].db
        }
      })
    })
  }

  render () {
    return (
      <div>
        <hr />

        <Row>
          <Col md={6}>
            <p className='text-muted'>
              <span className='text-warning'><strong>redis connection:</strong></span> { this.state.redis.host }:{ this.state.redis.port }#{ this.state.redis.db }<br />
            </p>
          </Col>

          <Col md={6}>
            <p className='text-muted text-right'>
              <Link href='https://github.com/evantahler/ah-resque-ui'>
                <a target='_new'><strong>ah-resque-ui version:</strong> { this.state.version }</a>
              </Link>
            </p>
          </Col>
        </Row>
      </div>
    )
  }
}
