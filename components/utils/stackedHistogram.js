import React from 'react'
import { Row, Col, FormGroup, ControlLabel, FormControl } from 'react-bootstrap'
import ReactHighcharts from 'react-highcharts'
import Datetime from 'react-datetime'
import WordHelper from './wordHelper.js'

export default class extends React.Component {
  // requires:
  // `this.props.section`: The name of the thing we are reasoning about (people, messages, etc)
  // `this.props.client`: ActionHero Client
  // `this.props.start` (defalut '1 month ago')
  // `this.props.end` (defalut 'now')
  // `this.props.updateError` error callback

  constructor (props) {
    super(props)
    this.state = {
      client: this.props.client,
      possibleIntervals: ['year', 'month', 'date'],
      interval: 'date',
      start: (new Date(new Date().setMonth(new Date().getMonth() - 1))),
      end: (new Date()),
      config: {}
    }
  }

  componentDidMount () {
    this.loadHistogram()
  }

  updateHistogramRange (event) {
    this.setState({interval: event.target.value}, () => {
      this.loadHistogram()
    })
  }

  updateHistogramStart (date) {
    this.setState({start: date.toDate()}, () => {
      this.loadHistogram()
    })
  }

  updateHistogramEnd (date) {
    this.setState({end: date.toDate()}, () => {
      this.loadHistogram()
    })
  }

  loadHistogram () {
    const client = this.state.client
    let searchKeys = ['guid']
    let searchValues = ['%']

    client.action({
      searchKeys: searchKeys,
      searchValues: searchValues,
      interval: this.state.interval,
      start: this.state.start.getTime(),
      end: this.state.end.getTime()
    }, '/api/' + this.props.section + '/aggregation', 'GET', (data) => {
      let datas = {}
      Object.keys(data.aggregations).forEach((date) => {
        Object.keys(data.aggregations[date]).forEach((agg) => {
          if (!datas[agg]) { datas[agg] = [] }
          let point = {x: new Date(date), y: data.aggregations[date][agg]}
          datas[agg].push(point)
        })
      })

      let series = []
      Object.keys(datas).forEach((agg) => {
        let seriesData = {
          name: agg,
          type: 'column',
          data: datas[agg]
        }
        series.push(seriesData)
      })

      const config = {
        global: { useUTC: false },
        credits: { enabled: false },
        chart: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)'
        },
        plotOptions: {
          column: {
            stacking: 'normal'
          }
        },
        title: {
          text: this.props.section,
          align: 'left'
        },
        xAxis: {
          type: 'datetime',
          tickPixelInterval: 150
        },
        yAxis: {
          title: { text: (this.props.section + ' created') },
          stackLabels: {
            enabled: true,
            style: {
              fontWeight: 'bold',
              color: 'gray'
            }
          }
        },
        legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'top',
          floating: true
        },
        series: series
      }

      this.setState({config})
    }, (error) => this.props.updateError(error))
  }

  render () {
    if (!this.state.config.series) { return null }

    return (
      <div>
        <h2>Histogram:</h2>

        <Row>
          <Col md={2}>
            <FormGroup>
              <ControlLabel>Interval</ControlLabel>
              <FormControl onChange={this.updateHistogramRange.bind(this)} value={this.state.interval} componentClass='select'>
                {
                  this.state.possibleIntervals.map((i) => {
                    return <option key={i} value={i}>{ WordHelper.titleize(i) }</option>
                  })
                }
              </FormControl>
            </FormGroup>
          </Col>

          <Col md={5}>
            <FormGroup>
              <ControlLabel>Start</ControlLabel>
              <Datetime value={this.state.start} onChange={this.updateHistogramStart.bind(this)} />
            </FormGroup>
          </Col>

          <Col md={5}>
            <FormGroup>
              <ControlLabel>End</ControlLabel>
              <Datetime value={this.state.end} onChange={this.updateHistogramEnd.bind(this)} />
            </FormGroup>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <ReactHighcharts
              isPureConfig
              ref='histogramChart'
              config={this.state.config}
              domProps={{
                style: {
                  minWidth: '310px',
                  height: '300px',
                  margin: '0'
                }
              }} />
          </Col>
        </Row>
      </div>
    )
  }
}
