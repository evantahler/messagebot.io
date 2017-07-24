import React from 'react'
import ResquePage from './../../../components/layouts/resque/page.js'
import Client from './../../../components/utils/client.js'
import Link from 'next/link'
import { Row, Col } from 'react-bootstrap'
import ReactHighcharts from 'react-highcharts'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      client: new Client(),
      error: null,
      timer: null,
      refreshInterval: 10,
      queues: {},
      workers: [],
      stats: {},
      counts: {
        queues: 0,
        workers: 0,
        failed: 0
      },
      chartConfig: {
        chart: {
          type: 'spline'
        },
        title: 'null',
        xAxis: {
          type: 'datetime',
          tickPixelInterval: 150
        },
        yAxis: {
          title: {
            text: 'Queue Length'
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }]
        },
        legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          floating: true
        },
        exporting: {enabled: true},
        series: []
      }
    }
  }

  updateRefeshInterval (refreshInterval) {
    this.setState({refreshInterval}, () => {
      this.loadDetails()
    })
  }

  componentDidMount () {
    this.loadDetails()
  }

  componentWillUnmount () {
    clearTimeout(this.state.timer)
  }

  loadFailedCount () {
    const client = this.state.client
    client.action({}, '/api/resque/resqueFailedCount', 'GET', (data) => {
      let counts = this.state.counts
      counts.failed = data.failedCount
      this.setState({counts: counts})
    })
  }

  loadDetails () {
    clearTimeout(this.state.timer)

    if (this.state.refreshInterval > 0) {
      let timer = setTimeout(() => {
        this.loadDetails()
      }, (this.state.refreshInterval * 1000))
      this.setState({timer: timer})
    }

    const client = this.state.client

    client.action({}, '/api/resque/resqueDetails', 'GET', (data) => {
      let counts = this.state.counts
      counts.queues = Object.keys(data.resqueDetails.queues).length
      counts.workers = Object.keys(data.resqueDetails.workers).length
      this.setState({
        queues: data.resqueDetails.queues,
        stats: data.resqueDetails.stats,
        counts: counts
      }, () => {
        this.loadFailedCount()

        Object.keys(this.state.queues).forEach((q) => {
          let found = false
          let point = {x: new Date().getTime(), y: this.state.queues[q].length}
          this.state.chartConfig.series.forEach((s) => {
            if (s.name === q) {
              found = true
              s.data.push(point)
              while (s.data.length > 100) { s.data.shift() }
            }
          })
          if (!found) {
            this.state.chartConfig.series.push({
              name: q,
              animation: false,
              data: [point]
            })
          }
        })

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
      })
    })
  }

  render () {
    return (
      <ResquePage
        loggedIn
        client={this.state.client}
        error={this.state.error}
        refreshInterval={this.state.refreshInterval}
        updateRefeshInterval={this.updateRefeshInterval.bind(this)}
      >
        <h1>Resque Overview</h1>

        <Row>
          <Col md={3}>
            <h2>Stats:</h2>
            <table className='table table-hover'>
              <tbody>

                {
                  Object.keys(this.state.stats).map((k) => {
                    let v = this.state.stats[k]
                    if (k.indexOf(':') > 0) { return null }

                    return (
                      <tr key={k}>
                        <td>{k}</td>
                        <td>{v}</td>
                      </tr>
                    )
                  })
                }

              </tbody>
            </table>
          </Col>
          <Col md={9}>
            <ReactHighcharts
              isPureConfig={false}
              ref='chart'
              config={this.state.chartConfig}
              domProps={{
                style: {
                  minWidth: '310px',
                  height: '300px',
                  margin: '0'
                }
              }} />
          </Col>
        </Row>

        <Row>
          <Col md={4}>
            <h2>Queues ({ this.state.counts.queues })</h2>

            <table className='table table-striped table-hover '>
              <thead>
                <tr>
                  <th>Queue Name</th>
                  <th>Jobs</th>
                </tr>
              </thead>
              <tbody>
                <tr className={this.state.counts.failed > 0 ? 'danger' : ''}>
                  <td><strong><Link href='/system/resque/failed'><a>failed</a></Link></strong></td>
                  <td><strong>{ this.state.counts.failed || 0 }</strong></td>
                </tr>

                {
                  Object.keys(this.state.queues).map((q) => {
                    return (
                      <tr key={q}>
                        <td><Link href={`/system/resque/queue/${q}`}><a>{ q }</a></Link></td>
                        <td>{this.state.queues[q].length}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </Col>

          <Col md={8}>
            <h2>Workers ({ this.state.counts.workers })</h2>

            <table className='table table-striped table-hover '>
              <thead>
                <tr>
                  <th>Worker Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>

                {
                Object.keys(this.state.workers).map((name) => {
                  let worker = this.state.workers[name]
                  return (
                    <tr key={name}>
                      <td><span className={worker.delta > 0 ? 'text-success' : ''}>{ name }</span></td>
                      <td><span className={worker.delta > 0 ? 'text-success' : ''}>{ worker.statusString }</span></td>
                    </tr>
                  )
                })
              }
              </tbody>
            </table>
          </Col>
        </Row>

      </ResquePage>
    )
  }
}
