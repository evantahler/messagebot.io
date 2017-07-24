import React from 'react'
import { Navbar, Nav, NavDropdown, MenuItem } from 'react-bootstrap'
import PaginationHelper from './../utils/paginationHelper.js'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      client: props.client,
      latestTick: 0,
      queues: [],
      queue: null,
      jobs: [],
      queueLength: 0,
      perPage: 50,
      page: 0
    }
  }

  componentDidMount () {
    this.loadQueues()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.latestTick && this.state.latestTick < nextProps.latestTick) {
      this.setState({latestTick: nextProps.latestTick})
      this.loadQueue()
    }
  }

  loadQueue () {
    const client = this.state.client

    if (!this.state.queue) { return }

    client.action({
      queue: this.state.queue,
      start: (this.state.page * this.state.perPage),
      stop: ((this.state.page * this.state.perPage) + (this.state.perPage - 1))
    }, '/api/resque/queued', 'GET', (data) => {
      this.setState({
        jobs: data.jobs,
        queueLength: data.queueLength
      })
    }, (error) => { this.props.updateError(error) })
  }

  delQueue () {
    const client = this.state.client
    if (confirm('Are you sure?')) {
      client.action({
        queue: this.state.queue
      }, '/api/resque/delQueue', 'POST', function (data) {
        this.loadQueue()
      }, (error) => { this.props.updateError(error) })
    }
  }

  loadQueues () {
    const client = this.state.client
    client.action({}, '/api/resque/resqueDetails', 'GET', (data) => {
      this.setState({queues: Object.keys(data.resqueDetails.queues)})
    }, (error) => { this.props.updateError(error) })
  }

  updatePage (page) {
    this.setState({page}, () => { this.loadQueue() })
  }

  updateQueue (queue) {
    this.setState({queue}, () => { this.loadQueue() })
  }

  render () {
    let index = -1
    let argCounter = -1

    return (
      <div>
        <h1>Queue Details</h1>

        <Navbar>
          <Navbar.Collapse>
            <Nav pullRight />

            <Nav pullLeft>
              <NavDropdown id='queuePicker' title={`queue: ${this.state.queue}`}>
                {
                  this.state.queues.map((queue) => {
                    return <MenuItem key={queue} onClick={this.updateQueue.bind(this, queue)} >{queue}</MenuItem>
                  })
                }
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        {
          this.state.queue
          ? <div>
            <h2>{ this.state.queue } ({ this.state.queueLength })</h2>

            <p>
              <button onClick={this.delQueue} className='btn btn-xs btn-danger'>Delete Queue</button>
            </p>

            <table id='jobTable' className='table table-striped table-hover '>
              <thead>
                <tr>
                  <th>&nbsp;</th>
                  <th>Class</th>
                  <th>Arguments</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.state.jobs.map((job) => {
                    index++

                    return (
                      <tr key={JSON.stringify(job) + '_' + index}>
                        <td>{ (this.state.page * this.state.perPage) + (index + 1) }</td>
                        <td>{ job.class }</td>
                        <td>
                          <ul>
                            {
                              job.args.map((a) => {
                                argCounter++
                                return <li key={`arg-${argCounter}`}>{JSON.stringify(a)}</li>
                              })
                            }
                          </ul>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>

            <PaginationHelper
              updatePage={this.updatePage.bind(this)}
              currentPage={this.state.page}
              total={this.state.queueLength}
              perPage={this.state.perPage}
            />
          </div>
          : null
        }
      </div>
    )
  }
}
