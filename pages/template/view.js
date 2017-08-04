import React from 'react'
import Page from './../../components/layouts/page.js'
import Client from './../../components/utils/client.js'
import Router from 'next/router'
import { Row, Col, Button } from 'react-bootstrap'
import LazyIframe from './../../components/utils/lazyIframe.js'
import CodeEditor from './../../components/utils/codeEditor.js'
import JSONTree from 'react-json-tree'

export default class extends React.Component {
  constructor () {
    super()
    this.state = {
      client: new Client(),
      error: null,
      successMessage: null,
      templateId: 0,
      personGuid: 0,
      template: {template: ''},
      view: {},
      render: ''
    }
  }

  componentDidMount () {
    let templateId = Router.query.page

    this.setState({templateId}, () => {
      this.loadUser(() => {
        this.loadTemplate()
        this.loadView()
      })
    })
  }

  loadUser (callback) {
    const client = this.state.client
    client.action({}, '/api/user', 'GET', (data) => {
      this.setState({personGuid: data.user.personGuid}, callback)
    }, (error) => this.setState({error}))
  }

  loadTemplate () {
    const client = this.state.client
    client.action({templateId: this.state.templateId}, '/api/template', 'GET', (data) => {
      this.setState({template: data.template})
    }, (error) => { this.setState({error}) })
  }

  loadView () {
    const client = this.state.client

    if (!this.state.personGuid) {
      return
    }

    let params = {
      templateId: this.state.templateId,
      personGuid: this.state.personGuid,
      trackBeacon: false
    }

    if (this.state.template.template && this.state.template.template !== '') {
      params.temporaryTemplate = this.state.template.template
    }

    client.action(params, '/api/template/render', 'GET', (data) => {
      this.setState({ view: data.view })
    }, (error) => { this.setState({error}) })

    let HTMLoptions = {
      credentials: 'include',
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(params)
    }

    const parent = this
    fetch(client.apiEndpoint() + '/api/template/render.html', HTMLoptions).then((response) => {
      response.text().then((body) => {
        parent.setState({render: body})
      })
    }).catch((error) => { this.setState({error}) })
  }

  updateTemplate () {
    const client = this.state.client
    let template = this.state.template
    template.templateId = this.state.template.id

    this.setState({template: template}, () => {
      client.action(this.state.template, '/api/template', 'PUT', (data) => {
        this.setState({successMessage: 'success'})
        this.loadTemplate()
        this.loadView()
      }, (error) => { this.setState({error}) })
    })
  }

  handleInlineChange (event) {
    let template = this.state.template
    template[event.target.id] = event.target.value
    this.setState({template: template})
  }

  editorUpdate (newBody) {
    let template = this.state.template
    if (!newBody || newBody === '') { return }
    template.template = newBody
    this.setState({template: template})
  }

  changePersonGuid (event) {
    this.setState({personGuid: event.target.value})
  }

  render () {
    let template = this.state.template
    let view = this.state.view

    return (
      <Page loggedIn client={this.state.client} error={this.state.error} successMessage={this.state.successMessage}>
        <h1>Edit Template: <input value={template.name || ''} id='name' onChange={this.handleInlineChange.bind(this)} /></h1>
        <p>
          Description: <input size='50' type='text' value={template.description || ''} id='description' onChange={this.handleInlineChange.bind(this)} />
        </p>

        <Button onClick={this.updateTemplate.bind(this)}>Save Changes</Button>{` `}

        <hr />

        <Row>
          <Col md={12}>
            <h3>Template</h3>

            <CodeEditor
              value={template.template || ''}
              onValueChange={this.editorUpdate.bind(this)}
            />

            <hr />
          </Col>

          <Col md={6}>
            <p>You can use mustache templates to render person or event attributes: <code>Hello, {`{{person.data.firstName}}`}</code>.  The variables available to you are listed below.</p>
            <p>To track links, use mustache function <em>track</em> to transform URLs into tracked URLs: <code>{`{{#track}}https://link/to/stuff{{/track}}`}</code>.</p>
            <p>To include a beacon image, include <em>beacon</em> in your body, using tripple mustache <code>{`{{{beacon}}}`}</code>.</p>
            <p>To include a partial template in this one, use the <em>render</em> mustache function with the name of ID of the template you wisth to include: <code>{`{{#include}}footer{{/include}}`}</code></p>
            <p>Use the <em>optOutLink</em> mustache function to option the link to the opt-out URL.  With no arguments it will direct to the default page, but you can supply your own: <code>{`click <a href="{{#optOutLink}}{{/optOutLink}}">here</a> to opt-out`}</code>.</p>

            <hr />

            <h3>Variables</h3>
            <div>
              <JSONTree data={view} hideRoot />
            </div>
          </Col>

          <Col md={6}>
            <h3>Preview</h3>
            <p>personGuid: <input type='text' value={this.state.personGuid || ''} onChange={this.changePersonGuid.bind(this)} /></p>
            <Button onClick={this.loadView.bind(this)}>Reload Preview</Button>

            <hr />

            <LazyIframe body={this.state.render || ''} />
          </Col>
        </Row>
      </Page>
    )
  }
}
