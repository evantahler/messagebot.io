import React from 'react'
import Link from 'next/link'
import { Navbar, Nav, Glyphicon, NavDropdown, MenuItem } from 'react-bootstrap'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      navigation: props.navigation ? props.navigation : []
    }
  }

  componentDidMount () {
    const client = this.props.client

    if ((!process || process.browser) && this.state.navigation.length === 0) {
      // TODO: Cache this
      client.action({}, '/api/system/navigation', 'GET', (data) => {
        this.setState({navigation: data.navigation})
      })
    }
  }

  render () {
    let counter = 0

    return (
      <header>
        <Navbar>
          <NavHeaderAndIcon loggedIn={this.props.loggedIn} />
          <Navbar.Collapse>
            <Nav pullRight />
            {
              this.state.navigation.map((group) => {
                counter++
                return (
                  <NavGroup key={counter} group={group} loggedIn={this.props.loggedIn} />
                )
              })
            }
          </Navbar.Collapse>
        </Navbar>
      </header>
    )
  }
}

class NavHeaderAndIcon extends React.Component {
  render () {
    return (
      <Navbar.Header>
        <Navbar.Brand>
          {
            this.props.loggedIn
            ? <Link href='/dashboard'><a><div style={{margin: 15}}>MessageBot</div></a></Link>
            : <Link href='/'><a><div style={{margin: 15}}>MessageBot</div></a></Link>
          }
        </Navbar.Brand>
        <Navbar.Toggle />
      </Navbar.Header>
    )
  }
}

class NavGroup extends React.Component {
  render () {
    let group = this.props.group
    let key = `navDropdown-${group.title}`
    let counter = 0
    let loggedIn = this.props.loggedIn ? this.props.loggedIn : false

    // do not render the goup if it is for the other type of user
    if (loggedIn !== group.loggedIn) { return null }

    let navOpts = {}
    if (group.align === 'right') { navOpts.pullRight = true } else { navOpts.pullLeft = true }

    let title = <span><Glyphicon glyph={group.glyphicon} /> {group.title}</span>

    return (
      <Nav {...navOpts} key={key} >
        <NavDropdown title={title} id={key} >
          {
            group.elements.map((element) => {
              counter++
              if (element.divider === true) {
                return <MenuItem divider key={`${key}_${counter}`} />
              }
              return (
                <Link href={element.route} key={`${key}_${counter}`} >
                  <MenuItem><Glyphicon glyph={element.glyphicon} /> {element.title}</MenuItem>
                </Link>
              )
            }
          )}
        </NavDropdown>
      </Nav>
    )
  }
}
