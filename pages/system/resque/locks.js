import React from 'react'
import { Row, Col } from 'react-bootstrap'

export default React.createClass({
  getInitialState: function () {
    return {
      timer: null,
      refreshInterval: parseInt(this.props.refreshInterval, 10),
      locks: []
    }
  },

  componentWillReceiveProps (nextProps) {
    if (nextProps.refreshInterval !== this.state.refreshInterval) {
      this.setState({refreshInterval: parseInt(nextProps.refreshInterval, 10)}, () => {
        this.loadLocks()
      })
    }
  },

  componentDidMount () {
    this.loadLocks()
  },

  componentWillUnmount () {
    clearTimeout(this.state.timer)
  },

  loadLocks () {
    const client = this.props.client

    clearTimeout(this.state.timer)
    if (this.state.refreshInterval > 0) {
      let timer = setTimeout(() => {
        this.loadDelayedJobs()
      }, (this.state.refreshInterval * 1000))
      this.setState({timer: timer})
    }

    client.action({}, '/api/resque/locks', 'GET', (data) => {
      let locks = []
      Object.keys(data.locks).forEach(function (l) {
        locks.push({lock: l, at: new Date(parseInt(data.locks[l], 10) * 1000, 10)})
      })

      this.setState({locks: locks})
    })
  },

  delLock (lock) {
    const client = this.props.client

    if (confirm('Are you sure?')) {
      client.action({
        lock: lock
      }, '/api/resque/delLock', 'POST', (data) => {
        this.loadLocks()
      })
    }
  },

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
                        <td><button onClick={this.delLock.bind(null, l.lock)} className='btn btn-xs btn-warning'>Delete</button></td>
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
})
