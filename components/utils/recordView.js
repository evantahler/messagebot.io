import React from 'react'
import { Glyphicon, Form, FormGroup, FormControl, ControlLabel, Button, Col } from 'react-bootstrap'
import Link from 'next/link'
import Router from 'next/router'
import WordHelper from './wordHelper.js'
import LazyTable from './lazyTable.js'
import PointMap from './maps/pointMap.js'
import LazyIframe from './lazyIframe.js'
import Moment from 'moment'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      client: props.client,
      guid: this.props.guid,
      record: {},
      lists: [],
      recordType: this.props.recordType,
      renderableData: [
        'data',
        'personGuid',
        'eventGuid',
        'messageGuid',
        'location',
        'body',
        'campaignId'
      ]
    }
  }

  componentDidMount () {
    this.loadRecord()
  }

  deleteRecord () {
    const client = this.state.client
    if (
      confirm('are you sure?')
    ) {
      client.action({
        guid: this.state.guid
      }, '/api/' + this.state.recordType, 'DELETE', (data) => {
        Router.push('/' + WordHelper.pluralize(this.state.recordType) + '/recent')
      }, (error) => this.props.updateError(error))
    }
  }

  loadRecord (attempts, lastError) {
    const client = this.state.client

    client.action({
      guid: this.state.guid
    }, '/api/' + this.state.recordType, 'GET', (data) => {
      this.setState({
        record: data[this.state.recordType]
      }, () => {
        if (data.lists) { this.setState({lists: data.lists}) }
      })
    }, (error) => this.props.updateError(error))
  }

  render () {
    return (
      <div>
        <h1>Record #{this.state.guid}</h1>
        <p className='text-warning'>Delete this {this.state.recordType}: <Glyphicon onClick={this.deleteRecord} glyph='remove' /></p>

        <ul>
          {
            Object.keys(this.state.record).map((key) => {
              const value = this.state.record[key]
              const title = WordHelper.titleize(key)

              // special data we can render
              if (key === 'createdAt' || key === 'updatedAt') {
                let d = new Date(Date.parse(value))
                return <li key={key}><strong>{title}: </strong>{ Moment(d).calendar() }</li>
              } else if (key === 'location') {
                return <li key={key}><strong>Location:</strong> {JSON.stringify(value)}</li>
              }

              if (key === 'personGuid' && value) {
                return <li key={key}><Link href={`/person/${value}`}><a><strong>{title}: </strong>{value}</a></Link></li>
              } else if (key === 'eventGuid' && value) {
                return <li key={key}><Link href={`/event/${value}`}><a><strong>{title}: </strong>{value}</a></Link></li>
              } else if (key === 'messageGuid' && value) {
                return <li key={key}><Link href={`/message/${value}`}><a><strong>{title}: </strong>{value}</a></Link></li>
              } else if (key === 'listId' && value) {
                return <li key={key}><Link href={`/list/${value}`}><a><strong>{title}: </strong>{value}</a></Link></li>
              } else if (key === 'campaignId' && value) {
                return <li key={key}><Link href={`/campaign/${value}/stats`}><a><strong>{title}: </strong>{value}</a></Link></li>
              } else if (this.state.renderableData.indexOf(key) < 0) {
                return <li key={key}><strong>{title}: </strong>{value}</li>
              }

              return null
            })
          }
        </ul>

        <br />

        <DataRowTable
          client={this.state.client}
          record={this.state.record}
          recordType={this.state.recordType}
          updateError={this.props.updateError}
          loadRecord={this.loadRecord.bind(this)}
        />

        <PointMap
          point={this.state.record.location}
          name={'Most Recent Event'}
        />

        <ListsTable
          lists={this.state.lists}
        />

        <LazyIframe body={this.state.record.body || ''} />

      </div>
    )
  }
}

class ListsTable extends React.Component {
  render () {
    if (!this.props.lists || this.props.lists.length === 0) {
      return null
    }

    return (
      <div>
        <h2>Lists</h2>
        <LazyTable
          objects={this.props.lists}
        />
      </div>
    )
  }
}

class DataRowTable extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      client: props.client,
      record: (props.record || {}),
      pendingKey: '',
      pendingValue: '',
      dataRows: []
    }
  }

  componentWillReceiveProps (newProps) {
    this.setState({record: newProps.record}, () => {
      this.buildDataRows()
    })
  }

  handleEdit (row) {
    const client = this.state.client

    let newData = {}
    newData[row.id] = row.value
    client.action({
      guid: this.state.record.guid,
      data: JSON.stringify(newData)
    }, '/api/' + this.props.recordType, 'PUT', (data) => {
      this.setState({
        record: data[this.props.recordType]
      }, () => this.buildDataRows())
    }, (error) => this.props.updateError(error))
  }

  handleDestroy (event) {
    const client = this.state.client

    let newData = {}
    newData[event.target.id] = '_delete'
    client.action({
      guid: this.state.record.guid,
      data: JSON.stringify(newData)
    }, '/api/' + this.props.recordType, 'PUT', (data) => {
      this.props.loadRecord()
    }, (error) => this.props.updateError(error))
  }

  updatePendingKey (event) {
    this.setState({pendingKey: event.target.value})
  }

  updatePendingValue (event) {
    this.setState({pendingValue: event.target.value})
  }

  addAttribute (event) {
    event.preventDefault()
    const client = this.state.client

    if (this.state.pendingKey === '' || this.state.pendingValue === '') { return }

    let newData = {}
    newData[this.state.pendingKey] = this.state.pendingValue

    client.action({
      guid: this.state.record.guid,
      data: JSON.stringify(newData)
    }, '/api/' + this.props.recordType, 'PUT', (data) => {
      this.setState({
        record: data[this.props.recordType],
        pendingKey: '',
        pendingValue: ''
      }, () => this.buildDataRows())
    }, (error) => this.props.updateError(error))
  }

  buildDataRows () {
    const record = this.state.record

    let dataRows = []
    let sortedKeys = []

    if (!record || !record.data) { return }

    sortedKeys = Object.keys(record.data).sort()
    sortedKeys.forEach(function (key) {
      dataRows.push({
        id: key,
        value: record.data[key]
      })
    })

    this.setState({dataRows: dataRows})
  }

  render () {
    return (
      <div>
        <LazyTable
          objects={this.state.dataRows}
          idName={'Key'}
          inlineEdit={{value: this.handleEdit.bind(this)}}
          destroy={this.handleDestroy.bind(this)}
        />

        <br />
        <p>Add Attribute:</p>

        <Form onSubmit={this.addAttribute.bind(this)} horizontal>
          <FormGroup>
            <Col componentClass={ControlLabel} md={2}>
              <strong>Key:</strong>
            </Col>
            <Col md={10}>
              <FormControl value={this.state.pendingKey} type='text' placeholder='key' onChange={this.updatePendingKey.bind(this)} />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col componentClass={ControlLabel} md={2}>
              <strong>Value:</strong>
            </Col>
            <Col md={10}>
              <FormControl value={this.state.pendingValue} type='text' placeholder='value' onChange={this.updatePendingValue.bind(this)} />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col mdOffset={2} md={10}>
              <Button type='submit'>Add Attribute</Button>
            </Col>
          </FormGroup>
        </Form>
      </div>
    )
  }
}
