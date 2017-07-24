import React from 'react'
import { Row, Col } from 'react-bootstrap'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      client: props.client,
      workers: {},
      workerQueues: [],
      counts: {}
    }
  }

  componentDidMount () {
    this.loadWorkers()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.latestTick) { this.loadWorkers() }
  }

  loadWorkers () {
    const client = this.state.client

    client.action({}, '/api/resque/resqueDetails', 'GET', (data) => {
      this.setState({
        counts: {
          workers: Object.keys(data.resqueDetails.workers).length
        }
      }, () => {
        this.setState({chartConfig: this.state.chartConfig})

        Object.keys(data.resqueDetails.workers).forEach((workerName) => {
          var worker = data.resqueDetails.workers[workerName]
          if (typeof worker === 'string') {
            data.resqueDetails.workers[workerName] = {
              status: worker,
              statusString: worker
            }
          } else {
            worker.delta = Math.round((new Date().getTime() - new Date(worker.run_at).getTime()) / 1000)
            worker.statusString = 'working on ' + worker.queue + '#' + worker.payload.class + ' for ' + worker.delta + 's'
          }
        })

        this.setState({workers: data.resqueDetails.workers})

        this.loadWorkerQueues()
      })
    }, (error) => { this.props.updateError(error) })
  }

  loadWorkerQueues () {
    const client = this.state.client

    client.action({}, '/api/resque/loadWorkerQueues', 'GET', (data) => {
      let workerQueues = []
      Object.keys(data.workerQueues).forEach((workerName) => {
        let parts = workerName.split(':')
        let id = parts.pop()
        let host = parts.join(':')
        let queues = data.workerQueues[workerName].split(',')

        let worker = {}
        if (this.state.workers[workerName]) {
          worker = this.state.workers[workerName]
        }

        workerQueues.push({
          id: id, host: host, queues: queues, worker: worker, workerName: workerName
        })
      })

      this.setState({workerQueues: workerQueues})
    }, (error) => { this.props.updateError(error) })
  }

  forceCleanWorker (workerName) {
    const client = this.state.client

    if (confirm('Are you sure?')) {
      client.action({workerName: workerName}, '/api/resque/forceCleanWorker', 'POST', (data) => {
        this.loadWorkers()
      }, (error) => { this.props.updateError(error) })
    }
  }

  render () {
    return (
      <div>
        <h1>Workers ({ this.state.counts.workers })</h1>

        <Row>
          <Col md={12}>

            <table className='table table-striped table-hover '>
              <thead>
                <tr>
                  <td><strong>ID</strong></td>
                  <td><strong>Host</strong></td>
                  <td><strong>Queues</strong></td>
                  <td><strong>Status</strong></td>
                  <td>&nbsp;</td>
                </tr>
              </thead>
              <tbody>
                {
                  this.state.workerQueues.map((w) => {
                    return (
                      <tr key={w.workerName}>
                        <td>{ w.id }</td>
                        <td>{ w.host }</td>
                        <td>
                          <ul>
                            {
                              w.queues.map((q) => {
                                return (
                                  <li key={`${w}-${q}`}>{ q }</li>
                                )
                              })
                            }
                          </ul>
                        </td>
                        <td><span className={w.worker.delta > 0 ? 'text-success' : ''}>{ w.worker.statusString }</span></td>
                        <td><button onClick={this.forceCleanWorker.bind(this, w.workerName)} className='btn btn-xs btn-danger'>Remove Worker</button></td>
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
