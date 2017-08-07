import React from 'react'
import { Row, Col } from 'react-bootstrap'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      client: props.client,
      latestTick: 0,
      locks: []
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.latestTick && this.state.latestTick < nextProps.latestTick) {
      this.setState({latestTick: nextProps.latestTick})
      this.loadLocks()
    }
  }

  componentDidMount () {
    this.loadLocks()
  }

  loadLocks () {
    const client = this.props.client

    client.action({}, '/api/resque/locks', 'GET', (data) => {
      let locks = []
      Object.keys(data.locks).forEach(function (l) {
        locks.push({lock: l, at: new Date(parseInt(data.locks[l]) * 1000)})
      })

      this.setState({locks: locks})
    }, (error) => { this.props.updateError(error) })
  }

  delLock (lock) {
    const client = this.props.client

    if (confirm('Are you sure?')) {
      client.action({
        lock: lock
      }, '/api/resque/delLock', 'POST', (data) => {
        this.loadLocks()
      }, (error) => { this.props.updateError(error) })
    }
  }

  render () {
    let index = -1

    return (
      <div>
        <h1>Locks ({ this.state.locks.length })</h1>

        <Row>
          <Col md={12}>

            <table className='table table-striped table-hover '>
              <thead>
                <tr>
                  <th>&nbsp;</th>
                  <th>Name</th>
                  <th>Expires</th>
                  <th>&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.state.locks.map((l) => {
                    index++
                    return (
                      <tr key={`${index}-${l.at.getTime()}`}>
                        <td>{ (index + 1) }</td>
                        <td>{ l.lock }</td>
                        <td>{ l.at.toString() }</td>
                        <td><button onClick={this.delLock.bind(this, l.lock)} className='btn btn-xs btn-warning'>Delete</button></td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>

          </Col>
        </Row>
      </div>
    )
  }
}
