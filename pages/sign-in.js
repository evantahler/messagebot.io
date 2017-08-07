import React from 'react'
import { Row, Col, Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap'
import Router from 'next/router'
import Page from './../components/layouts/page.js'
import Client from './../components/utils/client.js'

export default class extends React.Component {
  constructor () {
    super()
    this.state = {
      client: new Client(),
      password: '',
      email: '',
      error: null
    }
  }

  submit (event) {
    event.preventDefault()
    const client = this.state.client

    client.action(this.state, '/api/session', 'POST', (data) => {
      client.set('personGuid', data.user.personGuid)
      Router.push({pathname: '/dashboard'})
    }, (error) => {
      this.setState({error})
    })
  }

  handleChange (event) {
    let change = {}
    change[event.target.id] = event.target.value
    this.setState(change)
  }

  render () {
    return (
      <Page client={this.state.client} error={this.state.error}>
        <Row>

          <Col md={12}>
            <h1>Sign In</h1>
            <form onSubmit={this.submit.bind(this)}>
              <FormGroup controlId='email'>
                <ControlLabel>Email</ControlLabel>
                <FormControl
                  type='text'
                  value={this.state.email}
                  onChange={this.handleChange.bind(this)}
                />
              </FormGroup>

              <FormGroup controlId='password'>
                <ControlLabel>Password</ControlLabel>
                <FormControl
                  type='password'
                  value={this.state.password}
                  onChange={this.handleChange.bind(this)}
                />
              </FormGroup>

              <Button type='submit'>Sign In</Button>
            </form>
          </Col>
        </Row>
      </Page>
    )
  }
}
