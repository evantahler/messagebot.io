import React from 'react'
import { browserHistory } from 'react-router'
import PaginationHelper from '../../../components/utils/paginationHelper.js'

export default React.createClass({
  getInitialState: function () {
    return {
      timer: null,
      refreshInterval: parseInt(this.props.refreshInterval, 10),
      queue: this.props.params.queue,
      jobs: [],
      queueLength: 0,
      perPage: 50,
      page: parseInt(this.props.params.page || 0, 10)
    }
  },

  componentWillReceiveProps (nextProps) {
    if (nextProps.refreshInterval !== this.state.refreshInterval) {
      this.setState({refreshInterval: parseInt(nextProps.refreshInterval, 10)}, () => {
        this.loadQueue()
      })
    }

    if (nextProps.params.page && nextProps.params.page !== this.state.page) {
      this.setState({page: nextProps.params.page}, () => {
        this.loadQueue()
      })
    }
  },

  componentDidMount () {
    this.loadQueue()
  },

  componentWillUnmount () {
    clearTimeout(this.state.timer)
  },

  loadQueue () {
    clearTimeout(this.state.timer)
    if (this.state.refreshInterval > 0) {
      let timer = setTimeout(() => {
        this.loadDelayedJobs()
      }, (this.state.refreshInterval * 1000))
      this.setState({timer: timer})
    }

    const client = this.props.client

    client.action({
      queue: this.state.queue,
      start: (this.state.page * this.state.perPage),
      stop: ((this.state.page * this.state.perPage) + (this.state.perPage - 1))
    }, '/api/resque/queued', 'GET', (data) => {
      this.setState({
        jobs: data.jobs,
        queueLength: data.queueLength
      })
    })
  },

  delQueue () {
    const client = this.props.client

    if (confirm('Are you sure?')) {
      client.action({
        queue: this.state.queue
      }, '/api/resque/delQueue', 'POST', function (data) {
        browserHistory.push('/system/resque/overview')
      })
    }
  },

  render () {
    let index = -1
    let argCounter = -1

    return (
      <div>
        <h1>{ this.state.queue } ({ this.state.queueLength })</h1>

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
          url={this.props.url}
          currentPage={this.state.page}
          total={this.state.queueLength}
          perPage={this.state.perPage}
        />

      </div>
    )
  }
})
