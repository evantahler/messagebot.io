import React from 'react'
import Link from 'next/link'
import { Row, Col, Modal } from 'react-bootstrap'
import PaginationHelper from './../utils/paginationHelper.js'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      client: props.client,
      latestTick: 0,
      failed: [],
      counts: {failed: 0},
      focusedException: {},
      perPage: 10,
      showModal: false,
      page: 0
    }
  }

  componentDidMount () {
    this.loadFailed()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.latestTick && this.state.latestTick < nextProps.latestTick) {
      this.setState({latestTick: nextProps.latestTick})
      this.loadFailed()
    }
  }

  loadFailedCount () {
    const client = this.state.client
    client.action({}, '/api/resque/resqueFailedCount', 'GET', (data) => {
      this.setState({counts: {failed: data.failedCount}})
    }, (error) => { this.props.updateError(error) })
  }

  loadFailed () {
    const client = this.state.client
    client.action({
      start: (this.state.page * this.state.perPage),
      stop: ((this.state.page * this.state.perPage) + (this.state.perPage - 1))
    }, '/api/resque/resqueFailed', 'GET', (data) => {
      this.setState({failed: data.failed}, () => {
        this.loadFailedCount()
      })
    }, (error) => { this.props.updateError(error) })
  }

  removeFailedJob (index) {
    const client = this.state.client
    client.action({
      id: index
    }, '/api/resque/removeFailed', 'POST', (data) => {
      this.loadFailed()
    }, (error) => { this.props.updateError(error) })
  }

  retryFailedJob (index) {
    const client = this.state.client
    client.action({
      id: index
    }, '/api/resque/retryAndRemoveFailed', 'POST', (data) => {
      this.loadFailed()
    }, (error) => { this.props.updateError(error) })
  }

  removeAllFailedJobs () {
    const client = this.state.client
    if (window.confirm('Are you sure?')) {
      client.action({}, '/api/resque/removeAllFailed', 'POST', (data) => {
        this.loadFailed()
      }, (error) => { this.props.updateError(error) })
    }
  }

  retryAllFailedJobs () {
    const client = this.state.client
    if (window.confirm('Are you sure?')) {
      client.action({}, '/api/resque/retryAndRemoveAllFailed', 'POST', (data) => {
        this.loadFailed()
      }, (error) => { this.props.updateError(error) })
    }
  }

  renderFailureStack (index) {
    let focusedException = this.state.failed[index]
    focusedException.renderedStack = ''
    if (focusedException.backtrace) {
      focusedException.renderedStack = focusedException.backtrace.join('\r\n')
    }

    this.setState({
      focusedException: focusedException,
      showModal: true
    })
  }

  onHide () {
    this.setState({showModal: false})
  }

  updatePage (page) {
    this.setState({page}, () => { this.loadFailed() })
  }

  render () {
    let index = -1
    let argCounter = -1

    return (
      <div>
        <h1>Failed Jobs ({ this.state.counts.failed })</h1>

        <p>
          <button onClick={this.retryAllFailedJobs.bind(this)} className='btn btn-sm btn-warning'>Retry All</button>&nbsp;
          <button onClick={this.removeAllFailedJobs.bind(this)} className='btn btn-sm btn-danger'>Remove All</button>
        </p>

        <Row>
          <Col md={12}>

            <table id='failureTable' className='table table-striped table-hover '>
              <thead>
                <tr>
                  <th>&nbsp;</th>
                  <th>Date</th>
                  <th>Exception</th>
                  <th>Queue</th>
                  <th>Method</th>
                  <th>Worker</th>
                  <th>Arguments</th>
                  <th>&nbsp;</th>
                  <th>&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {
                    this.state.failed.map((f) => {
                      index++

                      return (
                        <tr key={`failure-${index}`}>
                          <td>{ (this.state.page * this.state.perPage) + (index + 1) }</td>
                          <td>{ f.failed_at }</td>
                          <td>
                            <span onClick={this.renderFailureStack.bind(this, index)} ><span className='glyphicon glyphicon-plus-sign' /></span>
                            <strong>{ f.exception }: { f.error }</strong>
                          </td>
                          <td><span className='text-success'><Link href={`/system/resque/queue/${f.queue}`}><a>{ f.queue }</a></Link></span></td>
                          <td>{ f.payload.class }</td>
                          <td>{ f.worker }</td>
                          <td>
                            <ul>
                              {
                                f.payload.args.map((a) => {
                                  argCounter++
                                  return <li key={`arg-${argCounter}`}>{JSON.stringify(a)}</li>
                                })
                              }
                            </ul>
                          </td>
                          <td><button onClick={this.retryFailedJob.bind(this, index)} className='btn btn-xs btn-warning'>Retry</button></td>
                          <td><button onClick={this.removeFailedJob.bind(this, index)} className='btn btn-xs btn-danger'>Remove</button></td>
                        </tr>
                      )
                    })
                  }
              </tbody>
            </table>

            <PaginationHelper
              currentPage={this.state.page}
              total={this.state.counts.failed}
              perPage={this.state.perPage}
              updatePage={this.updatePage.bind(this)}
            />

          </Col>
        </Row>

        <Modal show={this.state.showModal} onHide={this.state.onHide}>
          <Modal.Header>{ this.state.focusedException.exception }: { this.state.focusedException.error }</Modal.Header>
          <Modal.Body>
            <p><strong>Queue</strong>: {this.state.focusedException.queue} </p>
            <p><strong>Worker</strong>: {this.state.focusedException.worker} </p>
            <p><strong>Payload</strong>:</p>
            <pre>
              {
                this.state.focusedException.payload ? JSON.stringify(this.state.focusedException.payload.args) : null
              }
            </pre>
            <p><strong>Stack</strong>:</p>
            <pre>{ this.state.focusedException.renderedStack }</pre>
          </Modal.Body>
          <Modal.Footer>
            <button className='btn btn-xs' onClick={this.onHide.bind(this)}>Close</button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}
