import React from 'react'
import Router from 'next/router'
import Client from './../../components/utils/client.js'
import Page from './../../components/layouts/page.js'
import { Col, Form, Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap'
import RecordsList from './../../components/utils/recordsList.js'
import StackedHistogram from './../../components/utils/stackedHistogram.js'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      client: new Client(),
      error: null,
      section: 'messages',
      query: (props.query || ''),
      pendingQuery: '',
      topLevelSearchTerms: ['personGuid', 'campaignGuid', 'transport', 'body']
    }
  }

  componentDidMount () {
    let query = Router.query.query ? unescape(Router.query.query) : this.state.query
    this.setState({query: query, pendingQuery: query})
  }

  updateError (error) {
    this.setState({error})
  }

  doSearch (event) {
    event.preventDefault()
    this.setState({query: this.state.pendingQuery})
  }

  updateQuery (event) {
    this.setState({pendingQuery: event.target.value})
  }

  render () {
    return (
      <Page loggedIn client={this.state.client} error={this.state.error}>
        <h1>Messages</h1>

        <Form onSubmit={this.doSearch.bind(this)} horizontal>
          <FormGroup>
            <Col componentClass={ControlLabel} md={2}>
              <strong>Query:</strong>
              <p><em>(use % for wildcards)</em></p>
            </Col>
            <Col md={10}>
              <FormControl value={this.state.pendingQuery} type='text' placeholder='key:value, otherKey:otherValue' onChange={this.updateQuery.bind(this)} />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col mdOffset={2} md={10}>
              <Button type='submit'>Search</Button>
            </Col>
          </FormGroup>
        </Form>

        <StackedHistogram
          section={this.state.section}
          client={this.state.client}
          query={this.state.query}
          topLevelSearchTerms={this.state.topLevelSearchTerms}
          updateError={this.updateError.bind(this)}
        />

        <RecordsList
          section={this.state.section}
          client={this.state.client}
          query={this.state.query}
          topLevelSearchTerms={this.state.topLevelSearchTerms}
          updateError={this.updateError.bind(this)}
        />

      </Page>
    )
  }
}
