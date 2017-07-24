import React from 'react'
import { Row, Col } from 'react-bootstrap'
import PaginationHelper from './../utils/paginationHelper.js'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      client: props.client,
      latestTick: 0,
      timestamps: [],
      delayedjobs: {},
      counts: {},
      perPage: 50,
      page: 0
    }
  }

  componentDidMount () {
    this.loadDelayedJobs()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.latestTick && this.state.latestTick < nextProps.latestTick) {
      this.setState({latestTick: nextProps.latestTick})
      this.loadDelayedJobs()
    }
  }

  loadDelayedJobs () {
    const client = this.state.client

    client.action({
      start: (this.state.page * this.state.perPage),
      stop: ((this.state.page * this.state.perPage) + (this.state.perPage - 1))
    }, '/api/resque/delayedjobs', 'GET', (data) => {
      let timestamps = []
      if (data.delayedjobs) {
        Object.keys(data.delayedjobs).forEach(function (t) {
          timestamps.push({
            date: new Date(parseInt(t, 10)),
            key: t
          })
        })
      }

      this.setState({
        counts: {timestamps: data.timestampsCount},
        delayedjobs: data.delayedjobs,
        timestamps: timestamps
      })
    }, (error) => { this.props.updateError(error) })
  }

  delDelayed (timestamp, count) {
    const client = this.props.client

    if (confirm('Are you sure?')) {
      client.action({
        timestamp: timestamp,
        count: count
      }, '/api/resque/delDelayed', 'POST', (data) => {
        this.loadDelayedJobs()
      }, (error) => { this.props.updateError(error) })
    }
  }

  runDelayed (timestamp, count) {
    const client = this.props.client

    client.action({
      timestamp: timestamp,
      count: count
    }, '/api/resque/runDelayed', 'POST', (data) => {
      this.loadDelayedJobs()
    }, (error) => { this.props.updateError(error) })
  }

  updatePage (page) {
    this.setState({page}, () => { this.loadDelayedJobs() })
  }

  render () {
    let argCounter = 0
    let index = 0

    return (
      <div>
        <h1>Delayed Jobs</h1>

        <Row>
          <Col md={12}>
            {
              this.state.timestamps.map((t) => {
                index = -1
                return (
                  <div key={t.date.getTime()} className='panel panel-primary'>
                    <div className='panel-heading'>
                      <h3 className='panel-title'>{ t.date.toString() }</h3>
                    </div>
                    <div className='panel-body'>

                      <table className='table table-striped table-hover'>
                        <thead>
                          <tr>
                            <td><strong>Class</strong></td>
                            <td><strong>Queue</strong></td>
                            <td><strong>Arguments</strong></td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            this.state.delayedjobs[t.key].map((job) => {
                              index++
                              return (
                                <tr key={`${t.date.getTime()}-${job.queue}-${JSON.stringify(job.args)}`}>
                                  <td>{ job.class }</td>
                                  <td>{ job.queue }</td>
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
                                  <td width='100'><button onClick={this.runDelayed.bind(this, t.key, index)} className='btn btn-xs btn-warning'>Run Now</button></td>
                                  <td width='100'><button onClick={this.delDelayed.bind(this, t.key, index)} className='btn btn-xs btn-danger'>Remove</button></td>
                                </tr>
                              )
                            })
                          }
                        </tbody>
                      </table>

                    </div>
                  </div>
                )
              })
            }

            <PaginationHelper
              updatePage={this.updatePage.bind(this)}
              currentPage={this.state.page}
              total={this.state.counts.timestamps}
              perPage={this.state.perPage}
            />

          </Col>
        </Row>
      </div>
    )
  }
}
