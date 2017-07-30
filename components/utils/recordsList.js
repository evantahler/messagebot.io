import React from 'react'
import Router from 'next/router'
import WordHelper from './wordHelper.js'
import PaginationHelper from './paginationHelper.js'
import LazyTable from './lazyTable.js'
import PointMap from './maps/pointMap.js'

export default class extends React.Component {
  // requires:
  // `this.props.section`: The name of the thing we are reasoning about (people, messages, etc)
  // `this.props.client`: ActionHero Client
  // `this.props.perPage` (defalut 25)
  // `this.props.updateError` error callback
  // `this.props.topLevelSearchTerms` terms which should have data. appended to them for search
  // `this.props.query` key-value format query statement

  constructor (props) {
    super(props)
    this.state = {
      client: this.props.client,
      query: null,
      total: 0,
      records: [],
      points: [],
      page: 0,
      perPage: (props.perPage || 25)
    }
  }

  componentDidMount () {
    let page = Router.query.page ? parseInt(Router.query.page) : this.state.page
    this.setState({page}, () => this.loadRecent())
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.query && nextProps.query !== this.state.query) {
      this.setState({query: nextProps.query, page: 0}, () => {
        this.updatePage(this.state.page)
      })
    }
  }

  updatePage (page) {
    let pathname = window.location.pathname
    pathname = pathname.replace(/\/$/, '')
    pathname = pathname.replace(/\/\d*$/, '')
    pathname = pathname.replace(`/${this.state.page}`, '')
    pathname += `/${page}`
    if (this.state.query) { pathname += `?query=${this.state.query}` }
    window.history.pushState({}, null, pathname)
    this.setState({page}, () => this.loadRecent())
  }

  loadRecent () {
    const client = this.state.client

    let searchKeys = ['guid']
    let searchValues = ['%']

    if (this.state.query && this.state.query.length > 2) {
      searchKeys = []
      searchValues = []
      this.state.query.split(' ').forEach((chunk) => {
        if (chunk.length > 2) {
          let [k, v] = chunk.split(':')
          if (this.props.topLevelSearchTerms.indexOf(k) < 0) { k = `data.${k}` }
          searchKeys.push(k)
          searchValues.push(v)
        }
      })
    }

    client.action({
      searchKeys: searchKeys,
      searchValues: searchValues,
      from: (this.state.page * this.state.perPage),
      size: this.state.perPage
    }, '/api/' + this.props.section + '/search', 'GET', (data) => {
      let cleanedData = []
      let points = []
      data[this.props.section].forEach(function (record) {
        delete record.body

        cleanedData.push(record)

        if (record.lat && record.lng) {
          points.push({
            name: record.guid,
            lat: record.lat,
            lng: record.lng
          })
        }
      })

      this.setState({
        total: data.total,
        points: points,
        records: cleanedData
      })
    }, (error) => this.props.updateError(error))
  }

  render () {
    let title = 'Recent'

    return (
      <div>
        <h2>{title} { WordHelper.titleize(this.props.section) } ({ this.state.total } total)</h2>

        <PointMap section={this.props.section} points={this.state.points} client={this.state.client} />

        <LazyTable
          recordType={WordHelper.singleize(this.props.section)}
          objects={this.state.records}
        />

        <PaginationHelper
          currentPage={this.state.page}
          total={this.state.total}
          perPage={this.state.perPage}
          updatePage={this.updatePage.bind(this)}
        />
      </div>
    )
  }
}
